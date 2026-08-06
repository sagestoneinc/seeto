// Mortgage Calculator Logic
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mortgageForm');
    const calculateBtn = document.getElementById('calculateBtn');
    
    // Input elements
    const homePrice = document.getElementById('homePrice');
    const downPayment = document.getElementById('downPayment');
    const downPaymentPercent = document.getElementById('downPaymentPercent');
    const loanTerm = document.getElementById('loanTerm');
    const interestRate = document.getElementById('interestRate');
    const propertyTax = document.getElementById('propertyTax');
    const homeInsurance = document.getElementById('homeInsurance');
    const hoaFees = document.getElementById('hoaFees');
    const includePMI = document.getElementById('includePMI');
    
    // Sync down payment dollar amount and percentage
    homePrice.addEventListener('input', updateDownPaymentPercent);
    downPayment.addEventListener('input', updateDownPaymentPercent);
    downPaymentPercent.addEventListener('input', updateDownPaymentDollar);
    
    function updateDownPaymentPercent() {
        const price = parseFloat(homePrice.value) || 0;
        const down = parseFloat(downPayment.value) || 0;
        if (price > 0) {
            const percent = (down / price * 100).toFixed(2);
            downPaymentPercent.value = percent;
        }
    }
    
    function updateDownPaymentDollar() {
        const price = parseFloat(homePrice.value) || 0;
        const percent = parseFloat(downPaymentPercent.value) || 0;
        const down = (price * percent / 100).toFixed(0);
        downPayment.value = down;
    }
    
    // Calculate on button click
    calculateBtn.addEventListener('click', calculateMortgage);
    
    // Calculate on any input change
    form.addEventListener('input', calculateMortgage);
    
    // Initial calculation
    calculateMortgage();
    
    function calculateMortgage() {
        // Get input values
        const price = parseFloat(homePrice.value) || 0;
        const down = parseFloat(downPayment.value) || 0;
        const years = parseInt(loanTerm.value) || 30;
        const rate = parseFloat(interestRate.value) || 0;
        const annualTax = parseFloat(propertyTax.value) || 0;
        const annualInsurance = parseFloat(homeInsurance.value) || 0;
        const monthlyHOA = parseFloat(hoaFees.value) || 0;
        const usePMI = includePMI.checked;
        
        // Calculate loan amount
        const loanAmount = price - down;
        const downPercent = (down / price * 100).toFixed(2);
        
        // Calculate monthly interest rate and number of payments
        const monthlyRate = rate / 100 / 12;
        const numPayments = years * 12;
        
        // Calculate principal and interest payment (using amortization formula)
        let principalInterest = 0;
        if (monthlyRate > 0 && numPayments > 0) {
            principalInterest = loanAmount * 
                (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                (Math.pow(1 + monthlyRate, numPayments) - 1);
        } else {
            principalInterest = loanAmount / numPayments;
        }
        
        // Calculate monthly property tax and insurance
        const monthlyTax = annualTax / 12;
        const monthlyInsurance = annualInsurance / 12;
        
        // Calculate PMI (typically 0.5-1% of loan amount annually if down < 20%)
        let monthlyPMI = 0;
        if (usePMI && downPercent < 20) {
            monthlyPMI = (loanAmount * 0.0075) / 12; // 0.75% annually
        }
        
        // Calculate total monthly payment
        const totalMonthly = principalInterest + monthlyTax + monthlyInsurance + monthlyPMI + monthlyHOA;
        
        // Calculate total interest paid over life of loan
        const totalPaid = (principalInterest * numPayments);
        const totalInterest = totalPaid - loanAmount;
        const totalCost = totalPaid + (annualTax * years) + (annualInsurance * years) + (monthlyHOA * numPayments);
        
        // Update display
        document.getElementById('totalPayment').textContent = formatCurrency(totalMonthly);
        document.getElementById('principalInterest').textContent = formatCurrency(principalInterest);
        document.getElementById('monthlyPropertyTax').textContent = formatCurrency(monthlyTax);
        document.getElementById('monthlyInsurance').textContent = formatCurrency(monthlyInsurance);
        document.getElementById('monthlyPMI').textContent = formatCurrency(monthlyPMI);
        document.getElementById('monthlyHOA').textContent = formatCurrency(monthlyHOA);
        
        document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
        document.getElementById('downPaymentDisplay').textContent = `${formatCurrency(down)} (${downPercent}%)`;
        document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
        document.getElementById('totalPaid').textContent = formatCurrency(totalCost);
        
        // Show/hide PMI and HOA rows
        const pmiRow = document.getElementById('pmiRow');
        const hoaRow = document.getElementById('hoaRow');
        
        if (monthlyPMI > 0) {
            pmiRow.style.display = 'flex';
        } else {
            pmiRow.style.display = 'none';
        }
        
        if (monthlyHOA > 0) {
            hoaRow.style.display = 'flex';
        } else {
            hoaRow.style.display = 'none';
        }
        
        // Update chart (simple text-based visualization)
        updateChart(loanAmount, principalInterest, monthlyRate, numPayments);
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    function updateChart(loanAmount, payment, monthlyRate, totalPayments) {
        const canvas = document.getElementById('paymentChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw simple bar chart for first 10 years
        const years = Math.min(10, totalPayments / 12);
        const barWidth = width / (years * 2 + 1);
        
        let balance = loanAmount;
        const maxBarHeight = height - 40;
        
        for (let year = 0; year < years; year++) {
            let yearlyPrincipal = 0;
            let yearlyInterest = 0;
            
            for (let month = 0; month < 12 && balance > 0; month++) {
                const interestPayment = balance * monthlyRate;
                const principalPayment = payment - interestPayment;
                
                yearlyInterest += interestPayment;
                yearlyPrincipal += principalPayment;
                
                balance -= principalPayment;
            }
            
            const total = yearlyInterest + yearlyPrincipal;
            const principalHeight = (yearlyPrincipal / total) * maxBarHeight;
            const interestHeight = (yearlyInterest / total) * maxBarHeight;
            
            const x = (year * 2 + 1) * barWidth;
            
            // Draw interest (top, red)
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x, height - 30 - principalHeight - interestHeight, barWidth, interestHeight);
            
            // Draw principal (bottom, blue)
            ctx.fillStyle = '#1a5490';
            ctx.fillRect(x, height - 30 - principalHeight, barWidth, principalHeight);
            
            // Draw year label
            ctx.fillStyle = '#4b5563';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Yr ${year + 1}`, x + barWidth / 2, height - 10);
        }
        
        // Draw legend
        ctx.fillStyle = '#1a5490';
        ctx.fillRect(10, 10, 15, 15);
        ctx.fillStyle = '#4b5563';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Principal', 30, 22);
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(100, 10, 15, 15);
        ctx.fillStyle = '#4b5563';
        ctx.fillText('Interest', 120, 22);
    }
});

// Add calculator-specific styles
// Injected stylesheet removed: it was written against the retired navy-and-gold
// palette (--primary-color, --gray-200, and friends), which css/style.css no longer
// defines. Those rules resolved to nothing and rendered white text on a transparent
// background. Styling for these pages now lives in css/style.css.
