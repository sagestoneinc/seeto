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
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
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
    
    .advanced-search-section {
        padding: var(--spacing-2xl) 0;
        background-color: var(--gray-100);
    }
    
    .search-layout {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: var(--spacing-xl);
    }
    
    .search-filters {
        background-color: var(--white);
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        height: fit-content;
        position: sticky;
        top: 100px;
    }
    
    .search-filters h2 {
        color: var(--primary-color);
        margin-bottom: var(--spacing-md);
        font-size: 1.5rem;
    }
    
    .filter-group {
        margin-bottom: var(--spacing-md);
    }
    
    .filter-group label {
        display: block;
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
        color: var(--gray-800);
    }
    
    .filter-group input[type="text"],
    .filter-group input[type="number"],
    .filter-group select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--gray-200);
        border-radius: var(--radius-md);
        font-size: 1rem;
    }
    
    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }
    
    .checkbox-group label {
        font-weight: normal;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }
    
    .range-inputs {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
    }
    
    .range-inputs input {
        flex: 1;
    }
    
    .btn-block {
        width: 100%;
        margin-top: var(--spacing-sm);
    }
    
    .search-results {
        background-color: var(--white);
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
    }
    
    .results-header {
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 2px solid var(--gray-200);
    }
    
    .results-header h2 {
        color: var(--primary-color);
        margin-bottom: var(--spacing-sm);
    }
    
    .results-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);
    }
    
    .view-toggle {
        display: flex;
        gap: 0.5rem;
    }
    
    .view-btn {
        padding: 0.5rem 1rem;
        background-color: var(--gray-100);
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 1.25rem;
    }
    
    .view-btn.active {
        background-color: var(--primary-color);
        color: var(--white);
    }
    
    .sort-options {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    
    .sort-options label {
        font-weight: 600;
    }
    
    .sort-options select {
        padding: 0.5rem;
        border: 2px solid var(--gray-200);
        border-radius: var(--radius-md);
    }
    
    .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--spacing-lg);
    }
    
    .results-grid.list-view {
        grid-template-columns: 1fr;
    }
    
    .property-result-card {
        background-color: var(--white);
        border: 2px solid var(--gray-200);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .property-result-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
    }
    
    .property-image {
        position: relative;
        height: 250px;
        overflow: hidden;
        background-color: var(--gray-200);
    }
    
    .property-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .save-property {
        position: absolute;
        top: var(--spacing-sm);
        left: var(--spacing-sm);
        background-color: var(--white);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
        cursor: pointer;
        box-shadow: var(--shadow-md);
    }
    
    .save-property.saved {
        color: red;
    }
    
    .property-badge {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        background-color: var(--secondary-color);
        color: var(--dark-color);
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .property-badge.featured {
        background-color: var(--primary-color);
        color: var(--white);
    }
    
    .property-badge.investment {
        background-color: var(--success);
        color: var(--white);
    }
    
    .property-info {
        padding: var(--spacing-md);
    }
    
    .property-price {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: var(--spacing-xs);
    }
    
    .property-title {
        font-size: 1.25rem;
        margin-bottom: var(--spacing-xs);
    }
    
    .property-location {
        color: var(--gray-600);
        margin-bottom: var(--spacing-sm);
    }
    
    .property-features {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        padding: var(--spacing-sm) 0;
        border-top: 1px solid var(--gray-200);
        border-bottom: 1px solid var(--gray-200);
    }
    
    .property-features span {
        font-size: 0.875rem;
        color: var(--gray-600);
    }
    
    .property-description {
        color: var(--gray-600);
        margin-bottom: var(--spacing-md);
        line-height: 1.6;
    }
    
    .property-actions {
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .map-container {
        height: 600px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background-color: var(--gray-100);
    }
    
    .property-map {
        width: 100%;
        height: 100%;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-xl);
    }
    
    .pagination-btn {
        padding: 0.75rem 1.25rem;
        border: 2px solid var(--gray-200);
        background-color: var(--white);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 600;
    }
    
    .pagination-btn:hover:not(:disabled) {
        background-color: var(--primary-color);
        color: var(--white);
        border-color: var(--primary-color);
    }
    
    .pagination-btn.active {
        background-color: var(--primary-color);
        color: var(--white);
        border-color: var(--primary-color);
    }
    
    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .search-cta {
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: var(--white);
        padding: var(--spacing-2xl) 0;
        text-align: center;
    }
    
    .search-cta h2 {
        color: var(--white);
        font-size: 2rem;
        margin-bottom: var(--spacing-sm);
    }
    
    .search-cta p {
        font-size: 1.125rem;
        margin-bottom: var(--spacing-lg);
        opacity: 0.95;
    }
    
    .no-results {
        text-align: center;
        padding: var(--spacing-2xl);
        color: var(--gray-600);
    }
    
    @media (max-width: 968px) {
        .search-layout {
            grid-template-columns: 1fr;
        }
        
        .search-filters {
            position: static;
        }
        
        .results-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);
