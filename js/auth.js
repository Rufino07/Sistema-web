// auth.js - Sistema de Autenticación (VERSIÓN FINAL NETLIFY TEST READY)

const Auth = {

    usuarios: [],
    modoTest: true, // ✅ Modo test: fuerza login cada vez que se abre el sitio

    // =========================
    // INICIALIZACIÓN
    // =========================
    init() {

        // 🔹 FORZAR LOGIN SIEMPRE: eliminar sesión automáticamente
        if (this.modoTest) {
            localStorage.removeItem('usuarioActual');
        }

        // 🔹 Reset inicial solo una vez (opcional, limpia datos antiguos)
        if (!localStorage.getItem('resetDone')) {
            localStorage.clear();
            localStorage.setItem('resetDone', 'true');
        }

        this.cargarUsuarios();
        this.verificarSesion();
    },

    // =========================
    // CARGAR USUARIOS
    // =========================
    cargarUsuarios() {
        this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        if (this.usuarios.length === 0) {
            this.inicializarUsuarios();
        }
    },

    // =========================
    // CREAR ADMINS INICIALES
    // =========================
    inicializarUsuarios() {
        const usuariosIniciales = [
            {
                id: 1,
                nombre: 'ADMIN 1',
                email: 'admin1@papeleria.com',
                password: 'Admin#2026',
                rol: 'admin',
                fechaRegistro: new Date().toISOString()
            },
            {
                id: 2,
                nombre: 'ADMIN 2',
                email: 'admin2@papeleria.com',
                password: 'Papeleria#2026',
                rol: 'admin',
                fechaRegistro: new Date().toISOString()
            }
        ];

        this.usuarios = usuariosIniciales;
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    },

    // =========================
    // VERIFICAR SESIÓN
    // =========================
    verificarSesion() {
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
        const path = window.location.pathname;

        const estaEnLogin = path.includes('login.html');
        const estaEnDashboard = path.includes('dashboard.html');

        // 🔹 Forzar login en modo test
        if (this.modoTest) {
            if (estaEnDashboard) {
                window.location.href = 'login.html';
            }
            return;
        }

        if (usuarioActual && estaEnLogin) {
            window.location.href = 'dashboard.html';
            return;
        }

        if (!usuarioActual && estaEnDashboard) {
            window.location.href = 'login.html';
            return;
        }
    },

    // =========================
    // LOGIN
    // =========================
    handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !password) {
            this.mostrarMensaje('TODOS LOS CAMPOS SON OBLIGATORIOS', 'error');
            return;
        }

        const usuario = this.usuarios.find(
            u => u.email === email && u.password === password
        );

        if (!usuario) {
            this.mostrarMensaje('ERROR: USUARIO O CONTRASEÑA INCORRECTOS', 'error');
            return;
        }

        // ✅ CREAR SESIÓN
        const sesion = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            loginTime: new Date().getTime()
        };

        localStorage.setItem('usuarioActual', JSON.stringify(sesion));

        this.mostrarMensaje(`¡BIENVENIDO ${usuario.nombre}!`, 'success');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    },

    // =========================
    // MOSTRAR MENSAJES
    // =========================
    mostrarMensaje(texto, tipo) {
        const box = document.getElementById('messageBox');
        if (!box) return;

        box.style.display = 'block';
        box.className =
            tipo === 'success'
                ? 'brutal-card soft-blue'
                : 'brutal-card soft-mauve';
        box.textContent = texto;

        setTimeout(() => {
            box.style.display = 'none';
        }, 3000);
    },

    // =========================
    // CERRAR SESIÓN
    // =========================
    cerrarSesion() {
        localStorage.removeItem('usuarioActual');
        window.location.href = 'login.html';
    }
};

// =========================
// INICIALIZAR SISTEMA
// =========================
document.addEventListener('DOMContentLoaded', () => Auth.init());
window.Auth = Auth;