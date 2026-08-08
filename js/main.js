// Main JavaScript for Seeto Realty Website

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && navMenu.classList.contains('active')) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnToggle = mobileMenuToggle.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        }
    });
});

// Chatbot Widget
document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotWindow = document.querySelector('.chatbot-window');
    const chatbotClose = document.querySelector('.chatbot-close');
    
    if (chatbotToggle && chatbotWindow) {
        chatbotToggle.addEventListener('click', function() {
            chatbotWindow.style.display = chatbotWindow.style.display === 'none' ? 'block' : 'none';
        });
        
        if (chatbotClose) {
            chatbotClose.addEventListener('click', function() {
                chatbotWindow.style.display = 'none';
            });
        }
    }
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Form Validation Helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Add form validation to all forms
document.addEventListener('DOMContentLoaded', function() {
    // #contact-form has its own accessible validation below; the generic pass would
    // double-report and inject a second set of error nodes.
    const forms = document.querySelectorAll('form:not(#contact-form)');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const emailInputs = form.querySelectorAll('input[type="email"]');
            const phoneInputs = form.querySelectorAll('input[type="tel"]');
            const requiredInputs = form.querySelectorAll('[required]');
            
            // Clear previous error messages
            form.querySelectorAll('.error-message').forEach(msg => msg.remove());
            
            // Validate required fields
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                }
            });
            
            // Validate email fields
            emailInputs.forEach(input => {
                if (input.value && !validateEmail(input.value)) {
                    isValid = false;
                    showError(input, 'Please enter a valid email address');
                }
            });
            
            // Validate phone fields
            phoneInputs.forEach(input => {
                if (input.value && !validatePhone(input.value)) {
                    isValid = false;
                    showError(input, 'Please enter a valid phone number');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
});

function showError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'var(--seeto-red)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
    input.style.borderColor = 'var(--seeto-red)';
}

// Lazy Loading for Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Header Scroll Effect
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
    
    lastScrollTop = scrollTop;
});

// Animation on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .listing-card, .testimonial-card, .feature-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Search Form Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-form');
    
    if (searchForm) {
        // Store search preferences in localStorage
        searchForm.addEventListener('submit', function(e) {
            const formData = new FormData(searchForm);
            const searchParams = {};
            
            for (let [key, value] of formData.entries()) {
                if (value) {
                    searchParams[key] = value;
                }
            }
            
            localStorage.setItem('lastSearch', JSON.stringify(searchParams));
        });
        
        // Load last search if available
        const lastSearch = localStorage.getItem('lastSearch');
        if (lastSearch && window.location.pathname.includes('search.html')) {
            const params = JSON.parse(lastSearch);
            Object.keys(params).forEach(key => {
                const input = searchForm.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = params[key];
                }
            });
        }
    }
});

// Price Range Formatter
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(price);
}

// Apply price formatting to all price elements
document.addEventListener('DOMContentLoaded', function() {
    const priceElements = document.querySelectorAll('[data-price]');
    priceElements.forEach(el => {
        const price = parseFloat(el.dataset.price);
        if (!isNaN(price)) {
            el.textContent = formatPrice(price);
        }
    });
});

// Cookie Consent (Simple Implementation)
document.addEventListener('DOMContentLoaded', function() {
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent) {
        // Create cookie consent banner
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
            <button onclick="acceptCookies()" class="btn btn-primary">Accept</button>
        `;
        document.body.appendChild(banner);
    }
});

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    const banner = document.querySelector('.cookie-banner');
    if (banner) {
        banner.remove();
    }
}

// Newsletter Subscription Handler
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (validateEmail(email)) {
        // Here you would normally send to your backend
        alert('Thank you for subscribing to our newsletter!');
        e.target.reset();
    } else {
        alert('Please enter a valid email address.');
    }
}

// Add to all newsletter forms
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', handleNewsletterSubmit);
    });
});

// Export functions for use in other scripts
window.SeetoRealty = {
    validateEmail,
    validatePhone,
    formatPrice,
    acceptCookies
};

/* ============================================================
   Contact form
   Two paths, chosen by data-endpoint on the form:
     - endpoint set  -> POST JSON to a hosted form handler, with real
                        loading / success / error states.
     - endpoint empty -> compose a pre-filled email to data-email and open
                        the visitor's mail client. Not as slick, but the
                        message actually reaches a person instead of being
                        silently discarded, which is what action="#" did.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('contact-status');
  const submit = document.getElementById('contact-submit');
  const note = document.getElementById('contact-fallback-note');
  const endpoint = (form.dataset.endpoint || '').trim();
  const email = (form.dataset.email || '').trim();

  if (endpoint && note) note.hidden = true;

  const setStatus = (text, state) => {
    status.textContent = text;
    status.dataset.state = state || '';
  };

  const showError = (field, message) => {
    const el = document.getElementById(field.id + '-error');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', el.id);
  };

  const clearError = (field) => {
    const el = document.getElementById(field.id + '-error');
    if (el) { el.hidden = true; el.textContent = ''; }
    field.removeAttribute('aria-invalid');
  };

  // Validate on blur rather than on keystroke, so errors appear once the
  // visitor has finished a field instead of scolding them mid-word.
  const required = [...form.querySelectorAll('[required]')];
  required.forEach((f) => f.addEventListener('blur', () => validate(f)));

  function validate(field) {
    clearError(field);
    const value = field.value.trim();
    if (!value) {
      const label = form.querySelector('label[for="' + field.id + '"]');
      const name = label ? label.textContent.replace('*', '').trim() : 'This field';
      showError(field, name + ' is required.');
      return false;
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      showError(field, 'Enter an email address we can reply to, like name@example.com.');
      return false;
    }
    return true;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const invalid = required.filter((f) => !validate(f));
    if (invalid.length) {
      setStatus(invalid.length + ' field' + (invalid.length > 1 ? 's need' : ' needs') +
        ' attention before this can send.', 'error');
      invalid[0].focus();                       // move focus to the first problem
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    if (!endpoint) {
      const subject = 'Website enquiry — ' + (data.inquiryType || 'General');
      const body = [
        'Name: ' + data.name,
        'Email: ' + data.email,
        'Phone: ' + (data.phone || '—'),
        'Enquiry type: ' + data.inquiryType,
        '',
        data.message,
      ].join('\n');
      window.location.href = 'mailto:' + email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      setStatus('Opening your email app with the message ready to send to ' + email + '.', 'success');
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = 'Sending…';
    setStatus('Sending your message…', 'pending');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed with status ' + res.status);
      form.reset();
      required.forEach(clearError);
      setStatus('Thanks — your message is on its way. We reply within one business day.', 'success');
    } catch (err) {
      setStatus('That did not send. Please email ' + email + ' or call us and we will pick it up.', 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
});
