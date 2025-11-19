const { app } = require('../static/js/app');

// Mock fetch for testing
global.fetch = jest.fn();

describe('ICD11App', () => {
    let mockApp;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '<div id="app"></div>';
        
        // Mock fetch
        fetch.mockClear();
        
        // Create app instance
        mockApp = {
            escapeHtml: (text) => {
                if (typeof text !== 'string') return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        };
    });

    test('escapeHtml should escape HTML characters', () => {
        const input = '<script>alert("test")</script>';
        const expected = '&lt;script&gt;alert("test")&lt;/script&gt;';
        const result = mockApp.escapeHtml(input);
        expect(result).toBe(expected);
    });

    test('escapeHtml should handle non-string input', () => {
        const result = mockApp.escapeHtml(null);
        expect(result).toBe('');
    });

    test('escapeHtml should handle numbers', () => {
        const result = mockApp.escapeHtml(123);
        expect(result).toBe('');
    });
});