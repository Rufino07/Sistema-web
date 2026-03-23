// main.js - Funciones globales (SOLO INVENTARIO)
const App = {

    init() {
        this.cargarEstadoInicial();
        this.setupGlobalListeners();
    },

    cargarEstadoInicial() {
        if (!localStorage.getItem('productos')) {
            this.inicializarProductos();
        }
    },

    inicializarProductos() {
        const productosIniciales = [
            {
                id: 1,
                nombre: 'LAPIZ HB',
                descripcion: 'Lápiz negro HB',
                categoria: 'escolar',
                precio: 2.50,
                stock: 100,
                stockMinimo: 20
            },
            {
                id: 2,
                nombre: 'CUADERNO PRO',
                descripcion: 'Cuaderno profesional 100 hojas',
                categoria: 'escolar',
                precio: 35.00,
                stock: 45,
                stockMinimo: 15
            },
            {
                id: 3,
                nombre: 'MARCADOR PERMANENTE',
                descripcion: 'Marcador permanente negro',
                categoria: 'oficina',
                precio: 12.50,
                stock: 30,
                stockMinimo: 10
            },
            {
                id: 4,
                nombre: 'HOJAS BLANCAS',
                descripcion: 'Resma de 500 hojas',
                categoria: 'oficina',
                precio: 80.00,
                stock: 12,
                stockMinimo: 8
            },
            {
                id: 5,
                nombre: 'PLUMONES 12 PZAS',
                descripcion: 'Juego de 12 plumones',
                categoria: 'artistico',
                precio: 65.00,
                stock: 8,
                stockMinimo: 5
            }
        ];

        localStorage.setItem('productos', JSON.stringify(productosIniciales));
    },

    // 🗑️ ELIMINAR PRODUCTO
    eliminarProducto(id) {
        let productos = JSON.parse(localStorage.getItem('productos')) || [];

        productos = productos.filter(p => p.id !== id);

        localStorage.setItem('productos', JSON.stringify(productos));

        this.mostrarNotificacion("Producto eliminado");

        location.reload();
    },

    setupGlobalListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
                this.cerrarModales();
            }
        });
    },

    mostrarNotificacion(mensaje, tipo = 'success') {
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? 'var(--soft-blue)' : 'var(--soft-mauve)'};
            color: var(--text-dark);
            border: 4px solid var(--text-dark);
            padding: 15px 25px;
            font-weight: 900;
            text-transform: uppercase;
            z-index: 1000;
            box-shadow: 5px 5px 0 var(--text-dark);
        `;
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => notificacion.remove(), 3000);
    },

    cerrarModales() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    },

    formatearDinero(cantidad) {
        return '$' + cantidad.toFixed(2);
    },

    generarId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;