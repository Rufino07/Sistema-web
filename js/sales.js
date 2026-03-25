// sales.js - SISTEMA DE VENTAS FINAL CON MODAL

const Sales = {
    productos: [],
    ventas: [],
    carrito: [],
    tipoSeleccionado: null,

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

                    <div style="margin:10px 0; text-align:center;">
                        <button class="brutal-button" onclick="Sales.resetearVentas()">
                            REINICIAR VENTAS
                        </button>
                    </div>

                    <div class="products-panel">
                        <h3 style="margin-bottom: 20px;">SELECCIONAR PRODUCTOS</h3>
                        <div class="products-grid" style="max-height: 500px; overflow-y: auto;">
                            ${this.renderProductosVenta()}
                        </div>
                    </div>
                </div>

                <div class="cart-panel">
                    <h3 style="margin-bottom: 20px;">CARRITO</h3>

                    <div id="carritoItems" style="max-height: 400px; overflow-y: auto;">
                        ${this.renderCarrito()}
                    </div>

                    <div class="cart-total">
                        TOTAL: $${this.getTotalCarrito().toFixed(2)}
                    </div>

                    <button class="brutal-button soft-blue w-100 mt-20"
                        onclick="Sales.finalizarVenta()"
                        ${this.carrito.length === 0 ? 'disabled' : ''}>
                        FINALIZAR VENTA
                    </button>

                    <button class="brutal-button soft-mauve w-100 mt-20"
                        onclick="Sales.limpiarCarrito()"
                        ${this.carrito.length === 0 ? 'disabled' : ''}>
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
            <div class="product-card">
                <div class="product-image">📦</div>
                <div class="product-name">${p.nombre}</div>

                <div class="product-price">SUELTA: $${p.precioSuelta || 0}</div>
                <div class="product-price">PAQUETE: $${p.precioPaquete || 0}</div>

                <div class="product-stock">STOCK: ${p.stock}</div>

                <button class="brutal-button"
                    style="margin-top: 10px; width: 100%;"
                    onclick="Sales.mostrarModalVenta(${p.id})">
                    AGREGAR
                </button>
            </div>
        `).join('');
    },

    mostrarModalVenta(productoId) {
        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) return;

        this.tipoSeleccionado = null;

        const modal = document.createElement('div');
        modal.id = "modalVenta";

        modal.innerHTML = `
            <div style="position: fixed;top:0; left:0;width:100%; height:100%;background: rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
                <div style="background:white;padding:20px;border-radius:10px;width:300px;text-align:center;">
                    <h3>${producto.nombre}</h3>

                    <p>Selecciona tipo:</p>

                    <button id="btnSuelta" class="brutal-button"
                        onclick="Sales.seleccionarTipoModal('suelta')">
                        SUELTA ($${producto.precioSuelta})
                    </button>

                    <button id="btnPaquete" class="brutal-button"
                        onclick="Sales.seleccionarTipoModal('paquete')">
                        PAQUETE ($${producto.precioPaquete})
                    </button>

                    <p style="margin-top:10px;">Cantidad:</p>
                    <input id="cantidadVenta" type="number" min="1" value="1" style="width:100%; padding:5px;">

                    <button class="brutal-button" style="margin-top:10px;"
                        onclick="Sales.confirmarAgregar(${productoId})">
                        AGREGAR
                    </button>

                    <button class="brutal-button soft-mauve" style="margin-top:5px;"
                        onclick="Sales.cerrarModal()">
                        CANCELAR
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    seleccionarTipoModal(tipo) {
        this.tipoSeleccionado = tipo;
        document.getElementById('btnSuelta').style.background = tipo === 'suelta' ? 'green' : '';
        document.getElementById('btnPaquete').style.background = tipo === 'paquete' ? 'green' : '';
    },

    confirmarAgregar(productoId) {
        const producto = this.productos.find(p => p.id === productoId);
        const tipo = this.tipoSeleccionado;
        const cantidad = parseInt(document.getElementById('cantidadVenta').value);

        if (!tipo) return App.mostrarNotificacion('SELECCIONA TIPO', 'error');
        if (!cantidad || cantidad <= 0) return App.mostrarNotificacion('CANTIDAD INVÁLIDA', 'error');
        if (cantidad > producto.stock) return App.mostrarNotificacion('STOCK INSUFICIENTE', 'error');

        const precio = tipo === 'suelta' ? producto.precioSuelta : producto.precioPaquete;

        this.carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            tipo,
            precio,
            cantidad
        });

        this.cerrarModal();
        this.actualizarVistaCarrito();
        App.mostrarNotificacion(`${producto.nombre} agregado`);
    },

    cerrarModal() {
        const modal = document.getElementById('modalVenta');
        if (modal) modal.remove();
    },

    renderCarrito() {
        if (this.carrito.length === 0) {
            return `<div style="text-align:center;padding:40px;">CARRITO VACÍO</div>`;
        }

        return this.carrito.map((item, index) => `
            <div class="cart-item">
                <div>
                    <div class="bold">${item.nombre} (${item.tipo})</div>
                    <div>${item.cantidad} x $${item.precio}</div>
                </div>
                <div>
                    <div class="bold">$${(item.precio * item.cantidad).toFixed(2)}</div>
                    <button class="brutal-button soft-mauve"
                        onclick="Sales.quitarDelCarrito(${index})">X</button>
                </div>
            </div>
        `).join('');
    },

    quitarDelCarrito(index) {
        this.carrito.splice(index, 1);
        this.actualizarVistaCarrito();
    },

    limpiarCarrito() {
        if (!confirm('¿LIMPIAR CARRITO?')) return;
        this.carrito = [];
        this.actualizarVistaCarrito();
    },

    getTotalCarrito() {
        return this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    },

    // 🔥 AQUÍ ESTÁ LA CORRECCIÓN
    actualizarVistaCarrito() {
        const carritoItems = document.getElementById('carritoItems');
        const cartTotal = document.querySelector('.cart-total');

        if (carritoItems) carritoItems.innerHTML = this.renderCarrito();
        if (cartTotal) cartTotal.innerHTML = `TOTAL: $${this.getTotalCarrito().toFixed(2)}`;

        // 🔥 ACTIVAR/DESACTIVAR BOTONES
        const btnFinalizar = document.querySelector('button[onclick="Sales.finalizarVenta()"]');
        const btnLimpiar = document.querySelector('button[onclick="Sales.limpiarCarrito()"]');

        if (btnFinalizar) btnFinalizar.disabled = this.carrito.length === 0;
        if (btnLimpiar) btnLimpiar.disabled = this.carrito.length === 0;
    },

    finalizarVenta() {
        if (this.carrito.length === 0) return App.mostrarNotificacion('CARRITO VACÍO', 'error');

        const venta = {
            id: App.generarId(),
            fecha: new Date().toISOString(),
            items: [...this.carrito],
            total: this.getTotalCarrito()
        };

        this.ventas.push(venta);

        this.carrito.forEach(item => {
            const producto = this.productos.find(p => p.id === item.id);
            if (producto) producto.stock -= item.cantidad;
        });

        this.guardarVentas();
        localStorage.setItem('productos', JSON.stringify(this.productos));

        this.carrito = [];

        App.mostrarNotificacion(`VENTA REGISTRADA`);
        Dashboard.cargarVista('sales');
    },

    getVentasHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        const ventasHoy = this.ventas.filter(v => v.fecha.split('T')[0] === hoy);

        return {
            cantidad: ventasHoy.length,
            total: ventasHoy.reduce((sum, v) => sum + v.total, 0)
        };
    },

    resetearVentas() {
        if (!confirm("¿Seguro que deseas borrar ventas?")) return;

        localStorage.removeItem('ventas');
        Dashboard.cargarVista('sales');
        App.mostrarNotificacion('VENTAS REINICIADAS');
    }
};

Sales.init();
window.Sales = Sales;