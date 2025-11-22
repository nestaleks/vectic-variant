class ComponentLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadComponent(name) {
        // Check cache first
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }

        try {
            const response = await fetch(`components/${name}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${name}`);
            }
            
            const html = await response.text();
            this.cache.set(name, html);
            return html;
        } catch (error) {
            console.error(`Error loading component ${name}:`, error);
            return `<div class="error">Failed to load ${name} component</div>`;
        }
    }

    async loadMultiple(componentNames) {
        const promises = componentNames.map(name => this.loadComponent(name));
        return Promise.all(promises);
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheSize() {
        return this.cache.size;
    }
}

export default ComponentLoader;