// suppliers.js - Gestión de proveedores
const Suppliers = {
    proveedores: [],

    init() {
        this.cargarDatos();
    },

    cargarDatos() {
        this.proveedores = JSON.parse(localStorage.getItem('proveedores')) || [];
    },

    guardarDatos() {
        localStorage.setItem('proveedores', JSON.stringify(this.proveedores));
    },

    getOptions() {
        this.cargarDatos();
        return this.proveedores.map(p => 
            `<option value="${p.id}">${p.nombre}</option>`
        ).join('');
    },

    render(container) {
        this.cargarDatos();

        container.innerHTML = `
            <div>
                <div class="flex gap-10" style="justify-content: space-between; margin-bottom: 20px;">
                    <h2 style="font-size: 2em;">PROVEEDORES</h2>
                    <button class="brutal-button soft-blue" onclick="Suppliers.mostrarModalAgregar()">
                        + NUEVO PROVEEDOR
                    </button>
                </div>

                <div class="products-panel">
                    ${this.renderProveedores()}
                </div>

                <!-- Historial de compras -->
                <div class="brutal-card mt-20">
                    <h3 style="margin-bottom: 20px;">ÚLTIMAS COMPRAS</h3>
                    ${this.renderComprasRecientes()}
                </div>
            </div>
        `;
    },

    renderProveedores() {
        if (this.proveedores.length === 0) {
            return `
                <div style="text-align: center; padding: 40px;">
                    <h3>NO HAY PROVEEDORES</h3>
                </div>
            `;
        }

        return this.proveedores.map(p => `
            <div class="supplier-card">
                <div>
                    <div class="supplier-name">${p.nombre}</div>
                    <div class="supplier-contact">${p.contacto}</div>
                    <div class="supplier-contact">TEL: ${p.telefono}</div>
                    <div class="supplier-contact">EMAIL: ${p.email}</div>
                </div>
                <div style="text-align: right;">
                    <div>DIR: ${p.direccion}</div>
                    <div class="flex gap-10" style="margin-top: 10px;">
                        <button class="brutal-button" style="padding: 5px 10px;" onclick="Suppliers.mostrarModalEditar(${p.id})">
                            EDITAR
                        </button>
                        <button class="brutal-button soft-mauve" style="padding: 5px 10px;" onclick="Suppliers.eliminarProveedor(${p.id})">
                            ELIMINAR
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderComprasRecientes() {
        const compras = JSON.parse(localStorage.getItem('compras')) || [];
        const comprasRecientes = compras.sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        ).slice(0, 10);

        if (comprasRecientes.length === 0) {
            return '<p>NO HAY COMPRAS REGISTRADAS</p>';
        }

        return `
            <table class="brutal-table">
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th>PRODUCTO</th>
                        <th>PROVEEDOR</th>
                        <th>CANTIDAD</th>
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${comprasRecientes.map(c => {
                        const proveedor = this.proveedores.find(p => p.id === c.proveedorId);
                        return `
                            <tr>
                                <td>${new Date(c.fecha).toLocaleDateString()}</td>
                                <td class="bold">${c.productoNombre}</td>
                                <td>${proveedor?.nombre || 'N/A'}</td>
                                <td>${c.cantidad}</td>
                                <td>$${c.total.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    mostrarModalAgregar() {
        Dashboard.mostrarModal('NUEVO PROVEEDOR', `
            <form onsubmit="Suppliers.guardarProveedor(event)">
                <div class="form-group mb-20">
                    <label class="bold">NOMBRE EMPRESA:</label>
                    <input type="text" class="brutal-input" name="nombre" required>
                </div>
                
                <div class="form-group mb-20">
                    <label class="bold">CONTACTO:</label>
                    <input type="text" class="brutal-input" name="contacto" required>
                </div>

                <div class="flex gap-10 mb-20">
                    <div style="flex: 1;">
                        <label class="bold">TELÉFONO:</label>
                        <input type="text" class="brutal-input" name="telefono" required>
                    </div>
                    <div style="flex: 1;">
                        <label class="bold">EMAIL:</label>
                        <input type="email" class="brutal-input" name="email" required>
                    </div>
                </div>

                <div class="form-group mb-20">
                    <label class="bold">DIRECCIÓN:</label>
                    <input type="text" class="brutal-input" name="direccion" required>
                </div>

                <div class="flex gap-10">
                    <button type="submit" class="brutal-button soft-blue w-100">GUARDAR</button>
                    <button type="button" class="brutal-button w-100" onclick="App.cerrarModales()">CANCELAR</button>
                </div>
            </form>
        `);
    },

    guardarProveedor(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        
        const nuevoProveedor = {
            id: App.generarId(),
            nombre: formData.get('nombre').toUpperCase(),
            contacto: formData.get('contacto'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion').toUpperCase()
        };

        this.proveedores.push(nuevoProveedor);
        this.guardarDatos();

        App.cerrarModales();
        Dashboard.cargarVista('suppliers');
        App.mostrarNotificacion('PROVEEDOR AGREGADO');
    },

    mostrarModalEditar(proveedorId) {
        const proveedor = this.proveedores.find(p => p.id === proveedorId);
        if (!proveedor) return;

        Dashboard.mostrarModal('EDITAR PROVEEDOR', `
            <form onsubmit="Suppliers.actualizarProveedor(event, ${proveedorId})">
                <div class="form-group mb-20">
                    <label class="bold">NOMBRE EMPRESA:</label>
                    <input type="text" class="brutal-input" name="nombre" value="${proveedor.nombre}" required>
                </div>
                
                <div class="form-group mb-20">
                    <label class="bold">CONTACTO:</label>
                    <input type="text" class="brutal-input" name="contacto" value="${proveedor.contacto}" required>
                </div>

                <div class="flex gap-10 mb-20">
                    <div style="flex: 1;">
                        <label class="bold">TELÉFONO:</label>
                        <input type="text" class="brutal-input" name="telefono" value="${proveedor.telefono}" required>
                    </div>
                    <div style="flex: 1;">
                        <label class="bold">EMAIL:</label>
                        <input type="email" class="brutal-input" name="email" value="${proveedor.email}" required>
                    </div>
                </div>

                <div class="form-group mb-20">
                    <label class="bold">DIRECCIÓN:</label>
                    <input type="text" class="brutal-input" name="direccion" value="${proveedor.direccion}" required>
                </div>

                <div class="flex gap-10">
                    <button type="submit" class="brutal-button soft-blue w-100">ACTUALIZAR</button>
                    <button type="button" class="brutal-button w-100" onclick="App.cerrarModales()">CANCELAR</button>
                </div>
            </form>
        `);
    },

    actualizarProveedor(event, proveedorId) {
        event.preventDefault();

        const proveedor = this.proveedores.find(p => p.id === proveedorId);
        if (!proveedor) return;

        const formData = new FormData(event.target);
        
        proveedor.nombre = formData.get('nombre').toUpperCase();
        proveedor.contacto = formData.get('contacto');
        proveedor.telefono = formData.get('telefono');
        proveedor.email = formData.get('email');
        proveedor.direccion = formData.get('direccion').toUpperCase();

        this.guardarDatos();
        App.cerrarModales();
        Dashboard.cargarVista('suppliers');
        App.mostrarNotificacion('PROVEEDOR ACTUALIZADO');
    },

    eliminarProveedor(proveedorId) {
        if (confirm('¿ELIMINAR PROVEEDOR?')) {
            this.proveedores = this.proveedores.filter(p => p.id !== proveedorId);
            this.guardarDatos();
            Dashboard.cargarVista('suppliers');
            App.mostrarNotificacion('PROVEEDOR ELIMINADO');
        }
    }
};

// Inicializar
Suppliers.init();
window.Suppliers = Suppliers;