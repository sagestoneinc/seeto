// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form tab switching
    const formTabs = document.querySelectorAll('.form-tab');
    const contactForms = document.querySelectorAll('.contact-form');
    
    formTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const formType = this.dataset.form;
            
            // Update active tab
            formTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            contactForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === formType + 'Form') {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // Check URL parameter for form type
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('type');
    
    if (formType) {
        const correspondingTab = document.querySelector(`[data-form="${formType}"]`);
        if (correspondingTab) {
            correspondingTab.click();
        }
    }
    
    // Property ID from URL
    const propertyId = urlParams.get('property');
    if (propertyId) {
        const tourTab = document.querySelector('[data-form="tour"]');
        if (tourTab) {
            tourTab.click();
        }
    }
    
    // Form submissions
    const forms = document.querySelectorAll('.contact-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(this);
        });
    });
});

function handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // In production, send to backend API
    console.log('Form submitted:', data);
    
    // Show success message
    showSuccessMessage(form);
    
    // Reset form
    form.reset();
}

function showSuccessMessage(form) {
    const formType = form.id.replace('Form', '');
    let message = '';
    
    switch(formType) {
        case 'general':
            message = 'Thank you for your message! We\'ll respond within 24 hours.';
            break;
        case 'tour':
            message = 'Tour request received! We\'ll confirm your appointment shortly.';
            break;
        case 'valuation':
            message = 'Valuation request submitted! Your report will be sent to your email.';
            break;
        case 'seller':
            message = 'Consultation request received! We\'ll contact you soon to schedule.';
            break;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <div class="success-content">
            <span class="success-icon">✓</span>
            <p>${message}</p>
        </div>
    `;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 2rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        text-align: center;
        max-width: 400px;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    `;
    document.body.appendChild(backdrop);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
        backdrop.remove();
    }, 3000);
}

// Add contact page styles
// Injected stylesheet removed: it was written against the retired navy-and-gold
// palette (--primary-color, --gray-200, and friends), which css/style.css no longer
// defines. Those rules resolved to nothing and rendered white text on a transparent
// background. Styling for these pages now lives in css/style.css.
