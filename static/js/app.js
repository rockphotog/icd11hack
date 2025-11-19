/**
 * ICD-11 Hackathon Application JavaScript
 * Frontend logic for medical terminology search
 */

class ICD11App {
    constructor() {
        // Use the backend server URL for API calls
        this.apiBaseUrl = 'http://localhost:8000/api';
        this.selectedLanguage = 'en';
        this.searchHistory = [];
        this.init();
    }

    init() {
        console.log('ICD-11 Application starting...');
        this.setupUI();
        
        // Set up event listeners after UI is created
        setTimeout(() => {
            this.setupEventListeners();
        }, 100);
        
        this.loadSupportedLanguages();
        console.log('ICD-11 Application initialized');
    }

    async loadSupportedLanguages() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/languages`);
            const data = await response.json();
            this.supportedLanguages = data.supported_languages;
            this.updateLanguageSelector();
        } catch (error) {
            console.error('Failed to load languages:', error);
            this.supportedLanguages = {
                'en': 'English',
                'no': 'Norwegian (upcoming)',
                'nb': 'Norwegian Bokmål (upcoming)',
                'nn': 'Norwegian Nynorsk (upcoming)'
            };
            this.updateLanguageSelector();
        }
    }

    updateLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return;

        languageSelect.innerHTML = '';
        for (const [code, name] of Object.entries(this.supportedLanguages)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            option.selected = code === this.selectedLanguage;
            languageSelect.appendChild(option);
        }
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
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="flexiSearch" checked>
                                Use flexible search
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label for="languageSelect">Language:</label>
                            <select id="languageSelect" class="language-select">
                                <option value="en">English</option>
                                <option value="no">Norwegian (upcoming)</option>
                                <option value="nb">Norwegian Bokmål (upcoming)</option>
                                <option value="nn">Norwegian Nynorsk (upcoming)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="results-container" id="resultsContainer" style="display: none;">
                    <div class="results-header">
                        <h2>Search Results</h2>
                        <div class="results-meta" id="resultsMeta"></div>
                    </div>
                    <div id="resultsContent"></div>
                </div>

                <div class="entity-detail-container" id="entityDetailContainer" style="display: none;">
                    <div class="detail-header">
                        <button id="backToResults" class="back-button">← Back to Results</button>
                        <h2>Entity Details</h2>
                    </div>
                    <div id="entityDetailContent"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Set up event listeners immediately since DOM is already loaded
        const addEventListeners = () => {
            console.log('Setting up event listeners...');
            const searchForm = document.getElementById('searchForm');
            if (searchForm) {
                console.log('Search form found, adding submit listener');
                searchForm.addEventListener('submit', (e) => this.handleSearch(e));
            } else {
                console.error('Search form not found!');
            }
            
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                console.log('Language select found, adding change listener');
                languageSelect.addEventListener('change', (e) => {
                    this.selectedLanguage = e.target.value;
                    console.log('Language changed to:', this.selectedLanguage);
                });
            } else {
                console.error('Language select not found!');
            }
            
            const backButton = document.getElementById('backToResults');
            if (backButton) {
                console.log('Back button found, adding click listener');
                backButton.addEventListener('click', () => this.showSearchResults());
            } else {
                console.log('Back button not found (this is normal on initial load)');
            }
        };

        // Check if DOM is already loaded
        if (document.readyState === 'loading') {
            console.log('DOM still loading, waiting for DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', addEventListeners);
        } else {
            // DOM is already loaded, set up listeners immediately
            console.log('DOM already loaded, setting up listeners immediately');
            addEventListeners();
        }
    }

    async handleSearch(event) {
        console.log('Search triggered!', event);
        event.preventDefault();
        
        const searchInput = document.getElementById('searchInput');
        const flexiSearch = document.getElementById('flexiSearch');
        const languageSelect = document.getElementById('languageSelect');
        const searchButton = document.getElementById('searchButton');
        const resultsContainer = document.getElementById('resultsContainer');
        const resultsContent = document.getElementById('resultsContent');
        const resultsMeta = document.getElementById('resultsMeta');

        console.log('Search elements found:', {
            searchInput: !!searchInput,
            flexiSearch: !!flexiSearch,
            languageSelect: !!languageSelect,
            searchButton: !!searchButton,
            resultsContainer: !!resultsContainer
        });

        if (!searchInput || !searchInput.value.trim()) {
            alert('Please enter a search term');
            return;
        }

        const query = searchInput.value.trim();
        const useFlexiSearch = flexiSearch ? flexiSearch.checked : true;
        const language = languageSelect ? languageSelect.value : this.selectedLanguage;
        
        console.log('Search parameters:', { query, useFlexiSearch, language });
        
        // Show loading state
        searchButton.disabled = true;
        searchButton.textContent = 'Searching...';
        resultsContainer.style.display = 'block';
        resultsContent.innerHTML = this.createLoadingHTML();
        
        // Hide entity details if showing
        const entityDetailContainer = document.getElementById('entityDetailContainer');
        if (entityDetailContainer) {
            entityDetailContainer.style.display = 'none';
        }

        try {
            console.log('Making API call...');
            const results = await this.searchICD11(query, useFlexiSearch, language);
            console.log('Search results received:', results);
            this.currentSearchResults = results;
            this.displayResults(results);
            
            // Update search history
            this.searchHistory.unshift({query, language, timestamp: new Date()});
            if (this.searchHistory.length > 10) {
                this.searchHistory = this.searchHistory.slice(0, 10);
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.displayError('Search failed: ' + error.message);
        } finally {
            searchButton.disabled = false;
            searchButton.textContent = 'Search';
        }
    }

    async searchICD11(query, flexiSearch = true, language = 'en') {
        const params = new URLSearchParams({
            q: query,
            flexisearch: flexiSearch.toString(),
            language: language
        });
        
        const response = await fetch(`${this.apiBaseUrl}/search?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async getEntityDetails(entityId, language = 'en') {
        const params = new URLSearchParams({
            language: language,
            include_children: 'true'
        });
        
        // Don't double-encode the entity ID
        const cleanEntityId = decodeURIComponent(entityId);
        const response = await fetch(`${this.apiBaseUrl}/entity/${encodeURIComponent(cleanEntityId)}/details?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async getEntityHierarchy(entityId, language = 'en') {
        const params = new URLSearchParams({
            language: language
        });
        
        // Don't double-encode the entity ID
        const cleanEntityId = decodeURIComponent(entityId);
        const response = await fetch(`${this.apiBaseUrl}/entity/${encodeURIComponent(cleanEntityId)}/hierarchy?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
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
        const resultsMeta = document.getElementById('resultsMeta');
        
        if (!resultsContent) return;

        if (!data.results || !data.results.destinationEntities || data.results.destinationEntities.length === 0) {
            resultsContent.innerHTML = '<div class="no-results">No results found for your search.</div>';
            if (resultsMeta) resultsMeta.innerHTML = '';
            return;
        }

        const entities = data.results.destinationEntities;
        
        // Update meta information
        if (resultsMeta) {
            const languageInfo = data.fallback_used ? 
                `<span class="language-fallback">⚠️ Norwegian not available yet, showing English results</span>` :
                `<span class="language-used">Language: ${data.language_used ? data.language_used.toUpperCase() : 'EN'}</span>`;
            
            resultsMeta.innerHTML = `
                <div class="results-info">
                    <span class="result-count">${entities.length} results found</span>
                    ${languageInfo}
                </div>
            `;
        }

        let resultsHTML = '<div class="search-results-list">';
        
        entities.forEach((entity, index) => {
            const icdCode = entity.theCode || 'No code';
            const title = entity.title || 'No title';
            const chapter = entity.chapter || 'Unknown chapter';
            const score = entity.score || 0;
            const entityType = entity.entityType || 'Unknown';
            const important = entity.important ? '⭐' : '';
            
            // Clean up title (remove HTML tags for display but keep original for tooltips)
            const cleanTitle = this.cleanHtmlTags(title);
            
            resultsHTML += `
                <div class="result-item" data-index="${index}">
                    <div class="result-header">
                        <div class="result-title-section">
                            <h3 class="result-title" title="${this.escapeHtml(cleanTitle)}">${this.escapeHtml(cleanTitle)}</h3>
                            <span class="result-importance">${important}</span>
                        </div>
                        <div class="result-code-section">
                            <span class="icd-code">${this.escapeHtml(icdCode)}</span>
                            <span class="result-score">Score: ${score.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="result-meta">
                        <span class="result-chapter">Chapter: ${this.escapeHtml(chapter)}</span>
                        <span class="result-type">Type: ${this.escapeHtml(entityType)}</span>
                        ${entity.isLeaf ? '<span class="leaf-indicator">🍃 Leaf node</span>' : ''}
                    </div>
                    <div class="result-actions">
                        <button class="view-details-btn" onclick="window.app.showEntityDetails('${this.escapeHtml(entity.id || '')}')">
                            View Details
                        </button>
                        ${entity.descendants ? `<span class="descendants-count">${entity.descendants.length} subconditions</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        resultsContent.innerHTML = resultsHTML;
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
        console.log('Showing details for entity with ID:', entityId);
        
        // Find the entity in current search results instead of making API call
        if (!this.currentSearchResults || !this.currentSearchResults.results) {
            alert('No search results available. Please search first.');
            return;
        }

        const entity = this.currentSearchResults.results.destinationEntities.find(e => e.id === entityId);
        
        if (!entity) {
            alert('Entity not found in current search results.');
            return;
        }

        const detailContainer = document.getElementById('entityDetailContainer');
        const resultsContainer = document.getElementById('resultsContainer');
        const detailContent = document.getElementById('entityDetailContent');
        
        if (!detailContainer || !detailContent) return;

        // Show details using data we already have
        detailContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        this.displayBasicEntityDetails({ data: entity });
    }

    displayBasicEntityDetails(entityData) {
        const detailContent = document.getElementById('entityDetailContent');
        if (!detailContent) return;

        const entity = entityData.data || entityData;

        let html = `
            <div class="entity-detail">
                <div class="entity-header">
                    <h3>${this.cleanHtmlTags(entity.title || entity.label || 'No title')}</h3>
                    <div class="entity-codes">
                        ${entity.theCode || entity.code ? `<span class="main-code">ICD-11: ${this.escapeHtml(entity.theCode || entity.code)}</span>` : ''}
                        ${entity.id ? `<span class="entity-id">ID: ${this.escapeHtml(entity.id)}</span>` : ''}
                    </div>
                </div>

                <div class="entity-content">
                    ${entity.definition || entity.longDefinition ? `
                        <div class="entity-section">
                            <h4>Definition</h4>
                            <p>${this.escapeHtml(entity.definition || entity.longDefinition || 'No definition available')}</p>
                        </div>
                    ` : ''}

                    <div class="entity-section">
                        <h4>Entity Information</h4>
                        <div class="entity-metadata">
                            ${entity.chapter ? `<p><strong>Chapter:</strong> ${this.escapeHtml(entity.chapter)}</p>` : ''}
                            ${entity.entityType ? `<p><strong>Type:</strong> ${this.escapeHtml(entity.entityType)}</p>` : ''}
                            ${entity.score !== undefined ? `<p><strong>Relevance Score:</strong> ${entity.score.toFixed(2)}</p>` : ''}
                            ${entity.isLeaf !== undefined ? `<p><strong>Status:</strong> ${entity.isLeaf ? 'Leaf node (no subcategories)' : 'Has subcategories'}</p>` : ''}
                            ${entity.blockId ? `<p><strong>Block ID:</strong> ${this.escapeHtml(entity.blockId)}</p>` : ''}
                            ${entity.stemId ? `<p><strong>Stem ID:</strong> ${this.escapeHtml(entity.stemId)}</p>` : ''}
                            ${entity.important ? `<p><strong>Important:</strong> ⭐ Yes</p>` : ''}
                        </div>
                    </div>

                    ${entity.descendants && entity.descendants.length > 0 ? `
                        <div class="entity-section">
                            <h4>Related Entities (${entity.descendants.length})</h4>
                            <ul class="hierarchy-list">
                                ${entity.descendants.slice(0, 10).map(desc => {
                                    const cleanTitle = this.cleanHtmlTags(desc.title || desc.label || 'Related entity');
                                    const searchTerm = desc.theCode || cleanTitle;
                                    return `
                                    <li class="hierarchy-link" onclick="window.app.performNewSearch('${this.escapeHtml(searchTerm)}')"
                                        style="cursor: pointer; padding: 8px; margin: 2px 0; background: #f8f9fa; border-radius: 4px; transition: background-color 0.2s;" 
                                        onmouseover="this.style.backgroundColor='#e9ecef'" 
                                        onmouseout="this.style.backgroundColor='#f8f9fa'">
                                        ${this.escapeHtml(cleanTitle)}
                                        ${desc.theCode ? `<span class="code">(${this.escapeHtml(desc.theCode)})</span>` : ''}
                                        <span style="font-size: 12px; color: #6c757d; margin-left: 8px;">🔍 Click to search</span>
                                    </li>
                                `;
                                }).join('')}
                                ${entity.descendants.length > 10 ? `<li class="more-items">... and ${entity.descendants.length - 10} more</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="entity-section">
                        <h4>Raw Data (for debugging)</h4>
                        <details>
                            <summary>Click to view raw JSON</summary>
                            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(entity, null, 2)}</pre>
                        </details>
                    </div>
                </div>
            </div>
        `;

        detailContent.innerHTML = html;
    }

    displayEntityDetails(details, hierarchy) {
        const detailContent = document.getElementById('entityDetailContent');
        if (!detailContent) return;

        const entity = details.data;
        const hierarchyData = hierarchy.hierarchy;

        let html = `
            <div class="entity-detail">
                <div class="entity-header">
                    <h3>${this.escapeHtml(entity.title || 'No title')}</h3>
                    <div class="entity-codes">
                        ${entity.theCode ? `<span class="main-code">ICD-11: ${this.escapeHtml(entity.theCode)}</span>` : ''}
                        ${entity.id ? `<span class="entity-id">ID: ${this.escapeHtml(entity.id)}</span>` : ''}
                    </div>
                </div>

                <div class="entity-content">
                    ${entity.definition ? `
                        <div class="entity-section">
                            <h4>Definition</h4>
                            <p>${this.escapeHtml(entity.definition)}</p>
                        </div>
                    ` : ''}

                    ${entity.longDefinition ? `
                        <div class="entity-section">
                            <h4>Detailed Definition</h4>
                            <p>${this.escapeHtml(entity.longDefinition)}</p>
                        </div>
                    ` : ''}

                    ${hierarchyData.parents && hierarchyData.parents.length > 0 ? `
                        <div class="entity-section">
                            <h4>Parent Categories</h4>
                            <ul class="hierarchy-list">
                                ${hierarchyData.parents.map(parent => 
                                    `<li onclick="window.app.showEntityDetails('${this.escapeHtml(parent.id || '')}')" class="hierarchy-link">
                                        ${this.escapeHtml(parent.title || 'Unknown')}
                                        ${parent.theCode ? `<span class="code">(${this.escapeHtml(parent.theCode)})</span>` : ''}
                                    </li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${hierarchyData.children && hierarchyData.children.length > 0 ? `
                        <div class="entity-section">
                            <h4>Subcategories (${hierarchyData.children.length})</h4>
                            <ul class="hierarchy-list">
                                ${hierarchyData.children.slice(0, 10).map(child => 
                                    `<li onclick="window.app.showEntityDetails('${this.escapeHtml(child.id || '')}')" class="hierarchy-link">
                                        ${this.escapeHtml(child.title || 'Unknown')}
                                        ${child.theCode ? `<span class="code">(${this.escapeHtml(child.theCode)})</span>` : ''}
                                    </li>`
                                ).join('')}
                                ${hierarchyData.children.length > 10 ? `<li class="more-items">... and ${hierarchyData.children.length - 10} more</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}

                    ${entity.chapter ? `
                        <div class="entity-section">
                            <h4>Classification</h4>
                            <p><strong>Chapter:</strong> ${this.escapeHtml(entity.chapter)}</p>
                            ${entity.entityType ? `<p><strong>Type:</strong> ${this.escapeHtml(entity.entityType)}</p>` : ''}
                            ${entity.isLeaf ? '<p><strong>Status:</strong> Leaf node (no subcategories)</p>' : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        detailContent.innerHTML = html;
    }

    showSearchResults() {
        const detailContainer = document.getElementById('entityDetailContainer');
        const resultsContainer = document.getElementById('resultsContainer');
        
        if (detailContainer) detailContainer.style.display = 'none';
        if (resultsContainer && this.currentSearchResults) {
            resultsContainer.style.display = 'block';
        }
    }

    displayError(message) {
        const resultsContent = document.getElementById('resultsContent');
        if (resultsContent) {
            resultsContent.innerHTML = this.createErrorHTML(message);
        }
    }

    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    cleanHtmlTags(text) {
        if (!text || typeof text !== 'string') return '';
        return text.replace(/<[^>]*>/g, '').trim();
    }
    
    async performNewSearch(searchTerm) {
        try {
            // Clear current results and show loading
            const searchInput = document.getElementById('searchInput');
            const resultsDiv = document.getElementById('results');
            
            if (searchInput) {
                searchInput.value = searchTerm;
            }
            
            if (resultsDiv) {
                resultsDiv.innerHTML = '<div class="loading">Searching...</div>';
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Perform the search
            await this.search(searchTerm);
        } catch (error) {
            console.error('Error performing new search:', error);
            const resultsDiv = document.getElementById('results');
            if (resultsDiv) {
                resultsDiv.innerHTML = `<div class="error">Search failed: ${error.message}</div>`;
            }
        }
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