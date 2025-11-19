/**
 * ICD-11 Hackathon Application JavaScript
 * Frontend logic for medical terminology search
 */

class ICD11App {
    constructor() {
        this.apiBaseUrl = '/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUI();
        console.log('ICD-11 Application initialized');
    }

    setupUI() {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <div class="container">
                <h1>ICD-11 Medical Terminology Search</h1>
                
                <div class="search-container">
                    <form class="search-form" id="searchForm">
                        <input 
                            type="text" 
                            class="search-input" 
                            id="searchInput" 
                            placeholder="Search for medical terms, diseases, or conditions..."
                            required
                        />
                        <button type="submit" class="search-button" id="searchButton">
                            Search
                        </button>
                    </form>
                    
                    <div class="search-options">
                        <label>
                            <input type="checkbox" id="flexiSearch" checked>
                            Use flexible search
                        </label>
                    </div>
                </div>

                <div class="results-container" id="resultsContainer" style="display: none;">
                    <h2>Search Results</h2>
                    <div id="resultsContent"></div>
                </div>

                <div class="openwebui-container" id="openWebUIContainer" style="display: none;">
                    <div class="openwebui-header">
                        OpenWebUI Integration
                    </div>
                    <div class="openwebui-content" id="openWebUIContent">
                        <!-- OpenWebUI will be embedded here -->
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const searchForm = document.getElementById('searchForm');
            if (searchForm) {
                searchForm.addEventListener('submit', (e) => this.handleSearch(e));
            }
        });
    }

    async handleSearch(event) {
        event.preventDefault();
        
        const searchInput = document.getElementById('searchInput');
        const flexiSearch = document.getElementById('flexiSearch');
        const searchButton = document.getElementById('searchButton');
        const resultsContainer = document.getElementById('resultsContainer');
        const resultsContent = document.getElementById('resultsContent');

        if (!searchInput || !searchInput.value.trim()) {
            alert('Please enter a search term');
            return;
        }

        const query = searchInput.value.trim();
        const useFlexiSearch = flexiSearch ? flexiSearch.checked : true;

        // Show loading state
        searchButton.disabled = true;
        searchButton.textContent = 'Searching...';
        resultsContainer.style.display = 'block';
        resultsContent.innerHTML = this.createLoadingHTML();

        try {
            const results = await this.searchICD11(query, useFlexiSearch);
            this.displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            resultsContent.innerHTML = this.createErrorHTML(error.message);
        } finally {
            searchButton.disabled = false;
            searchButton.textContent = 'Search';
        }
    }

    async searchICD11(query, flexisearch = true) {
        const url = `${this.apiBaseUrl}/search?q=${encodeURIComponent(query)}&flexisearch=${flexisearch}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Search failed: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    }

    async getEntity(entityId) {
        const url = `${this.apiBaseUrl}/entity/${encodeURIComponent(entityId)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to get entity: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    }

    displayResults(data) {
        const resultsContent = document.getElementById('resultsContent');
        if (!resultsContent) return;

        if (!data.results || !data.results.destinationEntities || data.results.destinationEntities.length === 0) {
            resultsContent.innerHTML = '<p>No results found for your search.</p>';
            return;
        }

        const entities = data.results.destinationEntities;
        let html = `<p>Found ${entities.length} result(s) for "${data.query}":</p>`;

        entities.forEach(entity => {
            html += this.createEntityHTML(entity);
        });

        resultsContent.innerHTML = html;
    }

    createEntityHTML(entity) {
        const title = entity.title || entity.label || 'Untitled';
        const code = entity.theCode || entity.code || '';
        const id = entity.id || '';
        const description = entity.definition || entity.longDefinition || 'No description available';

        return `
            <div class="result-item">
                <div class="result-title">${this.escapeHtml(title)}</div>
                ${code ? `<div class="result-code">${this.escapeHtml(code)}</div>` : ''}
                <div class="result-description">${this.escapeHtml(description)}</div>
                ${id ? `<button onclick="app.showEntityDetails('${this.escapeHtml(id)}')" class="entity-details-btn">View Details</button>` : ''}
            </div>
        `;
    }

    createLoadingHTML() {
        return `
            <div class="loading">
                <div class="spinner"></div>
                <p>Searching ICD-11 database...</p>
            </div>
        `;
    }

    createErrorHTML(message) {
        return `
            <div class="error">
                <strong>Error:</strong> ${this.escapeHtml(message)}
            </div>
        `;
    }

    async showEntityDetails(entityId) {
        try {
            const entity = await this.getEntity(entityId);
            console.log('Entity details:', entity);
            // TODO: Implement detailed entity view
            alert(`Entity details loaded. Check console for full data.`);
        } catch (error) {
            console.error('Error loading entity:', error);
            alert(`Failed to load entity details: ${error.message}`);
        }
    }

    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // OpenWebUI integration methods
    initializeOpenWebUI() {
        const container = document.getElementById('openWebUIContainer');
        const content = document.getElementById('openWebUIContent');
        
        if (container && content) {
            container.style.display = 'block';
            // TODO: Embed OpenWebUI iframe or component
            content.innerHTML = '<p>OpenWebUI integration coming soon...</p>';
        }
    }
}

// Initialize the application
const app = new ICD11App();

// Make app globally available for event handlers
window.app = app;