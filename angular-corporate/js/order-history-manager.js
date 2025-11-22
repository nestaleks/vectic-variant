/**
 * Order History Manager
 * Handles the two-column order history interface with order selection and details display
 */
export class OrderHistoryManager {
    constructor() {
        this.selectedOrderId = null;
        this.orders = [];
        this.filteredOrders = [];
        this.searchQuery = '';
        
        this.initializeEventListeners();
        this.loadSampleOrders(); // For demo purposes
    }

    initializeEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('order-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Print button
        const printBtn = document.getElementById('print-order-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printSelectedOrder();
            });
        }

        // Close details button
        const closeBtn = document.getElementById('close-details-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.clearOrderSelection();
            });
        }
    }

    loadSampleOrders() {
        // Sample orders for demonstration
        this.orders = [
            {
                id: 'ORD-001',
                orderNumber: 'ORD-001',
                date: '2024-01-15T14:30:00Z',
                customer: 'John Smith',
                status: 'completed',
                items: [
                    { 
                        id: 1, 
                        name: 'Margherita Pizza', 
                        quantity: 2, 
                        price: 12.99, 
                        total: 25.98,
                        details: 'Large, Extra Cheese'
                    },
                    { 
                        id: 2, 
                        name: 'Caesar Salad', 
                        quantity: 1, 
                        price: 8.50, 
                        total: 8.50,
                        details: 'With Grilled Chicken'
                    },
                    { 
                        id: 3, 
                        name: 'Coca Cola', 
                        quantity: 3, 
                        price: 2.50, 
                        total: 7.50,
                        details: '500ml'
                    }
                ],
                subtotal: 41.98,
                tax: 4.20,
                total: 46.18
            },
            {
                id: 'ORD-002',
                orderNumber: 'ORD-002',
                date: '2024-01-15T15:45:00Z',
                customer: 'Sarah Johnson',
                status: 'preparing',
                items: [
                    { 
                        id: 4, 
                        name: 'Pepperoni Pizza', 
                        quantity: 1, 
                        price: 15.99, 
                        total: 15.99,
                        details: 'Medium, Thin Crust'
                    },
                    { 
                        id: 5, 
                        name: 'Garlic Bread', 
                        quantity: 1, 
                        price: 5.99, 
                        total: 5.99,
                        details: 'With Cheese'
                    }
                ],
                subtotal: 21.98,
                tax: 2.20,
                total: 24.18
            },
            {
                id: 'ORD-003',
                orderNumber: 'ORD-003',
                date: '2024-01-15T16:20:00Z',
                customer: 'Mike Davis',
                status: 'ready',
                items: [
                    { 
                        id: 6, 
                        name: 'Hawaiian Pizza', 
                        quantity: 1, 
                        price: 14.99, 
                        total: 14.99,
                        details: 'Large, Extra Pineapple'
                    },
                    { 
                        id: 7, 
                        name: 'Greek Salad', 
                        quantity: 2, 
                        price: 7.50, 
                        total: 15.00,
                        details: 'With Feta Cheese'
                    },
                    { 
                        id: 8, 
                        name: 'Lemonade', 
                        quantity: 2, 
                        price: 3.00, 
                        total: 6.00,
                        details: 'Fresh Squeezed'
                    }
                ],
                subtotal: 35.99,
                tax: 3.60,
                total: 39.59
            },
            {
                id: 'ORD-004',
                orderNumber: 'ORD-004',
                date: '2024-01-15T17:10:00Z',
                customer: 'Emily Wilson',
                status: 'completed',
                items: [
                    { 
                        id: 9, 
                        name: 'Chicken Wings', 
                        quantity: 12, 
                        price: 0.99, 
                        total: 11.88,
                        details: 'BBQ Sauce'
                    },
                    { 
                        id: 10, 
                        name: 'Fries', 
                        quantity: 2, 
                        price: 4.50, 
                        total: 9.00,
                        details: 'Large, Seasoned'
                    }
                ],
                subtotal: 20.88,
                tax: 2.09,
                total: 22.97
            }
        ];

        this.filteredOrders = [...this.orders];
        this.renderOrdersList();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.filteredOrders = this.orders.filter(order => 
            order.orderNumber.toLowerCase().includes(this.searchQuery) ||
            order.customer.toLowerCase().includes(this.searchQuery) ||
            order.items.some(item => item.name.toLowerCase().includes(this.searchQuery))
        );
        this.renderOrdersList();
    }

    renderOrdersList() {
        const ordersList = document.getElementById('vect-order-history-list');
        if (!ordersList) return;

        if (this.filteredOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="vect-empty-state">
                    <h3>No Orders Found</h3>
                    <p>No orders match your search criteria</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = this.filteredOrders.map(order => `
            <div class="vect-order-item clickable ${order.id === this.selectedOrderId ? 'selected' : ''}" 
                 data-order-id="${order.id}"
                 onclick="window.orderHistoryManager.selectOrder('${order.id}')">
                <div class="vect-order-header">
                    <div class="vect-order-id">#${order.orderNumber}</div>
                    <div class="vect-order-total">$${order.total.toFixed(2)}</div>
                </div>
                <div class="vect-order-details">
                    <span class="vect-order-date">${this.formatDate(order.date)}</span>
                    <span class="vect-order-customer">${order.customer}</span>
                    <span class="vect-order-status">
                        <span class="vect-status status-${order.status}">${order.status.toUpperCase()}</span>
                    </span>
                </div>
                <div class="vect-order-items-preview">
                    ${order.items.slice(0, 3).map(item => `
                        <span class="vect-order-item-name">${item.name} (${item.quantity})</span>
                    `).join('')}
                    ${order.items.length > 3 ? `<span class="vect-order-item-name">+${order.items.length - 3} more</span>` : ''}
                </div>
            </div>
        `).join('');

        // Update order count in header
        const orderCount = document.querySelector('.vect-order-count');
        if (orderCount) {
            orderCount.textContent = `${this.filteredOrders.length} orders`;
        }
    }

    selectOrder(orderId) {
        this.selectedOrderId = orderId;
        const order = this.orders.find(o => o.id === orderId);
        
        if (!order) return;

        // Update selected state in list
        this.renderOrdersList();
        
        // Show order details
        this.renderOrderDetails(order);
    }

    renderOrderDetails(order) {
        const placeholder = document.getElementById('order-details-placeholder');
        const content = document.getElementById('order-details-content');
        
        if (!placeholder || !content) return;

        // Hide placeholder and show content
        placeholder.style.display = 'none';
        content.style.display = 'flex';

        // Update order details
        document.getElementById('order-details-title').textContent = `Order #${order.orderNumber}`;
        document.getElementById('order-details-date').textContent = this.formatDate(order.date);
        document.getElementById('order-details-customer').textContent = order.customer;
        document.getElementById('order-details-status').textContent = order.status.toUpperCase();
        document.getElementById('order-details-status').className = `vect-status status-${order.status}`;
        document.getElementById('order-details-total').textContent = `$${order.total.toFixed(2)}`;

        // Render order items
        const itemsList = document.getElementById('order-details-items');
        if (itemsList) {
            itemsList.innerHTML = order.items.map(item => `
                <div class="vect-order-item-detail">
                    <div class="vect-item-info">
                        <div class="vect-item-name">${item.name}</div>
                        <div class="vect-item-details">${item.details || ''}</div>
                    </div>
                    <div class="vect-item-pricing">
                        <div class="vect-item-quantity">Qty: ${item.quantity}</div>
                        <div class="vect-item-total">$${item.total.toFixed(2)}</div>
                    </div>
                </div>
            `).join('');
        }

        // Render order summary
        const summary = document.getElementById('order-details-summary');
        if (summary) {
            summary.innerHTML = `
                <div class="vect-summary-row">
                    <span>Subtotal:</span>
                    <span>$${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="vect-summary-row">
                    <span>Tax:</span>
                    <span>$${order.tax.toFixed(2)}</span>
                </div>
                <div class="vect-summary-row total">
                    <span>Total:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            `;
        }
    }

    clearOrderSelection() {
        this.selectedOrderId = null;
        this.renderOrdersList();
        
        const placeholder = document.getElementById('order-details-placeholder');
        const content = document.getElementById('order-details-content');
        
        if (placeholder && content) {
            placeholder.style.display = 'flex';
            content.style.display = 'none';
        }
    }

    printSelectedOrder() {
        if (!this.selectedOrderId) return;
        
        const order = this.orders.find(o => o.id === this.selectedOrderId);
        if (!order) return;

        this.generatePrintDocument(order);
    }

    generatePrintDocument(order) {
        // Update print template with order data
        document.getElementById('print-order-number').textContent = order.orderNumber;
        document.getElementById('print-order-date').textContent = this.formatDate(order.date);
        document.getElementById('print-order-customer').textContent = order.customer;
        document.getElementById('print-order-status').textContent = order.status.toUpperCase();

        // Populate items table
        const itemsBody = document.getElementById('print-items-body');
        if (itemsBody) {
            itemsBody.innerHTML = order.items.map(item => `
                <tr>
                    <td>${item.name}<br><small>${item.details || ''}</small></td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${item.total.toFixed(2)}</td>
                </tr>
            `).join('');
        }

        // Update summary
        document.getElementById('print-subtotal').textContent = `$${order.subtotal.toFixed(2)}`;
        document.getElementById('print-tax').textContent = `$${order.tax.toFixed(2)}`;
        document.getElementById('print-total').textContent = `$${order.total.toFixed(2)}`;
        document.getElementById('print-timestamp').textContent = this.formatDate(new Date().toISOString());

        // Create print window
        const printWindow = window.open('', '_blank');
        const printTemplate = document.getElementById('print-template').innerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Order #${order.orderNumber}</title>
                    <style>
                        /* Print-specific styles */
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            font-size: 14px; 
                        }
                        .print-order { 
                            max-width: 600px; 
                            margin: 0 auto; 
                        }
                        .print-header { 
                            text-align: center; 
                            margin-bottom: 2rem; 
                            border-bottom: 2px solid #333; 
                            padding-bottom: 1rem; 
                        }
                        .print-header h1 { 
                            margin: 0 0 0.5rem 0; 
                            font-size: 2rem; 
                        }
                        .print-order-info { 
                            margin-bottom: 2rem; 
                        }
                        .print-order-info h2 { 
                            margin: 0 0 1rem 0; 
                            font-size: 1.5rem; 
                        }
                        .print-items-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 1rem; 
                        }
                        .print-items-table th, .print-items-table td { 
                            border: 1px solid #ddd; 
                            padding: 0.5rem; 
                            text-align: left; 
                        }
                        .print-items-table th { 
                            background: #f5f5f5; 
                            font-weight: bold; 
                        }
                        .print-summary { 
                            text-align: right; 
                            margin-top: 1rem; 
                        }
                        .print-summary-row { 
                            display: flex; 
                            justify-content: space-between; 
                            margin-bottom: 0.5rem; 
                        }
                        .print-total { 
                            border-top: 2px solid #333; 
                            padding-top: 0.5rem; 
                            font-size: 1.2rem; 
                            font-weight: bold; 
                        }
                        .print-footer { 
                            text-align: center; 
                            margin-top: 2rem; 
                            border-top: 1px solid #ddd; 
                            padding-top: 1rem; 
                            color: #666; 
                        }
                    </style>
                </head>
                <body>
                    ${printTemplate}
                </body>
            </html>
        `);

        printWindow.document.close();
        
        // Wait a bit for content to load, then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Public method to add a new order (for integration with order creation)
    addOrder(orderData) {
        const newOrder = {
            id: `ORD-${String(this.orders.length + 1).padStart(3, '0')}`,
            orderNumber: `ORD-${String(this.orders.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString(),
            status: 'preparing',
            subtotal: orderData.subtotal || 0,
            tax: orderData.tax || 0,
            total: orderData.total || 0,
            ...orderData
        };

        this.orders.unshift(newOrder); // Add to beginning
        this.handleSearch(this.searchQuery); // Refresh filtered list
        return newOrder;
    }

    // Public method to get all orders
    getAllOrders() {
        return this.orders;
    }

    // Public method to update order status
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            this.renderOrdersList();
            if (this.selectedOrderId === orderId) {
                this.renderOrderDetails(order);
            }
        }
    }
}