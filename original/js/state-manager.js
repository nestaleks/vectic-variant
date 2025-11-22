class StateManager {
    constructor(initialState = {}) {
        this.state = { ...this.getDefaultState(), ...initialState };
        this.listeners = new Map();
        this.history = [];
        this.maxHistory = 50;
    }

    getDefaultState() {
        return {
            cart: [],
            currentCategory: 'all',
            searchQuery: '',
            orders: [],
            products: [],
            user: {
                name: 'Administrator',
                role: 'admin'
            },
            ui: {
                currentScreen: 'order-creation',
                loading: false,
                error: null
            }
        };
    }

    get(key) {
        if (key) {
            return this.getNestedValue(this.state, key);
        }
        return { ...this.state };
    }

    set(key, value) {
        const oldState = { ...this.state };
        
        if (typeof key === 'object') {
            // Set multiple values
            this.state = { ...this.state, ...key };
        } else {
            // Set single value
            this.setNestedValue(this.state, key, value);
        }

        this.addToHistory(oldState);
        this.notifyListeners(key, value, oldState);
    }

    update(key, updater) {
        const currentValue = this.get(key);
        const newValue = updater(currentValue);
        this.set(key, newValue);
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    notifyListeners(key, value, oldState) {
        // Notify specific key listeners
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value, this.get(key), oldState);
                } catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }

        // Notify global listeners
        const globalCallbacks = this.listeners.get('*');
        if (globalCallbacks) {
            globalCallbacks.forEach(callback => {
                try {
                    callback(this.state, oldState);
                } catch (error) {
                    console.error('Global state listener error:', error);
                }
            });
        }
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (current[key] === undefined) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    addToHistory(state) {
        this.history.push({ timestamp: Date.now(), state });
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    undo() {
        if (this.history.length > 0) {
            const previous = this.history.pop();
            this.state = previous.state;
            this.notifyListeners('*', this.state, this.state);
        }
    }

    reset() {
        const oldState = { ...this.state };
        this.state = this.getDefaultState();
        this.history = [];
        this.notifyListeners('*', this.state, oldState);
    }

    // Cart-specific methods
    addToCart(product) {
        const cart = this.get('cart');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const cartItem = { ...product, quantity: 1 };
            
            // Add default size for pizza items
            if (product.category === 'pizza') {
                cartItem.size = '30cm';
            }
            
            cart.push(cartItem);
        }
        
        this.set('cart', cart);
    }

    removeFromCart(productId) {
        const cart = this.get('cart').filter(item => item.id !== productId);
        this.set('cart', cart);
    }

    updateCartQuantity(productId, quantity) {
        const cart = this.get('cart');
        const item = cart.find(item => item.id === productId);
        if (item) {
            // Ensure minimum quantity is 1
            if (quantity < 1) {
                item.quantity = 1;
            } else {
                item.quantity = quantity;
            }
            this.set('cart', cart);
        }
    }

    increaseCartQuantity(productId) {
        const cart = this.get('cart');
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            this.set('cart', cart);
        }
    }

    decreaseCartQuantity(productId) {
        const cart = this.get('cart');
        const item = cart.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            item.quantity -= 1;
            this.set('cart', cart);
        }
        // If quantity is 1, do nothing (minimum is 1)
    }

    clearCart() {
        this.set('cart', []);
    }

    getCartTotal() {
        const cart = this.get('cart');
        return cart.reduce((total, item) => {
            let itemTotal = item.price * item.quantity;
            
            // Add extras cost
            if (item.extras) {
                Object.values(item.extras).forEach(extra => {
                    itemTotal += extra.price * extra.quantity * item.quantity;
                });
            }
            
            return total + itemTotal;
        }, 0);
    }

    getCartItemCount() {
        const cart = this.get('cart');
        return cart.reduce((count, item) => count + item.quantity, 0);
    }
}

export default StateManager;