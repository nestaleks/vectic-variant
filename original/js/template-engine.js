class TemplateEngine {
    constructor() {
        this.helpers = new Map();
        this.registerDefaultHelpers();
    }

    render(template, data = {}) {
        let result = template;
        
        // Replace simple placeholders {{key}}
        result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : '';
        });

        // Replace helper functions {{helper:arg}}
        result = result.replace(/\{\{(\w+):([^}]+)\}\}/g, (match, helperName, arg) => {
            const helper = this.helpers.get(helperName);
            if (helper) {
                return helper(arg, data);
            }
            return match;
        });

        return result;
    }

    registerHelper(name, fn) {
        this.helpers.set(name, fn);
    }

    registerDefaultHelpers() {
        // Format currency
        this.registerHelper('currency', (amount) => {
            return `€${parseFloat(amount || 0).toFixed(2)}`;
        });

        // Format date
        this.registerHelper('date', (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString();
        });

        // Conditional rendering
        this.registerHelper('if', (condition, data) => {
            return data[condition] ? 'block' : 'none';
        });

        // Loop helper for arrays
        this.registerHelper('each', (arrayName, data) => {
            const array = data[arrayName];
            if (!Array.isArray(array)) return '';
            
            return array.map(item => JSON.stringify(item)).join(',');
        });
    }

    // Render component with nested data
    renderComponent(template, componentData) {
        if (!componentData) return template;

        // Handle nested objects
        const flatData = this.flattenData(componentData);
        return this.render(template, flatData);
    }

    flattenData(obj, prefix = '') {
        const flattened = {};
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}_${key}` : key;
                
                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    Object.assign(flattened, this.flattenData(value, newKey));
                } else {
                    flattened[newKey] = value;
                }
            }
        }
        
        return flattened;
    }
}

export default TemplateEngine;