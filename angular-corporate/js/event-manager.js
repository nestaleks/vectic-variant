class EventManager {
    constructor() {
        this.listeners = new Map();
        this.delegatedEvents = new Map();
        this.setupGlobalDelegation();
    }

    setupGlobalDelegation() {
        // Global click delegation
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('input', this.handleGlobalInput.bind(this));
        document.addEventListener('change', this.handleGlobalChange.bind(this));
    }

    handleGlobalClick(event) {
        const target = event.target;
        
        // Handle data-action attributes - but skip navigation actions (handled by simple system)
        const action = target.dataset.action;
        if (action && !action.includes('orders-')) {
            // Skip if the element is disabled
            if (target.disabled || target.hasAttribute('disabled')) {
                console.log(`🖱️ EVENT MANAGER: Skipping action="${action}" - element is disabled`);
                return;
            }
            
            console.log(`🖱️ EVENT MANAGER: Handling action="${action}" on element:`, target);
            event.preventDefault();
            this.emit(`action:${action}`, {
                target,
                event,
                data: { ...target.dataset }
            });
            return; // Prevent other handlers from firing
        }

        // Handle class-based events - check target and parents
        let currentElement = target;
        while (currentElement) {
            const classList = Array.from(currentElement.classList || []);
            const className = classList.find(cls => 
                this.delegatedEvents.has(`click:.${cls}`)
            );
            if (className) {
                this.emit(`click:.${className}`, { target: currentElement, event });
                break;
            }
            currentElement = currentElement.parentElement;
        }

        // Handle ID-based events
        if (target.id) {
            this.emit(`click:#${target.id}`, { target, event });
        }
    }

    handleGlobalInput(event) {
        const target = event.target;
        
        if (target.id) {
            this.emit(`input:#${target.id}`, { 
                target, 
                event, 
                value: target.value 
            });
        }

        // Handle search input specifically
        if (target.classList.contains('vect-search-input')) {
            this.emit('search:input', { 
                query: target.value,
                target,
                event 
            });
        }
    }

    handleGlobalChange(event) {
        const target = event.target;
        
        if (target.id) {
            this.emit(`change:#${target.id}`, { 
                target, 
                event, 
                value: target.value 
            });
        }
    }

    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);

        // Track delegated events
        if (eventName.startsWith('click:') || eventName.startsWith('input:') || eventName.startsWith('change:')) {
            this.delegatedEvents.set(eventName, true);
        }

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(eventName);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    off(eventName, callback) {
        const callbacks = this.listeners.get(eventName);
        if (callbacks && callback) {
            callbacks.delete(callback);
        } else if (callbacks) {
            callbacks.clear();
        }
    }

    emit(eventName, data = {}) {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Event handler error for ${eventName}:`, error);
                }
            });
        }
    }

    // Convenience methods for common UI events
    onClick(selector, callback) {
        return this.on(`click:${selector}`, callback);
    }

    onInput(selector, callback) {
        return this.on(`input:${selector}`, callback);
    }

    onChange(selector, callback) {
        return this.on(`change:${selector}`, callback);
    }

    onAction(action, callback) {
        return this.on(`action:${action}`, callback);
    }

    // Direct DOM event binding for specific elements
    bindElement(element, eventType, callback) {
        const handler = (event) => {
            try {
                callback({ target: element, event });
            } catch (error) {
                console.error('Element event handler error:', error);
            }
        };

        element.addEventListener(eventType, handler);

        // Return cleanup function
        return () => {
            element.removeEventListener(eventType, handler);
        };
    }

    // Form handling utilities
    onFormSubmit(formSelector, callback) {
        return this.on(`submit:${formSelector}`, (data) => {
            data.event.preventDefault();
            const form = data.target;
            const formData = new FormData(form);
            const formObject = Object.fromEntries(formData.entries());
            callback({ ...data, formData: formObject });
        });
    }

    // Keyboard shortcuts
    onKeyboard(key, callback, options = {}) {
        const handler = (event) => {
            if (event.key === key) {
                if (options.ctrl && !event.ctrlKey) return;
                if (options.alt && !event.altKey) return;
                if (options.shift && !event.shiftKey) return;
                
                try {
                    callback({ event, key });
                } catch (error) {
                    console.error('Keyboard handler error:', error);
                }
            }
        };

        document.addEventListener('keydown', handler);
        
        return () => {
            document.removeEventListener('keydown', handler);
        };
    }

    // Cleanup
    destroy() {
        this.listeners.clear();
        this.delegatedEvents.clear();
        
        document.removeEventListener('click', this.handleGlobalClick);
        document.removeEventListener('input', this.handleGlobalInput);
        document.removeEventListener('change', this.handleGlobalChange);
    }
}

export default EventManager;