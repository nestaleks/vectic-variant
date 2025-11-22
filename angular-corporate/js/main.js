import ComponentLoader from './component-loader.js';
import TemplateEngine from './template-engine.js';
import StateManager from './state-manager.js';
import EventManager from './event-manager.js';
import { OrderHistoryManager } from './order-history-manager.js';

class VectisApp {
    constructor() {
        this.componentLoader = new ComponentLoader();
        this.templateEngine = new TemplateEngine();
        this.stateManager = new StateManager();
        this.eventManager = new EventManager();
        this.orderHistoryManager = new OrderHistoryManager();
        
        this.isInitialized = false;
        this.components = new Map();
        this.lastScreenSwitch = 0; // Debounce protection
        this.switchCooldown = 100; // Minimum time between switches (ms)
        
        // Make order history manager globally accessible for HTML onclick handlers
        window.orderHistoryManager = this.orderHistoryManager;
    }

    async init() {
        try {
            console.log('🚀 Initializing Simplified Vectis POS...');
            
            console.log('Init Step 1: Preloading components...');
            await this.preloadComponents();
            console.log('✅ Components preloaded');
            
            console.log('Init Step 2: Loading sample data...');
            await this.loadSampleData();
            console.log('✅ Sample data loaded');
            
            console.log('Init Step 3: Setting up event handlers...');
            this.setupEventHandlers();
            console.log('✅ Event handlers set up');
            
            console.log('Init Step 4: Rendering app...');
            await this.renderApp();
            console.log('✅ App rendered');
            
            this.isInitialized = true;
            console.log('✅ Simplified Vectis POS initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Simplified Vectis POS:', error);
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
            this.showError('Failed to initialize application');
        }
    }

    async preloadComponents() {
        console.log('📦 Preloading components...');
        
        const componentNames = [
            'header', 'cart', 'categories', 'search', 
            'products-grid', 'order-history', 'order-tabs'
        ];

        const templates = await this.componentLoader.loadMultiple(componentNames);
        
        componentNames.forEach((name, index) => {
            this.components.set(name, templates[index]);
        });

        console.log(`✅ Loaded ${componentNames.length} components`);
    }

    async loadSampleData() {
        console.log('📋 Loading sample data...');
        
        // Sample products with customizable flag for pizza items
        const products = [
            { 
                id: 1, 
                name: 'Margherita Pizza', 
                price: 12.50, 
                category: 'pizza', 
                image: '🍕',
                customizable: true,
                type: 'pizza'
            },
            { 
                id: 2, 
                name: 'Pepperoni Pizza', 
                price: 14.00, 
                category: 'pizza', 
                image: '🍕',
                customizable: true,
                type: 'pizza'
            },
            { id: 3, name: 'Caesar Salad', price: 8.50, category: 'salad', image: '🥗' },
            { id: 4, name: 'Coca Cola', price: 2.50, category: 'beverages', image: '🥤' },
            { id: 5, name: 'Tiramisu', price: 6.00, category: 'dessert', image: '🍰' }
        ];

        // Sample categories
        const categories = [
            { id: 'all', name: 'All', icon: '📦' },
            { id: 'pizza', name: 'Pizza', icon: '🍕' },
            { id: 'salad', name: 'Salads', icon: '🥗' },
            { id: 'beverages', name: 'Drinks', icon: '🥤' },
            { id: 'dessert', name: 'Desserts', icon: '🍰' }
        ];

        // Extra ingredients for pizza customization
        const extraIngredients = [
            { id: 'cheese', name: 'Extra Cheese', price: 2.00, icon: '🧀' },
            { id: 'mushrooms', name: 'Mushrooms', price: 1.50, icon: '🍄' },
            { id: 'pepperoni', name: 'Extra Pepperoni', price: 2.50, icon: '🍕' },
            { id: 'olives', name: 'Black Olives', price: 1.50, icon: '🫒' },
            { id: 'bell_peppers', name: 'Bell Peppers', price: 1.50, icon: '🌶️' },
            { id: 'onions', name: 'Red Onions', price: 1.00, icon: '🧅' },
            { id: 'tomatoes', name: 'Cherry Tomatoes', price: 1.50, icon: '🍅' },
            { id: 'basil', name: 'Fresh Basil', price: 1.00, icon: '🌿' },
            { id: 'ham', name: 'Ham', price: 3.00, icon: '🥓' }
        ];

        // Sample orders for testing (including pizza with extras)
        const sampleOrders = [
            {
                id: 1001,
                items: [
                    { 
                        id: 1, 
                        name: 'Margherita Pizza', 
                        price: 12.50, 
                        quantity: 2,
                        customizable: true,
                        extras: {
                            cheese: { id: 'cheese', name: 'Extra Cheese', price: 2.00, quantity: 1 },
                            mushrooms: { id: 'mushrooms', name: 'Mushrooms', price: 1.50, quantity: 2 }
                        }
                    },
                    { id: 4, name: 'Coca Cola', price: 2.50, quantity: 1 }
                ],
                total: 34.00, // Updated to include extras: (12.50 + 2.00 + 3.00) * 2 + 2.50
                timestamp: new Date(Date.now() - 86400000).toISOString() // Yesterday
            },
            {
                id: 1002,
                items: [
                    { id: 2, name: 'Pepperoni Pizza', price: 14.00, quantity: 1 },
                    { id: 3, name: 'Caesar Salad', price: 8.50, quantity: 1 }
                ],
                total: 22.50,
                timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            }
        ];

        this.stateManager.set('products', products);
        this.stateManager.set('categories', categories);
        this.stateManager.set('extraIngredients', extraIngredients);
        this.stateManager.set('orders', sampleOrders);
        
        console.log('✅ Sample data loaded (including test orders)');
    }

