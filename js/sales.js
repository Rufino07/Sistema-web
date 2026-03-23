// sales.js - Gestión de ventas
const Sales = {
    productos: [],
    ventas: [],
    carrito: [],

    init() {
        this.cargarDatos();
    },

    cargarDatos() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    },

    guardarVentas() {
        localStorage.setItem('ventas', JSON.stringify(this.ventas));
    },

    render(container) {
        this.cargarDatos();
        const ventasHoy = this.getVentasHoy();

        container.innerHTML = `
            <div class="sales-panel">
                <!-- Panel izquierdo - Productos -->
                <div>
                    <div class="stats-header">
                        <div class="stat-block soft-blue">
                            <div class="stat-number">${ventasHoy.cantidad}</div>
                            <div class="stat-label">VENTAS HOY</div>
                        </div>
                        <div class="stat-block">
                            <div class="stat-number">$${ventasHoy.total.toFixed(2)}</div>
                            <div class="stat-label">TOTAL HOY</div>
                        </div>
                    </div>

                    <div class="products-panel">
                        <h3 style="margin-bottom: 20px;">SELECCIONAR PRODUCTOS</h3>
                        <div class="products-grid" style="max-height: 500px; overflow-y: auto;">
                            ${this.renderProductosVenta()}
                        </div>
                    </div>
                </div>

                <!-- Panel derecho - Carrito -->
                <div class="cart-panel">
                    <h3 style="margin-bottom: 20px;">CARRITO</h3>
                    
                    <div id="carritoItems" style="max-height: 400px; overflow-y: auto;">
                        ${this.renderCarrito()}
                    </div>

                    <div class="cart-total">
                        TOTAL: $${this.getTotalCarrito().toFixed(2)}
                    </div>

                    <button class="brutal-button soft-blue w-100 mt-20" onclick="Sales.finalizarVenta()" ${this.carrito.length === 0 ? 'disabled' : ''}>
                        FINALIZAR VENTA
                    </button>
                    
                    <button class="brutal-button soft-mauve w-100 mt-20" onclick="Sales.limpiarCarrito()" ${this.carrito.length === 0 ? 'disabled' : ''}>
                        LIMPIAR CARRITO
                    </button>
                </div>
            </div>
        `;
    },

    renderProductosVenta() {
        const productosConStock = this.productos.filter(p => p.stock > 0);

        if (productosConStock.length === 0) {
            return `
                <div class="brutal-card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <h3>SIN STOCK</h3>
                </div>
            `;
        }

        return productosConStock.map(p => `
            <div class="product-card" onclick="Sales.agregarAlCarrito(${p.id})">
                <div class="product-image">📦</div>
                <div class="product-name">${p.nombre}</div>
                <div class="product-price">$${p.precio.toFixed(2)}</div>
                <div class="product-stock">STOCK: ${p.stock}</div>
                <button class="brutal-button" style="margin-top: 10px; width: 100%; padding: 8px;">
                    AGREGAR
                </button>
            </div>
        `).join('');
    },

    renderCarrito() {
        if (this.carrito.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; border: 4px dashed var(--text-dark);">
                    <p>CARRITO VACÍO</p>
                </div>
            `;
        }

        return this.carrito.map((item, index) => `
            <div class="cart-item">
                <div>
                    <div class="bold">${item.nombre}</div>
                    <div>$${item.precio.toFixed(2)} x ${item.cantidad}</div>
                </div>
                <div>
                    <div class="bold">$${(item.precio * item.cantidad).toFixed(2)}</div>
                    <button class="brutal-button soft-mauve" style="padding: 3px 8px;" onclick="Sales.quitarDelCarrito(${index})">
                        X
                    </button>
                </div>
            </div>
        `).join('');
    },

    agregarAlCarrito(productoId) {
        const producto = this.productos.find(p => p.id === productoId);
        if (!producto || producto.stock <= 0) return;

        const itemExistente = this.carrito.find(item => item.id === productoId);

        if (itemExistente) {
            if (itemExistente.cantidad < producto.stock) {
                itemExistente.cantidad++;
            } else {
                App.mostrarNotificacion('STOCK MÁXIMO ALCANZADO', 'error');
                return;
            }
        } else {
            this.carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            });
        }

        this.actualizarVistaCarrito();
        App.mostrarNotificacion(`${producto.nombre} AGREGADO`);
    },

    quitarDelCarrito(index) {
        this.carrito.splice(index, 1);
        this.actualizarVistaCarrito();
    },

    limpiarCarrito() {
        if (confirm('¿LIMPIAR CARRITO?')) {
            this.carrito = [];
            this.actualizarVistaCarrito();
        }
    },

    getTotalCarrito() {
        return this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    },

    actualizarVistaCarrito() {
        const carritoItems = document.getElementById('carritoItems');
        const cartTotal = document.querySelector('.cart-total');
        
        if (carritoItems) {
            carritoItems.innerHTML = this.renderCarrito();
        }
        
        if (cartTotal) {
            cartTotal.innerHTML = `TOTAL: $${this.getTotalCarrito().toFixed(2)}`;
        }

        // Actualizar botones
        const finalizarBtn = document.querySelector('button[onclick="Sales.finalizarVenta()"]');
        const limpiarBtn = document.querySelector('button[onclick="Sales.limpiarCarrito()"]');
        
        if (finalizarBtn) finalizarBtn.disabled = this.carrito.length === 0;
        if (limpiarBtn) limpiarBtn.disabled = this.carrito.length === 0;
    },

    finalizarVenta() {
        if (this.carrito.length === 0) {
            App.mostrarNotificacion('CARRITO VACÍO', 'error');
            return;
        }

        // Verificar stock
        let stockSuficiente = true;
        for (const item of this.carrito) {
            const producto = this.productos.find(p => p.id === item.id);
            if (!producto || producto.stock < item.cantidad) {
                stockSuficiente = false;
                App.mostrarNotificacion(`STOCK INSUFICIENTE: ${item.nombre}`, 'error');
                break;
            }
        }

        if (!stockSuficiente) return;

        // Registrar venta
        const venta = {
            id: App.generarId(),
            fecha: new Date().toISOString(),
            items: [...this.carrito],
            total: this.getTotalCarrito(),
            metodo: 'EFECTIVO'
        };

        this.ventas.push(venta);

        // Actualizar stock
        for (const item of this.carrito) {
            const producto = this.productos.find(p => p.id === item.id);
            if (producto) {
                producto.stock -= item.cantidad;
            }
        }

        // Guardar
        this.guardarVentas();
        localStorage.setItem('productos', JSON.stringify(this.productos));

        // Limpiar carrito
        this.carrito = [];

        App.mostrarNotificacion(`VENTA REGISTRADA: $${venta.total.toFixed(2)}`);
        Dashboard.cargarVista('sales');
    },

    getVentasHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        const ventasHoy = this.ventas.filter(v => v.fecha.split('T')[0] === hoy);
        
        return {
            cantidad: ventasHoy.length,
            total: ventasHoy.reduce((sum, v) => sum + v.total, 0)
        };
    }
};

// Inicializar
Sales.init();
window.Sales = Sales;