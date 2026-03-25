// products.js - INVENTARIO CORREGIDO (SUELTA / PAQUETE REAL)

const Products = {
    productos: [],
    categorias: ['TODOS', 'ESCOLAR', 'OFICINA', 'ARTÍSTICO', 'PAPELERÍA'],

    init() {
        this.cargarDatos();
    },

    cargarDatos() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
    },

    guardarDatos() {
        localStorage.setItem('productos', JSON.stringify(this.productos));
    },

    render(container) {
        this.cargarDatos();
        const stats = this.getStats();

        container.innerHTML = `
            <div>
                <div class="stats-header">
                    <div class="stat-block soft-blue">
                        <div class="stat-number">${this.productos.length}</div>
                        <div class="stat-label">PRODUCTOS</div>
                    </div>
                    <div class="stat-block soft-purple">
                        <div class="stat-number">${stats.stockBajo}</div>
                        <div class="stat-label">STOCK BAJO</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-number">${stats.valorTotal}</div>
                        <div class="stat-label">INVENTARIO</div>
                    </div>
                </div>

                <div class="tabs-container">
                    ${this.categorias.map(cat => `
                        <div class="tab ${cat === 'TODOS' ? 'active' : ''}" onclick="Products.filtrarCategoria('${cat}')">
                            ${cat}
                        </div>
                    `).join('')}
                    <div class="tab" style="background: var(--soft-blue);" onclick="Products.mostrarModalAgregar()">
                        + NUEVO
                    </div>
                </div>

                <div class="products-panel">
                    <div id="productosGrid" class="products-grid">
                        ${this.renderProductos(this.productos)}
                    </div>
                </div>
            </div>
        `;
    },

    renderProductos(productos) {
        if (productos.length === 0) {
            return `<div class="brutal-card">NO HAY PRODUCTOS</div>`;
        }

        return productos.map(p => `
            <div class="product-card">
                <div class="product-image">📦</div>
                <div class="product-name">${p.nombre}</div>

                <div class="product-price">
                    SUELTA: $${p.precioSuelta}<br>
                    PAQUETE: $${p.precioPaquete}
                </div>

                <div class="product-stock ${p.stock <= p.stockMinimo ? 'stock-low' : ''}">
                    STOCK: ${p.stock}
                </div>

                <div style="margin-top:10px;display:flex;gap:10px;">
                    <button class="brutal-button w-100" onclick="Products.mostrarModalEditar(${p.id})">
                        EDITAR
                    </button>
                    <button class="brutal-button w-100" style="background:red;color:white;" onclick="Products.eliminarProducto(${p.id})">
                        ELIMINAR
                    </button>
                </div>
            </div>
        `).join('');
    },

    mostrarModalAgregar() {
        Dashboard.mostrarModal('NUEVO PRODUCTO', `
            <form onsubmit="Products.guardarProducto(event)">
                
                <input type="text" name="nombre" class="brutal-input mb-20" placeholder="Nombre" required>

                <input type="number" name="precioSuelta" class="brutal-input mb-20" placeholder="Precio suelta (<=50)" required>

                <input type="number" name="precioPaquete" class="brutal-input mb-20" placeholder="Precio paquete (>100)" required>

                <input type="number" name="stock" class="brutal-input mb-20" placeholder="Stock" required>

                <input type="number" name="stockMinimo" class="brutal-input mb-20" placeholder="Stock mínimo" required>

                <button class="brutal-button w-100">GUARDAR</button>
            </form>
        `);
    },

    guardarProducto(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const precioSuelta = parseFloat(formData.get('precioSuelta'));
        const precioPaquete = parseFloat(formData.get('precioPaquete'));

        // 🔥 VALIDACIONES
        if (precioSuelta > 50) {
            App.mostrarNotificacion('❌ SUELTA NO PUEDE SER > $50', 'error');
            return;
        }

        if (precioPaquete <= 100) {
            App.mostrarNotificacion('❌ PAQUETE DEBE SER > $100', 'error');
            return;
        }

        const nuevo = {
            id: App.generarId(),
            nombre: formData.get('nombre').toUpperCase(),
            precioSuelta,
            precioPaquete,
            stock: parseInt(formData.get('stock')),
            stockMinimo: parseInt(formData.get('stockMinimo')),
            fecha: new Date().toISOString()
        };

        this.productos.push(nuevo);
        this.guardarDatos();

        App.cerrarModales();
        Dashboard.cargarVista('products');
        App.mostrarNotificacion('PRODUCTO AGREGADO');
    },

    mostrarModalEditar(id) {
        const p = this.productos.find(x => x.id === id);

        Dashboard.mostrarModal('EDITAR PRODUCTO', `
            <form onsubmit="Products.actualizarProducto(event, ${id})">

                <input type="text" name="nombre" class="brutal-input mb-20" value="${p.nombre}" required>

                <input type="number" name="precioSuelta" class="brutal-input mb-20" value="${p.precioSuelta}" required>

                <input type="number" name="precioPaquete" class="brutal-input mb-20" value="${p.precioPaquete}" required>

                <input type="number" name="stock" class="brutal-input mb-20" value="${p.stock}" required>

                <input type="number" name="stockMinimo" class="brutal-input mb-20" value="${p.stockMinimo}" required>

                <button class="brutal-button w-100">ACTUALIZAR</button>
            </form>
        `);
    },

    actualizarProducto(event, id) {
        event.preventDefault();

        const p = this.productos.find(x => x.id === id);
        const formData = new FormData(event.target);

        const precioSuelta = parseFloat(formData.get('precioSuelta'));
        const precioPaquete = parseFloat(formData.get('precioPaquete'));

        // 🔥 VALIDACIONES
        if (precioSuelta > 50) {
            App.mostrarNotificacion('❌ SUELTA NO > $50', 'error');
            return;
        }

        if (precioPaquete <= 100) {
            App.mostrarNotificacion('❌ PAQUETE > $100', 'error');
            return;
        }

        p.nombre = formData.get('nombre').toUpperCase();
        p.precioSuelta = precioSuelta;
        p.precioPaquete = precioPaquete;
        p.stock = parseInt(formData.get('stock'));
        p.stockMinimo = parseInt(formData.get('stockMinimo'));

        this.guardarDatos();

        App.cerrarModales();
        Dashboard.cargarVista('products');
        App.mostrarNotificacion('PRODUCTO ACTUALIZADO');
    },

    eliminarProducto(id) {
        if (!confirm('¿ELIMINAR PRODUCTO?')) return;

        this.productos = this.productos.filter(p => p.id !== id);
        this.guardarDatos();

        Dashboard.cargarVista('products');
        App.mostrarNotificacion('ELIMINADO');
    },

    getStats() {
        const valorTotal = this.productos.reduce(
            (sum, p) => sum + (p.precioPaquete * p.stock),
            0
        );

        const stockBajo = this.productos.filter(p => p.stock <= p.stockMinimo).length;

        return {
            valorTotal: '$' + valorTotal.toFixed(2),
            stockBajo
        };
    }
};

Products.init();
window.Products = Products;