// products.js - Gestión de productos (SIN COMPRAS)
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
                        <div class="stat-label">PRODUCTOS TOTALES</div>
                    </div>
                    <div class="stat-block soft-purple">
                        <div class="stat-number">${stats.stockBajo}</div>
                        <div class="stat-label">STOCK BAJO</div>
                    </div>
                    <div class="stat-block">
                        <div class="stat-number">${stats.valorTotal}</div>
                        <div class="stat-label">VALOR INVENTARIO</div>
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

                <div class="brutal-card soft-purple" style="margin-top: 20px;">
                    <h3 style="font-size: 1.5em; margin-bottom: 15px;">STOCK CRÍTICO</h3>
                    <div id="stockBajoList">
                        ${this.renderStockBajo()}
                    </div>
                </div>
            </div>
        `;
    },

    renderProductos(productos) {
        if (productos.length === 0) {
            return `
                <div class="brutal-card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <h3>NO HAY PRODUCTOS</h3>
                    <button class="brutal-button mt-20" onclick="Products.mostrarModalAgregar()">
                        AGREGAR PRODUCTO
                    </button>
                </div>
            `;
        }

        return productos.map(p => `
            <div class="product-card">
                <div class="product-image">📦</div>
                <div class="product-name">${p.nombre}</div>
                <div class="product-price">$${p.precio.toFixed(2)}</div>

                <div class="flex gap-10" style="justify-content: space-between; align-items: center;">
                    <span class="product-stock ${p.stock <= p.stockMinimo ? 'stock-low' : ''}">
                        STOCK: ${p.stock}
                    </span>
                    <span style="font-size: 0.8em;">MIN: ${p.stockMinimo}</span>
                </div>

                <div style="margin-top: 10px; text-align: center;">
                    <span style="color: green; font-weight: bold;">EN VENTA</span>
                </div>

                <!-- BOTONES -->
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button class="brutal-button w-100" onclick="Products.mostrarModalEditar(${p.id})">
                        EDITAR
                    </button>

                    <button class="brutal-button w-100" style="background:red; color:white;" onclick="Products.eliminarProducto(${p.id})">
                        ELIMINAR
                    </button>
                </div>
            </div>
        `).join('');
    },

    eliminarProducto(productoId) {
        const confirmar = confirm("¿Eliminar este producto?");
        if (!confirmar) return;

        this.productos = this.productos.filter(p => p.id !== productoId);

        this.guardarDatos();
        Dashboard.cargarVista('products');
        App.mostrarNotificacion('PRODUCTO ELIMINADO');
    },

    renderStockBajo() {
        const stockBajo = this.productos.filter(p => p.stock <= p.stockMinimo);
        
        if (stockBajo.length === 0) {
            return '<p>TODO EN STOCK NORMAL</p>';
        }

        return stockBajo.map(p => `
            <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 2px solid var(--cream);">
                <span><strong>${p.nombre}</strong> (Stock: ${p.stock} / Mínimo: ${p.stockMinimo})</span>
            </div>
        `).join('');
    },

    filtrarCategoria(categoria) {
        this.cargarDatos();

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        if (event && event.target) {
            event.target.classList.add('active');
        }

        let productosFiltrados = this.productos;
        if (categoria !== 'TODOS') {
            productosFiltrados = this.productos.filter(p => 
                p.categoria?.toUpperCase() === categoria
            );
        }

        const grid = document.getElementById('productosGrid');
        if (grid) {
            grid.innerHTML = this.renderProductos(productosFiltrados);
        }
    },

    getStats() {
        const valorTotal = this.productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
        const stockBajo = this.productos.filter(p => p.stock <= p.stockMinimo).length;

        return {
            valorTotal: '$' + valorTotal.toFixed(2),
            stockBajo: stockBajo
        };
    },

    mostrarModalAgregar() {
        Dashboard.mostrarModal('NUEVO PRODUCTO', `
            <form onsubmit="Products.guardarProducto(event)">
                <input type="text" class="brutal-input mb-20" name="nombre" placeholder="Nombre" required>
                <input type="number" class="brutal-input mb-20" name="precio" placeholder="Precio" required>
                <input type="number" class="brutal-input mb-20" name="stock" placeholder="Stock" required>
                <input type="number" class="brutal-input mb-20" name="stockMinimo" placeholder="Stock mínimo" required>

                <button type="submit" class="brutal-button w-100">GUARDAR</button>
            </form>
        `);
    },

    guardarProducto(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const nuevoProducto = {
            id: App.generarId(),
            nombre: formData.get('nombre').toUpperCase(),
            precio: parseFloat(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            stockMinimo: parseInt(formData.get('stockMinimo')),
            fechaRegistro: new Date().toISOString()
        };

        this.productos.push(nuevoProducto);
        this.guardarDatos();

        App.cerrarModales();
        Dashboard.cargarVista('products');
        App.mostrarNotificacion('PRODUCTO AGREGADO');
    },

    mostrarModalEditar(productoId) {
        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) return;

        Dashboard.mostrarModal('EDITAR PRODUCTO', `
            <form onsubmit="Products.actualizarProducto(event, ${productoId})">
                <input type="text" class="brutal-input mb-20" name="nombre" value="${producto.nombre}" required>
                <input type="number" class="brutal-input mb-20" name="precio" value="${producto.precio}" required>
                <input type="number" class="brutal-input mb-20" name="stock" value="${producto.stock}" required>
                <input type="number" class="brutal-input mb-20" name="stockMinimo" value="${producto.stockMinimo}" required>

                <button type="submit" class="brutal-button w-100">ACTUALIZAR</button>
            </form>
        `);
    },

    actualizarProducto(event, productoId) {
        event.preventDefault();

        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) return;

        const formData = new FormData(event.target);

        producto.nombre = formData.get('nombre').toUpperCase();
        producto.precio = parseFloat(formData.get('precio'));
        producto.stock = parseInt(formData.get('stock'));
        producto.stockMinimo = parseInt(formData.get('stockMinimo'));

        this.guardarDatos();
        App.cerrarModales();
        Dashboard.cargarVista('products');
        App.mostrarNotificacion('PRODUCTO ACTUALIZADO');
    }
};

// Inicializar
Products.init();
window.Products = Products;