    setupEventHandlers() {
        console.log('🔧 Setting up event handlers...');

        // Cart events
        this.eventManager.onAction('add-to-cart', this.handleAddToCart.bind(this));
        this.eventManager.onAction('remove-from-cart', this.handleRemoveFromCart.bind(this));
        this.eventManager.onAction('increase', this.handleIncreaseQuantity.bind(this));
        this.eventManager.onAction('decrease', this.handleDecreaseQuantity.bind(this));
        this.eventManager.onAction('clear-cart', this.handleClearCart.bind(this));
        this.eventManager.onAction('checkout', this.handleCheckout.bind(this));

        // Product events
        this.eventManager.onClick('.vect-product-card', this.handleProductClick.bind(this));

        // Category events
        this.eventManager.onClick('.vect-category-item', this.handleCategoryChange.bind(this));

        // Search events
        this.eventManager.onInput('#vect-search-input', this.handleSearch.bind(this));

        // Quantity input events
        this.setupQuantityHandlers();

        // Order history events
        this.eventManager.onClick('.vect-order-item', this.handleOrderClick.bind(this));
        this.eventManager.onAction('print-order', this.handlePrintOrder.bind(this));
        this.eventManager.onAction('close-order-details', this.handleCloseOrderDetails.bind(this));

        // Size selection events
        this.eventManager.onAction('select-size', this.handleSelectSize.bind(this));

        // Extra ingredients events
        this.eventManager.onAction('toggle-extras', this.handleToggleExtras.bind(this));
        this.eventManager.onAction('increase-extra', this.handleIncreaseExtra.bind(this));
        this.eventManager.onAction('decrease-extra', this.handleDecreaseExtra.bind(this));

        // Simple direct navigation events
        this.setupSimpleNavigation();

        // State change listeners
        this.stateManager.subscribe('cart', this.updateCartDisplay.bind(this));
        this.stateManager.subscribe('currentCategory', this.updateProductsDisplay.bind(this));
        this.stateManager.subscribe('searchQuery', this.updateProductsDisplay.bind(this));
        // Note: ui.currentScreen subscription removed to prevent conflicts with direct switching

        console.log('✅ Event handlers set up');
    }

    async renderApp() {
        console.log('🎨 Rendering application...');

        const appContainer = document.getElementById('app');
        if (!appContainer) {
            throw new Error('App container not found');
        }

        const appHtml = await this.buildAppLayout();
        appContainer.innerHTML = appHtml;

        console.log('✅ Application rendered');
        
        // Set initial screen state after render
        this.setInitialScreenState();
    }

    setInitialScreenState() {
        console.log('🔧 Setting initial screen state...');
        const currentScreen = this.stateManager.get('ui.currentScreen');
        console.log(`🔧 Current screen: ${currentScreen}`);
        
        // Force screen switch without debouncing
        this.performScreenSwitchForce(currentScreen);
    }

    performScreenSwitchForce(screenName) {
        console.log(`🔧 FORCE: Setting screen to: ${screenName}`);
        
        const orderBlock = document.getElementById('orders-items-block');
        const historyBlock = document.getElementById('orders-list-block');
        
        if (!orderBlock || !historyBlock) {
            console.log('❌ FORCE: Screen blocks not found');
            return;
        }

        // Force set display styles
        if (screenName === 'order-creation') {
            orderBlock.style.display = 'flex';
            historyBlock.style.display = 'none';
            console.log('✅ FORCE: Orders Items screen active');
        } else {
            orderBlock.style.display = 'none';
            historyBlock.style.display = 'block';
            console.log('✅ FORCE: Orders List screen active');
        }

        // Update button states
        this.updateHeaderButtonsState();
    }

