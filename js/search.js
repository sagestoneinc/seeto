// Search functionality for Advanced Property Search
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('advancedSearchForm');
    const resultsGrid = document.getElementById('resultsGrid');
    const resultCount = document.getElementById('resultCount');
    const viewButtons = document.querySelectorAll('.view-btn');
    const mapView = document.getElementById('mapView');
    const sortBy = document.getElementById('sortBy');
    
    // Sample property data (in production, this would come from MLS API)
    const sampleProperties = [
        {
            id: 1,
            price: 585000,
            title: 'Modern Family Home',
            location: '123 Oak Street, Plano, TX 75024',
            beds: 4,
            baths: 3,
            sqft: 2450,
            type: 'house',
            market: 'dfw',
            features: ['pool', 'garage'],
            status: 'active',
            badge: 'New Listing'
        },
        {
            id: 2,
            price: 425000,
            title: 'Downtown Luxury Condo',
            location: '789 Main St, Houston, TX 77002',
            beds: 3,
            baths: 2,
            sqft: 1850,
            type: 'condo',
            market: 'houston',
            features: ['garage'],
            status: 'active',
            badge: 'Featured'
        },
        {
            id: 3,
            price: 325000,
            title: 'Prime Investment Property',
            location: '456 Elm Avenue, Dallas, TX 75201',
            beds: 3,
            baths: 2,
            sqft: 1600,
            type: 'house',
            market: 'dfw',
            features: [],
            status: 'active',
            badge: 'Investment'
        }
    ];
    
    let currentResults = sampleProperties;
    
    // Initialize result count
    updateResultCount(currentResults.length);
    
    // View toggle functionality
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (view === 'map') {
                resultsGrid.style.display = 'none';
                mapView.style.display = 'block';
            } else {
                mapView.style.display = 'none';
                resultsGrid.style.display = 'grid';
                
                if (view === 'list') {
                    resultsGrid.classList.add('list-view');
                } else {
                    resultsGrid.classList.remove('list-view');
                }
            }
        });
    });
    
    // Sort functionality
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            sortResults(this.value);
        });
    }
    
    // Search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
        
        // Save search functionality
        const saveSearchBtn = document.getElementById('saveSearch');
        if (saveSearchBtn) {
            saveSearchBtn.addEventListener('click', function() {
                saveSearch();
            });
        }
    }
    
    // Save property functionality
    const savePropertyButtons = document.querySelectorAll('.save-property');
    savePropertyButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('saved');
            const isSaved = this.classList.contains('saved');
            this.textContent = isSaved ? '❤️' : '🤍';
            
            // In production, save to user's favorites
            const message = isSaved ? 'Property saved to favorites!' : 'Property removed from favorites';
            showNotification(message);
        });
    });
    
    function performSearch() {
        const formData = new FormData(searchForm);
        let filtered = [...sampleProperties];
        
        // Filter by location
        const location = formData.get('location');
        if (location) {
            filtered = filtered.filter(prop => 
                prop.location.toLowerCase().includes(location.toLowerCase())
            );
        }
        
        // Filter by market
        const market = formData.get('market');
        if (market) {
            filtered = filtered.filter(prop => prop.market === market);
        }
        
        // Filter by property type
        const types = formData.getAll('type');
        if (types.length > 0) {
            filtered = filtered.filter(prop => types.includes(prop.type));
        }
        
        // Filter by price range
        const minPrice = parseInt(formData.get('minPrice')) || 0;
        const maxPrice = parseInt(formData.get('maxPrice')) || Infinity;
        filtered = filtered.filter(prop => prop.price >= minPrice && prop.price <= maxPrice);
        
        // Filter by bedrooms
        const minBeds = parseInt(formData.get('bedrooms')) || 0;
        if (minBeds > 0) {
            filtered = filtered.filter(prop => prop.beds >= minBeds);
        }
        
        // Filter by bathrooms
        const minBaths = parseInt(formData.get('bathrooms')) || 0;
        if (minBaths > 0) {
            filtered = filtered.filter(prop => prop.baths >= minBaths);
        }
        
        // Filter by square footage
        const minSqFt = parseInt(formData.get('minSqFt')) || 0;
        const maxSqFt = parseInt(formData.get('maxSqFt')) || Infinity;
        filtered = filtered.filter(prop => prop.sqft >= minSqFt && prop.sqft <= maxSqFt);
        
        // Filter by features
        const features = formData.getAll('features');
        if (features.length > 0) {
            filtered = filtered.filter(prop => 
                features.some(feature => prop.features.includes(feature))
            );
        }
        
        currentResults = filtered;
        updateResultCount(filtered.length);
        renderResults(filtered);
    }
    
    function sortResults(sortType) {
        let sorted = [...currentResults];
        
        switch(sortType) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'beds':
                sorted.sort((a, b) => b.beds - a.beds);
                break;
            case 'sqft':
                sorted.sort((a, b) => b.sqft - a.sqft);
                break;
            case 'newest':
            default:
                // Keep original order for newest
                break;
        }
        
        currentResults = sorted;
        renderResults(sorted);
    }
    
    function renderResults(properties) {
        if (properties.length === 0) {
            resultsGrid.innerHTML = '<div class="no-results"><h3>No properties found</h3><p>Try adjusting your search filters</p></div>';
            return;
        }
        
        resultsGrid.innerHTML = properties.map(prop => `
            <div class="property-result-card">
                <div class="property-image">
                    <img src="images/placeholder-home-${prop.id}.jpg" alt="${prop.title}" loading="lazy">
                    <button class="save-property" aria-label="Save property">❤️</button>
                    <span class="property-badge">${prop.badge}</span>
                </div>
                <div class="property-info">
                    <div class="property-price">$${prop.price.toLocaleString()}</div>
                    <h3 class="property-title">${prop.title}</h3>
                    <p class="property-location">📍 ${prop.location}</p>
                    <div class="property-features">
                        <span>🛏️ ${prop.beds} Beds</span>
                        <span>🚿 ${prop.baths} Baths</span>
                        <span>📏 ${prop.sqft.toLocaleString()} sq ft</span>
                    </div>
                    <div class="property-actions">
                        <a href="listing-detail.html?id=${prop.id}" class="btn btn-primary btn-sm">View Details</a>
                        <a href="contact.html?property=${prop.id}" class="btn btn-outline btn-sm">Schedule Tour</a>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Re-attach save property listeners
        const savePropertyButtons = document.querySelectorAll('.save-property');
        savePropertyButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                this.classList.toggle('saved');
                const isSaved = this.classList.contains('saved');
                this.textContent = isSaved ? '❤️' : '🤍';
                showNotification(isSaved ? 'Property saved!' : 'Property removed');
            });
        });
    }
    
    function updateResultCount(count) {
        if (resultCount) {
            resultCount.textContent = `${count} ${count === 1 ? 'property' : 'properties'} found`;
        }
    }
    
    function saveSearch() {
        const formData = new FormData(searchForm);
        const searchParams = {};
        
        for (let [key, value] of formData.entries()) {
            if (value) {
                if (!searchParams[key]) {
                    searchParams[key] = value;
                } else {
                    if (!Array.isArray(searchParams[key])) {
                        searchParams[key] = [searchParams[key]];
                    }
                    searchParams[key].push(value);
                }
            }
        }
        
        // In production, save to user's account via API
        const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
        savedSearches.push({
            date: new Date().toISOString(),
            params: searchParams
        });
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        
        showNotification('Search saved! You\'ll receive email alerts for new matching properties.');
    }
    
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});

// Add CSS animations
// Injected stylesheet removed: it was written against the retired navy-and-gold
// palette (--primary-color, --gray-200, and friends), which css/style.css no longer
// defines. Those rules resolved to nothing and rendered white text on a transparent
// background. Styling for these pages now lives in css/style.css.
