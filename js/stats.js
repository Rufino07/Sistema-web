// stats.js - Estadísticas (SOLO PRODUCTOS)
const Stats = {
    productos: [],

    init() {
        this.cargarDatos();
    },

    cargarDatos() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
    },

    render(container) {
        this.cargarDatos();

        const totalProductos = this.productos.length;
        const stockBajo = this.getStockBajo();
        const valorInventario = this.getValorInventario();

        container.innerHTML = `
            <div>
                <h2 style="font-size: 2.5em; margin-bottom: 20px;">ESTADÍSTICAS</h2>

                <!-- Stats principales -->
                <div class="stats-grid">
                    <div class="chart-block">
                        <div class="chart-title">TOTAL PRODUCTOS</div>
                        <div style="font-size: 3em; font-weight: 900;">${totalProductos}</div>
                    </div>
                    <div class="chart-block">
                        <div class="chart-title">STOCK BAJO</div>
                        <div style="font-size: 3em; font-weight: 900;">${stockBajo}</div>
                    </div>
                    <div class="chart-block">
                        <div class="chart-title">VALOR INVENTARIO</div>
                        <div style="font-size: 3em; font-weight: 900;">$${valorInventario.toFixed(2)}</div>
                    </div>
                </div>

                <!-- Lista de productos -->
                <div class="brutal-card mt-20">
                    <h3 class="chart-title">LISTA DE PRODUCTOS</h3>
                    ${this.renderProductos()}
                </div>
            </div>
        `;
    },

    getStockBajo() {
        return this.productos.filter(p => p.stock <= p.stockMinimo).length;
    },

    getValorInventario() {
        return this.productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
    },

    renderProductos() {
        if (this.productos.length === 0) {
            return '<p>NO HAY PRODUCTOS REGISTRADOS</p>';
        }

        return `
            <table class="brutal-table">
                <thead>
                    <tr>
                        <th>PRODUCTO</th>
                        <th>STOCK</th>
                        <th>PRECIO</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.productos.map(p => `
                        <tr>
                            <td class="bold">${p.nombre}</td>
                            <td>${p.stock}</td>
                            <td>$${p.precio.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};

// Inicializar
Stats.init();
window.Stats = Stats;