    setupSimpleNavigation() {
        // Wait for DOM to be ready, then attach direct listeners
        setTimeout(() => {
            console.log('🔧 Setting up simple navigation...');
            
            const ordersItemsBtn = document.querySelector('[data-action="orders-items"]');
            const ordersListBtn = document.querySelector('[data-action="orders-list"]');
            
            if (ordersItemsBtn) {
                ordersItemsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ SIMPLE: Orders Items clicked');
                    this.showOrdersItems();
                });
                console.log('✅ Orders Items button listener added');
            }
            
            if (ordersListBtn) {
                ordersListBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ SIMPLE: Orders List clicked');
                    this.showOrdersList();
                });
                console.log('✅ Orders List button listener added');
            }
        }, 100);
    }

    showOrdersItems() {
        console.log('📱 SIMPLE: Showing Orders Items');
        
        const ordersBlock = document.getElementById('orders-items-block');
        const historyBlock = document.getElementById('orders-list-block');
        const ordersItemsBtn = document.querySelector('[data-action="orders-items"]');
        const ordersListBtn = document.querySelector('[data-action="orders-list"]');
        
        if (ordersBlock && historyBlock) {
            ordersBlock.style.display = 'flex';
            historyBlock.style.display = 'none';
            console.log('✅ SIMPLE: Orders Items shown');
        }
        
        if (ordersItemsBtn && ordersListBtn) {
            ordersItemsBtn.classList.add('active');
            ordersListBtn.classList.remove('active');
            console.log('✅ SIMPLE: Buttons updated');
        }
        
        this.stateManager.set('ui.currentScreen', 'order-creation');
    }

    showOrdersList() {
        console.log('📱 SIMPLE: Showing Orders List');
        
        const ordersBlock = document.getElementById('orders-items-block');
        const historyBlock = document.getElementById('orders-list-block');
        const ordersItemsBtn = document.querySelector('[data-action="orders-items"]');
        const ordersListBtn = document.querySelector('[data-action="orders-list"]');
        
        if (ordersBlock && historyBlock) {
            ordersBlock.style.display = 'none';
            historyBlock.style.display = 'block';
            console.log('✅ SIMPLE: Orders List shown');
        }
        
        if (ordersItemsBtn && ordersListBtn) {
            ordersItemsBtn.classList.remove('active');
            ordersListBtn.classList.add('active');
            console.log('✅ SIMPLE: Buttons updated');
        }
        
        // Update history content
        this.updateOrdersHistoryDisplay();
        this.stateManager.set('ui.currentScreen', 'orders-list');
    }

    setupQuantityHandlers() {
        // Use delegation to handle quantity input changes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('vect-quantity-value')) {
                this.handleQuantityInput(e);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('vect-quantity-value')) {
                this.handleQuantityChange(e);
            }
        });

        // Add blur event to save changes when user leaves the field
        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('vect-quantity-value')) {
                this.handleQuantityChange(e);
            }
        }, true);

        console.log('✅ Quantity input handlers set up');
    }

    handleQuantityInput(event) {
        const input = event.target;
        let newQuantity = parseInt(input.value);

        // Only validate input without updating cart state
        // This prevents re-rendering while user is typing
        if (isNaN(newQuantity) || newQuantity < 1) {
            // Don't do anything for invalid values, let user continue typing
            return;
        }

        // No state update here - only when user finishes input (change/blur events)
    }

    handleQuantityChange(event) {
        const input = event.target;
        const itemIndex = parseInt(input.dataset.itemIndex);
        let newQuantity = parseInt(input.value);

        // Validate and correct input
        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
            input.value = newQuantity;
        }

        // Update cart
        this.updateCartQuantity(itemIndex, newQuantity);
    }

    updateCartQuantity(itemIndex, newQuantity) {
        const cart = this.stateManager.get('cart');
        if (cart[itemIndex] && cart[itemIndex].quantity !== newQuantity) {
            const oldQuantity = cart[itemIndex].quantity;
            cart[itemIndex].quantity = newQuantity;
            this.stateManager.set('cart', cart);
            console.log(`📊 Quantity updated: item ${itemIndex} from ${oldQuantity} to ${newQuantity}`);
        }
    }

    async buildAppLayout() {
        const currentScreen = this.stateManager.get('ui.currentScreen');
        
        // Get component templates
        const headerTemplate = this.components.get('header');

        // Prepare header data
        const headerData = {
            logoText: 'Vectis POS',
            pageTitle: 'Orders Management',
            centerContent: '',
            buttons: this.renderHeaderButtons()
        };

        // Render header
        const header = this.templateEngine.render(headerTemplate, headerData);

        // Build unified layout with both blocks
        return this.buildUnifiedLayout(header, currentScreen);
    }

    async buildUnifiedLayout(header, currentScreen) {
        // Get all component templates
        const cartTemplate = this.components.get('cart');
        const categoriesTemplate = this.components.get('categories');
        const searchTemplate = this.components.get('search');
        const productsGridTemplate = this.components.get('products-grid');
        const orderHistoryTemplate = this.components.get('order-history');

        // Prepare data for order creation components
        const cartData = {
            itemCount: this.stateManager.getCartItemCount(),
            cartItems: this.renderCartItems(),
            cartSummary: this.renderCartSummary(),
            orderActions: this.renderOrderActions()
        };

        const categoriesData = {
            categoryItems: this.renderCategoryItems()
        };

        const searchData = {
            searchPlaceholder: 'Search products...',
            searchQuery: this.stateManager.get('searchQuery'),
            clearButtonStyle: this.stateManager.get('searchQuery') ? 'display: block;' : 'display: none;'
        };

        const productsData = {
            productItems: this.renderProductItems()
        };

        // Prepare data for orders history
        const orderHistoryData = {
            title: 'Order History',
            orderCount: this.stateManager.get('orders').length,
            orderItems: this.renderOrderHistoryItems()
        };

        // Render all components
        const cart = this.templateEngine.render(cartTemplate, cartData);
        const categories = this.templateEngine.render(categoriesTemplate, categoriesData);
        const search = this.templateEngine.render(searchTemplate, searchData);
        const productsGrid = this.templateEngine.render(productsGridTemplate, productsData);
        const orderHistory = this.templateEngine.render(orderHistoryTemplate, orderHistoryData);

        // Build complete layout with both blocks
        return `
            <div class="pos-layout vect-theme">
                ${header}
                <div class="vect-main">
                    <!-- Orders Items Block -->
                    <div class="vect-order" id="orders-items-block">
                        <div class="vect-sidebar">
                            ${cart}
                        </div>
                        <div class="vect-content">
                            <div class="vect-controls">
                                <div class="vect-categories-search-container">
                                    ${categories}
                                    ${search}
                                </div>
                            </div>
                            <div class="vect-products-section">
                                ${productsGrid}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Orders History Block -->
                    <div class="vect-orders-history" id="orders-list-block">
                        <div class="vect-content full-width">
                            ${orderHistory}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }


    renderHeaderButtons() {
        const currentScreen = this.stateManager.get('ui.currentScreen');
        
        return `
            <button class="vect-btn orders-items-btn ${currentScreen === 'order-creation' ? 'active' : ''}" 
                    data-action="orders-items">
                <span class="orders-icon">🛒</span>
                <span class="orders-text">Orders Items</span>
            </button>
            <button class="vect-btn orders-list-btn ${currentScreen === 'orders-list' ? 'active' : ''}" 
                    data-action="orders-list">
                <span class="orders-icon">📋</span>
                <span class="orders-text">Orders List</span>
            </button>
        `;
    }

    renderCartItems() {
        const cart = this.stateManager.get('cart');
        
        if (cart.length === 0) {
            return `
                <div class="vect-empty-state">
                    <div class="vect-empty-icon">🛒</div>
                    <div class="vect-empty-title">Cart is empty</div>
                    <div class="vect-empty-description">Add products to start an order</div>
                </div>
            `;
        }

        return cart.map((item, index) => {
            const isMinQuantity = item.quantity === 1;
            const isCustomizable = item.customizable === true;
            const hasExtras = item.extras && Object.keys(item.extras).length > 0;
            
            // Calculate item total including extras
            let itemTotal = item.price * item.quantity;
            if (item.extras) {
                Object.values(item.extras).forEach(extra => {
                    itemTotal += extra.price * extra.quantity * item.quantity;
                });
            }
            
            return `
                <div class="vect-cart-item ${isCustomizable ? 'customizable' : ''}" data-item-index="${index}">
                    <div class="vect-cart-item-row-1">
                        <div class="vect-cart-item-main-info">
                            <div class="vect-cart-item-name">${item.name}</div>
                            <div class="vect-cart-item-price">€${item.price.toFixed(2)} each</div>
                            <div class="vect-cart-item-total">Total: €${itemTotal.toFixed(2)}</div>
                        </div>
                        <div class="vect-cart-item-controls">
                            <div class="vect-cart-item-quantity">
                                <button class="vect-quantity-btn ${isMinQuantity ? 'disabled' : ''}" 
                                        data-action="decrease" 
                                        data-item-index="${index}"
                                        ${isMinQuantity ? 'disabled' : ''}
                                        title="${isMinQuantity ? 'Minimum quantity is 1' : 'Decrease quantity'}">-</button>
                                <input type="number" class="vect-quantity-value" value="${item.quantity}" min="1" data-item-index="${index}">
                                <button class="vect-quantity-btn" data-action="increase" data-item-index="${index}" title="Increase quantity">+</button>
                            </div>
                            <button class="vect-remove-item" data-action="remove-from-cart" data-item-index="${index}" title="Remove item from cart">🗑️</button>
                        </div>
                    </div>
                    ${item.category === 'pizza' ? this.renderSizeSelection(item, index) : ''}
                    ${isCustomizable ? this.renderExtraIngredientsAccordion(item, index, hasExtras) : ''}
                </div>
            `;
        }).join('');
    }

    renderSizeSelection(item, itemIndex) {
        const currentSize = item.size || '30cm';
        
        return `
            <div class="vect-cart-item-row-2">
                <div class="vect-size-selection">
                    <div class="vect-size-label">Size</div>
                    <div class="vect-size-options">
                        <button class="vect-size-option ${currentSize === '30cm' ? 'selected' : ''}" 
                                data-action="select-size" 
                                data-item-index="${itemIndex}"
                                data-size="30cm">
                            30cm
                        </button>
                        <button class="vect-size-option ${currentSize === '40cm' ? 'selected' : ''}" 
                                data-action="select-size" 
                                data-item-index="${itemIndex}"
                                data-size="40cm">
                            40cm
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderExtraIngredientsAccordion(item, itemIndex, hasExtras) {
        const extraIngredients = this.stateManager.get('extraIngredients');
        const isExpanded = item.extrasExpanded || false;
        
        return `
            <div class="vect-cart-item-row-3">
                ${hasExtras ? this.renderSelectedExtras(item) : ''}
                <div class="vect-extras-accordion">
                    <div class="vect-extras-header" data-action="toggle-extras" data-item-index="${itemIndex}">
                        <span class="vect-extras-label" data-action="toggle-extras" data-item-index="${itemIndex}">
                            🍕 Extra Ingredients 
                            ${hasExtras ? `(${Object.keys(item.extras).length} selected)` : ''}
                        </span>
                        <span class="vect-accordion-icon ${isExpanded ? 'expanded' : ''}" data-action="toggle-extras" data-item-index="${itemIndex}">${isExpanded ? '−' : '+'}</span>
                    </div>
                    <div class="vect-extras-content ${isExpanded ? 'expanded' : 'collapsed'}">
                        ${extraIngredients.map(ingredient => {
                            const extraItem = item.extras ? item.extras[ingredient.id] : null;
                            const quantity = extraItem ? extraItem.quantity : 0;
                            const isMinQuantity = quantity <= 0;
                            
                            return `
                                <div class="vect-extra-ingredient" data-ingredient-id="${ingredient.id}">
                                    <div class="vect-extra-info">
                                        <div class="vect-extra-name">
                                            <span class="vect-extra-icon">${ingredient.icon}</span>
                                            ${ingredient.name}
                                        </div>
                                        <div class="vect-extra-price">+€${ingredient.price.toFixed(2)}</div>
                                    </div>
                                    <div class="vect-extra-controls">
                                        <button class="vect-extra-btn ${isMinQuantity ? 'disabled' : ''}" 
                                                data-action="decrease-extra" 
                                                data-item-index="${itemIndex}"
                                                data-ingredient-id="${ingredient.id}"
                                                ${isMinQuantity ? 'disabled' : ''}
                                                title="Decrease ingredient">−</button>
                                        <span class="vect-extra-quantity">${quantity}</span>
                                        <button class="vect-extra-btn" 
                                                data-action="increase-extra" 
                                                data-item-index="${itemIndex}"
                                                data-ingredient-id="${ingredient.id}"
                                                title="Add ingredient">+</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderSelectedExtras(item) {
        if (!item.extras || Object.keys(item.extras).length === 0) {
            return '';
        }

        const selectedExtras = Object.values(item.extras).filter(extra => extra.quantity > 0);
        
        return `
            <div class="vect-selected-extras">
                <div class="vect-selected-extras-label">Selected extras:</div>
                <div class="vect-selected-extras-list">
                    ${selectedExtras.map(extra => `
                        <div class="vect-selected-extra-item">
                            <span class="vect-selected-extra-name">${extra.name}</span>
                            <span class="vect-selected-extra-quantity">×${extra.quantity}</span>
                            <span class="vect-selected-extra-price">+€${(extra.price * extra.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCartSummary() {
        const cart = this.stateManager.get('cart');
        const subtotal = this.stateManager.getCartTotal();
        const tax = subtotal * 0.21;
        const total = subtotal + tax;

        return `
            <div class="vect-summary-line">
                <span>Items (${cart.length})</span>
                <span>${this.stateManager.getCartItemCount()}</span>
            </div>
            <div class="vect-summary-line">
                <span>Subtotal</span>
                <span>€${subtotal.toFixed(2)}</span>
            </div>
            <div class="vect-summary-line">
                <span>Tax (21%)</span>
                <span>€${tax.toFixed(2)}</span>
            </div>
            <div class="vect-summary-line total">
                <span>Total</span>
                <span>€${total.toFixed(2)}</span>
            </div>
        `;
    }

    renderOrderActions() {
        const cart = this.stateManager.get('cart');
        const total = this.stateManager.getCartTotal() * 1.21;
        
        return `
            <button class="vect-btn vect-clear-btn" data-action="clear-cart" ${cart.length === 0 ? 'disabled' : ''}>
                Clear Cart
            </button>
            <button class="vect-btn vect-checkout-btn" data-action="checkout" ${cart.length === 0 ? 'disabled' : ''}>
                Create Order
            </button>
        `;
    }

    renderCategoryItems() {
        const categories = this.stateManager.get('categories');
        const currentCategory = this.stateManager.get('currentCategory');

        return categories.map(category => `
            <div class="vect-category-item ${currentCategory === category.id ? 'active' : ''}" 
                 data-category="${category.id}">
                ${category.icon} ${category.name}
            </div>
        `).join('');
    }

    renderProductItems() {
        const products = this.stateManager.get('products');
        const currentCategory = this.stateManager.get('currentCategory');
        const searchQuery = this.stateManager.get('searchQuery').toLowerCase();

        const filteredProducts = products.filter(product => {
            const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
            const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (filteredProducts.length === 0) {
            return '<div class="vect-no-products">No products found</div>';
        }

        return filteredProducts.map(product => `
            <div class="vect-product-card clickable" data-product-id="${product.id}" title="Click to add ${product.name} to cart">
                <div class="vect-product-image">${product.image}</div>
                <div class="vect-product-info">
                    <div class="vect-product-name">${product.name}</div>
                    <div class="vect-product-price">€${product.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }

    renderOrderHistoryItems() {
        const orders = this.stateManager.get('orders');
        console.log(`📋 Rendering ${orders.length} orders in history`);
        
        if (orders.length === 0) {
            return `
                <div class="vect-empty-state">
                    <div class="vect-empty-icon">📋</div>
                    <div class="vect-empty-title">No orders yet</div>
                    <div class="vect-empty-description">Completed orders will appear here</div>
                </div>
            `;
        }

        return orders.reverse().map(order => `
            <div class="vect-order-item" data-order-id="${order.id}">
                <div class="vect-order-header">
                    <div class="vect-order-id">Order #${order.id}</div>
                    <div class="vect-order-total">€${order.total.toFixed(2)}</div>
                </div>
                <div class="vect-order-details">
                    <div class="vect-order-time">${new Date(order.timestamp).toLocaleString()}</div>
                    <div class="vect-order-items-count">${order.items.length} items</div>
                </div>
                <div class="vect-order-items-preview">
                    ${order.items.slice(0, 3).map(item => `
                        <span class="vect-order-item-name">${item.name} (${item.quantity})</span>
                    `).join(', ')}
                    ${order.items.length > 3 ? '...' : ''}
                </div>
            </div>
        `).join('');
    }

    renderOrderDetails(order) {
        if (!order) {
            return '';
        }

        const orderDate = new Date(order.timestamp).toLocaleString();
        const subtotal = order.total * 0.85; // Assuming 15% tax
        const tax = order.total * 0.15;

        return `
            <div class="vect-order-details-header">
                <h3 id="order-details-title">Order #${order.id}</h3>
                <div class="vect-order-details-actions">
                    <button class="vect-btn vect-btn-print" data-action="print-order" data-order-id="${order.id}">
                        🖨️ Print
                    </button>
                    <button class="vect-btn vect-btn-secondary" data-action="close-order-details">
                        ✕ Close
                    </button>
                </div>
            </div>
            
            <div class="vect-order-details-info">
                <div class="vect-detail-group">
                    <label>Order Date</label>
                    <span id="order-details-date">${orderDate}</span>
                </div>
                <div class="vect-detail-group">
                    <label>Customer</label>
                    <span id="order-details-customer">Walk-in Customer</span>
                </div>
                <div class="vect-detail-group">
                    <label>Status</label>
                    <span id="order-details-status" class="vect-status status-completed">Completed</span>
                </div>
                <div class="vect-detail-group">
                    <label>Total</label>
                    <span id="order-details-total" class="vect-order-total">€${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="vect-order-items-detail">
                <h4>Order Items</h4>
                <div class="vect-items-list">
                    ${order.items.map(item => {
                        // Calculate item total including extras
                        let itemTotal = item.price * item.quantity;
                        if (item.extras) {
                            Object.values(item.extras).forEach(extra => {
                                itemTotal += extra.price * extra.quantity * item.quantity;
                            });
                        }
                        
                        return `
                            <div class="vect-order-detail-item ${item.customizable ? 'customizable' : ''}">
                                <div class="vect-item-info">
                                    <div class="vect-item-name">${item.name}</div>
                                    <div class="vect-item-price">€${item.price.toFixed(2)} each</div>
                                    ${item.extras && Object.keys(item.extras).length > 0 ? `
                                        <div class="vect-item-extras">
                                            <div class="vect-extras-label">Extra Ingredients:</div>
                                            <div class="vect-extras-list">
                                                ${Object.values(item.extras).map(extra => `
                                                    <div class="vect-extra-item">
                                                        <span>${extra.name} ×${extra.quantity}</span>
                                                        <span>+€${(extra.price * extra.quantity).toFixed(2)}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="vect-item-quantity">
                                    <span class="vect-quantity-label">Qty:</span>
                                    <span class="vect-quantity-value">${item.quantity}</span>
                                </div>
                                <div class="vect-item-total">
                                    €${itemTotal.toFixed(2)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="vect-order-summary">
                <div class="vect-summary-row">
                    <span>Subtotal:</span>
                    <span>€${subtotal.toFixed(2)}</span>
                </div>
                <div class="vect-summary-row">
                    <span>Tax (15%):</span>
                    <span>€${tax.toFixed(2)}</span>
                </div>
                <div class="vect-summary-row vect-summary-total">
                    <span><strong>Total:</strong></span>
                    <span><strong>€${order.total.toFixed(2)}</strong></span>
                </div>
            </div>
        `;
    }

    showOrderDetails(orderId) {
        const orders = this.stateManager.get('orders');
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            console.error(`Order ${orderId} not found`);
            return;
        }

        console.log(`📋 Showing details for order #${orderId}`);
        
        // Hide placeholder and show details
        const placeholder = document.getElementById('order-details-placeholder');
        const content = document.getElementById('order-details-content');
        
        if (placeholder) placeholder.style.display = 'none';
        if (content) {
            content.style.display = 'block';
            content.innerHTML = this.renderOrderDetails(order);
        }

        // Update active state
        document.querySelectorAll('.vect-order-item').forEach(item => {
            item.classList.toggle('active', item.dataset.orderId === orderId.toString());
        });
    }

    hideOrderDetails() {
        console.log('📋 Hiding order details');
        
        const placeholder = document.getElementById('order-details-placeholder');
        const content = document.getElementById('order-details-content');
        
        if (placeholder) placeholder.style.display = 'block';
        if (content) content.style.display = 'none';

        // Remove active state
        document.querySelectorAll('.vect-order-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    printOrder(orderId) {
        const orders = this.stateManager.get('orders');
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            console.error(`Order ${orderId} not found`);
            return;
        }

        console.log(`🖨️ Printing order #${orderId}`);
        
        // Create print window
        const printWindow = window.open('', '_blank');
        const orderDate = new Date(order.timestamp).toLocaleString();
        const subtotal = order.total * 0.85;
        const tax = order.total * 0.15;
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Order #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .print-header { text-align: center; margin-bottom: 30px; }
                    .print-order-info { margin-bottom: 20px; }
                    .print-items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .print-items-table th, .print-items-table td { 
                        padding: 10px; border: 1px solid #ddd; text-align: left; 
                    }
                    .print-items-table th { background-color: #f5f5f5; }
                    .print-summary { margin-top: 20px; text-align: right; }
                    .print-summary-row { margin: 5px 0; }
                    .print-total { font-weight: bold; font-size: 18px; margin-top: 10px; }
                    .print-footer { text-align: center; margin-top: 40px; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Simplified Vectis</h1>
                    <p>HTML Components POS System</p>
                </div>
                
                <div class="print-order-info">
                    <h2>Order #${order.id}</h2>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Customer:</strong> Walk-in Customer</p>
                    <p><strong>Status:</strong> Completed</p>
                </div>
                
                <table class="print-items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => {
                            // Calculate item total including extras
                            let itemTotal = item.price * item.quantity;
                            if (item.extras) {
                                Object.values(item.extras).forEach(extra => {
                                    itemTotal += extra.price * extra.quantity * item.quantity;
                                });
                            }
                            
                            let rows = `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>€${item.price.toFixed(2)}</td>
                                    <td>€${itemTotal.toFixed(2)}</td>
                                </tr>
                            `;
                            
                            // Add extra ingredients as sub-rows
                            if (item.extras && Object.keys(item.extras).length > 0) {
                                Object.values(item.extras).forEach(extra => {
                                    rows += `
                                        <tr>
                                            <td style="padding-left: 30px; font-size: 0.9em; color: #666;">
                                                + ${extra.name}
                                            </td>
                                            <td style="font-size: 0.9em; color: #666;">${extra.quantity}</td>
                                            <td style="font-size: 0.9em; color: #666;">€${extra.price.toFixed(2)}</td>
                                            <td style="font-size: 0.9em; color: #666;">€${(extra.price * extra.quantity).toFixed(2)}</td>
                                        </tr>
                                    `;
                                });
                            }
                            
                            return rows;
                        }).join('')}
                    </tbody>
                </table>
                
                <div class="print-summary">
                    <div class="print-summary-row">
                        <span>Subtotal: €${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="print-summary-row">
                        <span>Tax (15%): €${tax.toFixed(2)}</span>
                    </div>
                    <div class="print-summary-row print-total">
                        <span>Total: €${order.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="print-footer">
                    <p>Thank you for your business!</p>
                    <p>Printed on: ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }

    // Event Handlers
    handleAddToCart(data) {
        const productId = parseInt(data.data.productId);
        const products = this.stateManager.get('products');
        const product = products.find(p => p.id === productId);
        
        if (product) {
            this.stateManager.addToCart(product);
            this.showNotification(`${product.name} added to cart`, 'success');
        }
    }

    handleProductClick(data) {
        const productCard = data.target.closest('.vect-product-card');
        if (productCard) {
            const productId = parseInt(productCard.dataset.productId);
            const products = this.stateManager.get('products');
            const product = products.find(p => p.id === productId);
            
            if (product) {
                this.stateManager.addToCart(product);
                this.showNotification(`${product.name} added to cart`, 'success');
            }
        }
    }

    handleRemoveFromCart(data) {
        const index = parseInt(data.data.itemIndex);
        const cart = this.stateManager.get('cart');
        const item = cart[index];
        
        if (item) {
            cart.splice(index, 1);
            this.stateManager.set('cart', cart);
            this.showNotification(`${item.name} removed from cart`, 'info');
        }
    }

    handleIncreaseQuantity(data) {
        const index = parseInt(data.data.itemIndex);
        const cart = this.stateManager.get('cart');
        
        if (cart[index]) {
            this.stateManager.increaseCartQuantity(cart[index].id);
        }
    }

    handleDecreaseQuantity(data) {
        const index = parseInt(data.data.itemIndex);
        const cart = this.stateManager.get('cart');
        
        if (cart[index] && cart[index].quantity > 1) {
            this.stateManager.decreaseCartQuantity(cart[index].id);
        }
        // If quantity is 1, do nothing (button should be disabled)
    }

    handleClearCart() {
        if (confirm('Are you sure you want to clear the cart?')) {
            this.stateManager.clearCart();
            this.showNotification('Cart cleared', 'info');
        }
    }

    handleCheckout() {
        console.log('🛒 CREATE ORDER: Starting checkout process...');
        const cart = this.stateManager.get('cart');
        console.log('🛒 CREATE ORDER: Cart contents:', cart);
        
        if (cart.length === 0) {
            console.log('🛒 CREATE ORDER: Cart is empty, showing warning');
            this.showNotification('Cart is empty', 'warning');
            return;
        }

        const total = this.stateManager.getCartTotal() * 1.21;
        console.log('🛒 CREATE ORDER: Calculated total:', total);
        
        const orderData = {
            id: Date.now(),
            items: [...cart],
            total: total,
            timestamp: new Date().toISOString()
        };
        console.log('🛒 CREATE ORDER: Created order data:', orderData);

        // Add to orders history
        const orders = this.stateManager.get('orders');
        console.log('🛒 CREATE ORDER: Current orders before adding:', orders.length);
        orders.push(orderData);
        this.stateManager.set('orders', orders);
        console.log('🛒 CREATE ORDER: Orders after adding:', orders.length);
        
        // Clear cart
        console.log('🛒 CREATE ORDER: Clearing cart...');
        this.stateManager.clearCart();
        const cartAfterClear = this.stateManager.get('cart');
        console.log('🛒 CREATE ORDER: Cart after clearing:', cartAfterClear);
        
        // Update orders history display
        console.log('🛒 CREATE ORDER: Updating orders history display...');
        this.updateOrdersHistoryDisplay();
        
        // Optionally switch to orders history to show the new order
        // Uncomment the line below to auto-switch to Order History after creating order
        // this.switchToScreen('orders-list');
        
        console.log('🛒 CREATE ORDER: Showing success notification...');
        this.showNotification(`Order #${orderData.id} created successfully - €${total.toFixed(2)}`, 'success');
        console.log('🛒 CREATE ORDER: Checkout process completed!');
    }

    handleCategoryChange(data) {
        const category = data.target.dataset.category;
        if (category) {
            this.stateManager.set('currentCategory', category);
        }
    }

    handleSearch(data) {
        this.stateManager.set('searchQuery', data.value);
    }

    async handleOrdersItems() {
        console.log('🔄 BUTTON CLICKED: Switching to Orders Items...');
        this.switchToScreen('order-creation');
        this.showNotification('Switched to Orders Items', 'info');
    }

    async handleOrdersList() {
        console.log('📋 BUTTON CLICKED: Switching to Orders List...');
        this.switchToScreen('orders-list');
        this.showNotification('Switched to Orders List', 'info');
    }

    handleOrderClick(data) {
        const orderItem = data.target.closest('.vect-order-item');
        if (orderItem) {
            const orderId = parseInt(orderItem.dataset.orderId);
            this.showOrderDetails(orderId);
        }
    }

    handlePrintOrder(data) {
        const orderId = parseInt(data.data.orderId);
        this.printOrder(orderId);
    }

    handleCloseOrderDetails() {
        this.hideOrderDetails();
    }

    handleSelectSize(data) {
        console.log('📏 handleSelectSize called with data:', data);
        const itemIndex = parseInt(data.data.itemIndex);
        const size = data.data.size;
        const cart = this.stateManager.get('cart');
        const item = cart[itemIndex];
        
        if (item) {
            const oldSize = item.size || '30cm';
            item.size = size;
            
            // Update price based on size - 40cm costs 20% more
            if (size === '40cm' && oldSize === '30cm') {
                item.price = Math.round(item.price * 1.2 * 100) / 100;
            } else if (size === '30cm' && oldSize === '40cm') {
                item.price = Math.round(item.price / 1.2 * 100) / 100;
            }
            
            console.log(`📏 Changed size for ${item.name} from ${oldSize} to ${size}, new price: €${item.price}`);
            this.stateManager.set('cart', cart);
        } else {
            console.error(`❌ No item found at index ${itemIndex}`);
        }
    }

    handleToggleExtras(data) {
        console.log('🔧 handleToggleExtras called with data:', data);
        const itemIndex = parseInt(data.data.itemIndex);
        const cart = this.stateManager.get('cart');
        const item = cart[itemIndex];
        
        if (item) {
            const wasExpanded = item.extrasExpanded;
            item.extrasExpanded = !item.extrasExpanded;
            console.log(`🍕 Toggling extras for ${item.name} at index ${itemIndex}: ${wasExpanded ? 'EXPANDED' : 'COLLAPSED'} → ${item.extrasExpanded ? 'EXPANDED' : 'COLLAPSED'}`);
            this.stateManager.set('cart', cart);
        } else {
            console.error(`❌ No item found at index ${itemIndex}`);
        }
    }

    handleIncreaseExtra(data) {
        const itemIndex = parseInt(data.data.itemIndex);
        const ingredientId = data.data.ingredientId;
        const cart = this.stateManager.get('cart');
        const item = cart[itemIndex];
        const extraIngredients = this.stateManager.get('extraIngredients');
        const ingredient = extraIngredients.find(ing => ing.id === ingredientId);
        
        if (item && ingredient) {
            if (!item.extras) {
                item.extras = {};
            }
            
            if (!item.extras[ingredientId]) {
                item.extras[ingredientId] = {
                    id: ingredient.id,
                    name: ingredient.name,
                    price: ingredient.price,
                    quantity: 0
                };
            }
            
            item.extras[ingredientId].quantity += 1;
            this.stateManager.set('cart', cart);
        }
    }

    handleDecreaseExtra(data) {
        const itemIndex = parseInt(data.data.itemIndex);
        const ingredientId = data.data.ingredientId;
        const cart = this.stateManager.get('cart');
        const item = cart[itemIndex];
        
        if (item && item.extras && item.extras[ingredientId]) {
            item.extras[ingredientId].quantity -= 1;
            
            // Remove ingredient if quantity reaches 0
            if (item.extras[ingredientId].quantity <= 0) {
                delete item.extras[ingredientId];
            }
            
            this.stateManager.set('cart', cart);
        }
    }

    switchToScreen(screenName) {
        const currentScreen = this.stateManager.get('ui.currentScreen');
        
        // Don't switch if already on the target screen
        if (currentScreen === screenName) {
            console.log(`✅ Already on ${screenName} screen`);
            return;
        }
        
        const now = Date.now();
        
        // Debounce rapid clicks
        if (now - this.lastScreenSwitch < this.switchCooldown) {
            console.log('⏱️ Switch ignored (too fast)');
            return;
        }
        
        this.lastScreenSwitch = now;
        console.log(`🔄 Switching from ${currentScreen} to ${screenName}`);
        
        // Update state immediately
        this.stateManager.set('ui.currentScreen', screenName);
        
        // Switch UI immediately without waiting for state subscription
        this.performScreenSwitch(screenName);
    }

    performScreenSwitch(screenName) {
        console.log(`🖼️ DETAILED: Performing screen switch to: ${screenName}`);
        
        // Get DOM elements with detailed logging (using IDs for reliability)
        const orderBlock = document.getElementById('orders-items-block');
        const historyBlock = document.getElementById('orders-list-block');
        
        console.log('🔍 DETAILED: DOM elements check:', {
            orderBlock: {
                found: !!orderBlock,
                display: orderBlock?.style?.display || 'not set',
                computedDisplay: orderBlock ? getComputedStyle(orderBlock).display : 'N/A'
            },
            historyBlock: {
                found: !!historyBlock,
                display: historyBlock?.style?.display || 'not set',
                computedDisplay: historyBlock ? getComputedStyle(historyBlock).display : 'N/A'
            }
        });
        
        if (!orderBlock || !historyBlock) {
            console.log('❌ DETAILED: Screen blocks not found, falling back to full render');
            this.renderApp();
            return;
        }

        console.log(`🔄 DETAILED: Switching to ${screenName}...`);

        // Switch screens immediately
        if (screenName === 'order-creation') {
            console.log('📱 DETAILED: Setting order block to flex, history block to none');
            orderBlock.style.display = 'flex';
            historyBlock.style.display = 'none';
            console.log('✅ DETAILED: Orders Items screen should be visible now');
        } else if (screenName === 'orders-list') {
            console.log('📱 DETAILED: Setting order block to none, history block to block');
            orderBlock.style.display = 'none';
            historyBlock.style.display = 'block';
            console.log('✅ DETAILED: Orders List screen should be visible now');
            
            console.log('🔄 DETAILED: Updating orders history display...');
            this.updateOrdersHistoryDisplay();
        }

        // Verify the switch actually happened
        console.log('🔍 DETAILED: After switch verification:', {
            orderBlock: {
                display: orderBlock.style.display,
                computedDisplay: getComputedStyle(orderBlock).display,
                visible: getComputedStyle(orderBlock).display !== 'none'
            },
            historyBlock: {
                display: historyBlock.style.display,
                computedDisplay: getComputedStyle(historyBlock).display,
                visible: getComputedStyle(historyBlock).display !== 'none'
            }
        });

        // Update buttons with immediate feedback
        console.log('🔄 DETAILED: Updating header buttons...');
        this.updateHeaderButtonsState();
        console.log('🔄 DETAILED: Adding click feedback...');
        this.addClickFeedback(screenName);
        
        console.log('✅ DETAILED: performScreenSwitch completed');
    }

    // Legacy method - no longer used, replaced by performScreenSwitch
    async handleScreenChange() {
        console.log('⚠️ Legacy handleScreenChange called - this should not happen');
        const currentScreen = this.stateManager.get('ui.currentScreen');
        this.performScreenSwitch(currentScreen);
    }

    // UI Updates
    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('vect-cart-items');
        const cartSummaryContainer = document.getElementById('vect-cart-summary');
        const cartCount = document.getElementById('vect-cart-count');

        // Save focus state before updating
        let focusState = null;
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('vect-quantity-value')) {
            focusState = {
                itemIndex: activeElement.dataset.itemIndex,
                selectionStart: activeElement.selectionStart,
                selectionEnd: activeElement.selectionEnd
            };
        }

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = this.renderCartItems();
        }
        
        if (cartSummaryContainer) {
            cartSummaryContainer.innerHTML = this.renderCartSummary();
        }

        if (cartCount) {
            cartCount.textContent = this.stateManager.getCartItemCount();
        }

        // Restore focus state after updating
        if (focusState) {
            setTimeout(() => {
                const input = document.querySelector(`input.vect-quantity-value[data-item-index="${focusState.itemIndex}"]`);
                if (input) {
                    input.focus();
                    input.setSelectionRange(focusState.selectionStart, focusState.selectionEnd);
                }
            }, 0);
        }
    }

    updateProductsDisplay() {
        const productsGrid = document.getElementById('vect-products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = this.renderProductItems();
        }

        // Update category active state
        const categoryItems = document.querySelectorAll('.vect-category-item');
        const currentCategory = this.stateManager.get('currentCategory');
        
        categoryItems.forEach(item => {
            item.classList.toggle('active', item.dataset.category === currentCategory);
        });
    }

    updateOrdersHistoryDisplay() {
        console.log('🔄 Updating orders history display...');
        const orderHistoryContainer = document.querySelector('.vect-order-history-list');
        if (orderHistoryContainer) {
            console.log('✅ Found order history container');
            orderHistoryContainer.innerHTML = this.renderOrderHistoryItems();
        } else {
            console.log('❌ Order history container not found');
        }
        
        // Update order count
        const orderCountElement = document.querySelector('.vect-order-count');
        if (orderCountElement) {
            const orderCount = this.stateManager.get('orders').length;
            orderCountElement.textContent = `${orderCount} orders`;
            console.log(`✅ Updated order count: ${orderCount}`);
        } else {
            console.log('❌ Order count element not found');
        }
    }

    updateHeaderButtonsState() {
        const currentScreen = this.stateManager.get('ui.currentScreen');
        
        const ordersItemsBtn = document.querySelector('.orders-items-btn');
        const ordersListBtn = document.querySelector('.orders-list-btn');
        
        if (ordersItemsBtn && ordersListBtn) {
            // Remove active class from both
            ordersItemsBtn.classList.remove('active');
            ordersListBtn.classList.remove('active');
            
            // Add active class to current screen button
            if (currentScreen === 'order-creation') {
                ordersItemsBtn.classList.add('active');
                console.log('✅ Orders Items button marked as active');
            } else {
                ordersListBtn.classList.add('active');
                console.log('✅ Orders List button marked as active');
            }
        }
    }

    addClickFeedback(screenName) {
        const targetBtn = screenName === 'order-creation' 
            ? document.querySelector('.orders-items-btn')
            : document.querySelector('.orders-list-btn');
            
        if (targetBtn) {
            // Add temporary pulse effect
            targetBtn.style.transform = 'scale(0.95)';
            targetBtn.style.transition = 'transform 0.1s ease';
            
            setTimeout(() => {
                targetBtn.style.transform = 'scale(1)';
                setTimeout(() => {
                    targetBtn.style.transform = '';
                    targetBtn.style.transition = '';
                }, 100);
            }, 50);
            
            console.log('✨ Added click feedback animation');
        }
    }


    // Utilities
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;

        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };

        notification.style.background = colors[type] || colors.info;
        notification.style.color = 'white';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ef4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">Error</h3>
            <p style="margin: 0;">${message}</p>
        `;
        document.body.appendChild(errorDiv);
    }
}

export default VectisApp;