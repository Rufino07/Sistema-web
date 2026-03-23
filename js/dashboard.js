// dashboard.js - Orquestador principal (CORREGIDO)

const Dashboard = {

    vistaActual: 'products',
    usuario: null,

    init() {
        if (!this.verificarSesion()) return;
        this.renderSidebar();
        this.setupEventListeners();
        this.cargarVista('products');
    },

    // =========================
    // VERIFICAR SESIÓN
    // =========================
    verificarSesion() {

        const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

        if (!usuario) {
            window.location.href = 'login.html';
            return false;
        }

        const now = new Date().getTime();
        const oneHour = 60 * 60 * 1000;

        if (!usuario.loginTime || (now - usuario.loginTime > oneHour)) {
            localStorage.removeItem('usuarioActual');
            window.location.href = 'login.html';
            return false;
        }

        this.usuario = usuario;
        return true;
    },

    // =========================
    // RENDER SIDEBAR (AQUÍ SE AGREGA admin-name)
    // =========================
    renderSidebar() {

        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        sidebar.innerHTML = `
            <div class="logo-area">
                <div class="logo-text">SISTEMA DE<br>GESTIÓN</div>

                <!-- 👇 AQUÍ SE AGREGA -->
                <div class="admin-name" 
                     style="background: var(--soft-purple); 
                            color: var(--text-dark); 
                            padding: 8px; 
                            margin-top: 10px; 
                            font-weight: 900; 
                            text-align: center;">
                    ${this.usuario.nombre}
                </div>
            </div>
            
            <div class="nav-item ${this.vistaActual === 'products' ? 'active' : ''}" 
                 onclick="Dashboard.cargarVista('products')">
                PRODUCTOS
            </div>

            <div class="nav-item ${this.vistaActual === 'sales' ? 'active' : ''}" 
                 onclick="Dashboard.cargarVista('sales')">
                VENTAS
            </div>

            <div class="nav-item ${this.vistaActual === 'suppliers' ? 'active' : ''}" 
                 onclick="Dashboard.cargarVista('suppliers')">
                PROVEEDORES
            </div>

            <div class="nav-item ${this.vistaActual === 'stats' ? 'active' : ''}" 
                 onclick="Dashboard.cargarVista('stats')">
                ESTADÍSTICAS
            </div>
            
            <div style="margin-top: auto; padding-top: 30px;">
                <div class="nav-item" 
                     onclick="Auth.cerrarSesion()" 
                     style="background: var(--soft-mauve); color: var(--text-dark);">
                    CERRAR SESIÓN
                </div>
            </div>
        `;
    },

    // =========================
    // EVENTOS GENERALES
    // =========================
    setupEventListeners() {

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                if (typeof App !== 'undefined') {
                    App.cerrarModales();
                }
            }
        });

    },

    // =========================
    // CARGAR VISTAS
    // =========================
    cargarVista(vista) {

        this.vistaActual = vista;
        this.renderSidebar();

        const container = document.getElementById('contenidoPrincipal');
        if (!container) return;

        switch (vista) {

            case 'products':
                if (typeof Products !== 'undefined') {
                    Products.render(container);
                }
                break;

            case 'sales':
                if (typeof Sales !== 'undefined') {
                    Sales.render(container);
                }
                break;

            case 'suppliers':
                if (typeof Suppliers !== 'undefined') {
                    Suppliers.render(container);
                }
                break;

            case 'stats':
                if (typeof Stats !== 'undefined') {
                    Stats.render(container);
                }
                break;
        }
    },

    // =========================
    // MODAL GLOBAL
    // =========================
    mostrarModal(titulo, contenido) {

        const modal = document.getElementById('modalPrincipal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal-content brutal-card" 
                 style="border-color: var(--soft-purple);">
                 
                <h2 style="background: var(--text-dark); 
                           color: var(--cream); 
                           padding: 15px; 
                           margin: -20px -20px 20px -20px; 
                           border-bottom: 4px solid var(--soft-purple);">
                    ${titulo}
                </h2>

                ${contenido}
            </div>
        `;

        modal.classList.add('active');
    }
};


// =========================
// INICIALIZAR
// =========================
document.addEventListener('DOMContentLoaded', () => Dashboard.init());
window.Dashboard = Dashboard;