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
const style = document.createElement('style');
style.textContent = `
    .page-header {
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: var(--white);
        padding: var(--spacing-2xl) 0;
        text-align: center;
    }
    
    .page-header h1 {
        color: var(--white);
        font-size: 2.5rem;
        margin-bottom: var(--spacing-sm);
    }
    
    .page-header .subtitle {
        font-size: 1.25rem;
        opacity: 0.95;
    }
    
    .contact-section {
        padding: var(--spacing-2xl) 0;
        background-color: var(--gray-100);
    }
    
    .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: var(--spacing-xl);
    }
    
    .contact-info-section {
        background-color: var(--white);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        height: fit-content;
    }
    
    .contact-info-section h2 {
        color: var(--primary-color);
        margin-bottom: var(--spacing-md);
    }
    
    .contact-info-section > p {
        color: var(--gray-600);
        margin-bottom: var(--spacing-lg);
        line-height: 1.6;
    }
    
    .contact-methods {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
    }
    
    .contact-method {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background-color: var(--gray-100);
        border-radius: var(--radius-md);
    }
    
    .method-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }
    
    .method-details h3 {
        color: var(--primary-color);
        margin-bottom: var(--spacing-xs);
        font-size: 1.125rem;
    }
    
    .method-details p {
        color: var(--gray-600);
        margin-bottom: 0.25rem;
    }
    
    .method-details a {
        color: var(--primary-color);
        font-weight: 600;
    }
    
    .method-details a:hover {
        text-decoration: underline;
    }
    
    .social-connect h3 {
        color: var(--primary-color);
        margin-bottom: var(--spacing-md);
    }
    
    .social-links-large {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }
    
    .social-links-large a {
        padding: var(--spacing-sm);
        background-color: var(--gray-100);
        border-radius: var(--radius-md);
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .social-links-large a:hover {
        background-color: var(--primary-color);
        color: var(--white);
    }
    
    .contact-forms-section {
        background-color: var(--white);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
    }
    
    .form-tabs {
        display: flex;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-lg);
        border-bottom: 2px solid var(--gray-200);
        overflow-x: auto;
    }
    
    .form-tab {
        padding: var(--spacing-sm) var(--spacing-md);
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.3s ease;
    }
    
    .form-tab:hover {
        color: var(--primary-color);
    }
    
    .form-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
    }
    
    .contact-form {
        display: none;
    }
    
    .contact-form.active {
        display: block;
    }
    
    .contact-form h3 {
        color: var(--primary-color);
        margin-bottom: var(--spacing-sm);
    }
    
    .contact-form > p {
        color: var(--gray-600);
        margin-bottom: var(--spacing-lg);
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
    }
    
    .form-group {
        margin-bottom: var(--spacing-md);
    }
    
    .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
        color: var(--gray-800);
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--gray-200);
        border-radius: var(--radius-md);
        font-size: 1rem;
        font-family: var(--font-secondary);
        transition: border-color 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--primary-color);
    }
    
    .form-group textarea {
        resize: vertical;
    }
    
    .btn-block {
        width: 100%;
    }
    
    .success-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-md);
    }
    
    .success-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: var(--success);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
    }
    
    .success-content p {
        font-size: 1.125rem;
        color: var(--gray-800);
        margin: 0;
    }
    
    @media (max-width: 968px) {
        .contact-grid {
            grid-template-columns: 1fr;
        }
        
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .form-tabs {
            flex-wrap: wrap;
        }
    }
`;
document.head.appendChild(style);
