// sales.js - SISTEMA DE VENTAS CON TICKET

const Sales = {
    productos: [],
    ventas: [],
    carrito: [],
    tipoSeleccionado: null,
    filtroPeriodo: 'hoy',

    configTienda: {
        nombre: 'PAPELERÍA EXPRESS',
        direccion: 'Av. Principal #123, Col. Centro',
        telefono: '(55) 1234-5678',
        rfc: 'PEA-123456789',
        tieneLectorTarjeta: false,
        numeroCuenta: '',
        banco: ''
    },

    getConfigTienda() {
        return JSON.parse(localStorage.getItem('configTienda')) || this.configTienda;
    },

    guardarConfigTienda(config) {
        localStorage.setItem('configTienda', JSON.stringify(config));
    },

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

    getFolio() {
        const ultimoFolio = this.ventas.length > 0 
            ? Math.max(...this.ventas.map(v => v.folio)) 
            : 0;
        return ultimoFolio + 1;
    },

    getVendedor() {
        const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
        return usuario ? usuario.nombre : 'VENDEDOR';
    },

    render(container) {
        this.cargarDatos();
        const ventasHoy = this.getVentasHoy();
        const ventasSemana = this.getVentasSemana();
        const ventasMes = this.getVentasMes();

        container.innerHTML = `
            <div class="sales-panel">

                <div>
                    <div class="stats-header">
                        <div class="stat-block soft-blue">
                            <div class="stat-number" id="statPeriodoNum">${ventasHoy.cantidad}</div>
                            <div class="stat-label" id="statPeriodoLabel">VENTAS HOY</div>
                        </div>
                        <div class="stat-block">
                            <div class="stat-number">$${ventasHoy.total.toFixed(2)}</div>
                            <div class="stat-label">TOTAL HOY</div>
                        </div>
                    </div>

                    <div style="margin:15px 0; display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
                        <button class="brutal-button soft-blue" onclick="Sales.renderModalDetalleVentas('hoy'); this.blur();" 
                            style="${this.filtroPeriodo === 'hoy' ? 'background:#2563eb;' : ''}">
                            HOY
                        </button>
                        <button class="brutal-button" onclick="Sales.renderModalDetalleVentas('semana'); this.blur();"
                            style="${this.filtroPeriodo === 'semana' ? 'background:#2563eb;' : ''}">
                            SEMANA
                        </button>
                        <button class="brutal-button" onclick="Sales.renderModalDetalleVentas('mes'); this.blur();"
                            style="${this.filtroPeriodo === 'mes' ? 'background:#2563eb;' : ''}">
                            MES
                        </button>
                    </div>

                    <div style="text-align:center;margin:10px 0;">
                        <div style="font-size:12px;color:#666;">VENTAS SEMANA: ${ventasSemana.cantidad} ($ ${ventasSemana.total.toFixed(2)})</div>
                        <div style="font-size:12px;color:#666;">VENTAS MES: ${ventasMes.cantidad} ($ ${ventasMes.total.toFixed(2)})</div>
                    </div>

                    <div style="margin:15px 0; text-align:center;">
                        <button class="brutal-button soft-mauve" onclick="Sales.renderModalHistorial();">
                            VER TICKETS ANTERIORES
                        </button>
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

                    <div id="carritoItems" style="max-height: 300px; overflow-y: auto;">
                        ${this.renderCarrito()}
                    </div>

                    <div id="cartTotales" style="text-align:left; padding:15px; background:#f5f5f5; border-radius:5px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span>Subtotal:</span>
                            <span>$${this.getTotalCarrito().toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span>IVA (16%):</span>
                            <span>$${(this.getTotalCarrito() * 0.16).toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;padding-top:5px;border-top:1px solid #ddd;">
                            <span>TOTAL:</span>
                            <span>$${(this.getTotalCarrito() * 1.16).toFixed(2)}</span>
                        </div>
                    </div>

                    <button class="brutal-button soft-blue w-100 mt-20"
                        onclick="Sales.mostrarModalPago()"
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

    mostrarModalPago() {
        const config = this.getConfigTienda();
        const total = this.getTotalCarrito();
        const totalConIVA = total * 1.16;
        
        const modal = document.createElement('div');
        modal.id = "modalPago";

        const optionsMetodo = [];
        if (config.tieneLectorTarjeta) {
            optionsMetodo.push('<option value="TARJETA">TARJETA</option>');
        }
        if (config.numeroCuenta && config.banco) {
            optionsMetodo.push('<option value="TRANSFERENCIA">TRANSFERENCIA</option>');
        }
        optionsMetodo.push('<option value="EFECTIVO">EFECTIVO</option>');

        modal.innerHTML = `
            <div style="position: fixed;top:0; left:0;width:100%; height:100%;background: rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
                <div style="background:white;padding:20px;border-radius:10px;width:350px;text-align:center;max-height:90vh;overflow-y:auto;">
                    <h3>DATOS DE PAGO</h3>
                    
                    <div style="text-align:left;margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:5px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px;">
                            <span>Subtotal:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px;">
                            <span>IVA (16%):</span>
                            <span>$${(total * 0.16).toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;padding-top:5px;border-top:1px solid #ddd;">
                            <span>Total a pagar:</span>
                            <span>$${totalConIVA.toFixed(2)}</span>
                        </div>
                    </div>

                    <p style="text-align:left;">Método de pago:</p>
                    <select id="metodoPago" class="brutal-input mb-20" style="width:100%;" onchange="Sales.actualizarMontoRecibido()">
                        ${optionsMetodo.join('')}
                    </select>

                    <div id="divMontoRecibido">
                        <p style="text-align:left;">Monto recibido:</p>
                        <input type="number" id="montoRecibido" class="brutal-input mb-20" 
                            style="width:100%;" value="${Math.ceil(totalConIVA)}" 
                            oninput="Sales.actualizarCambio()" step="0.01">
                        
                        <p style="text-align:left;">Cambio: <strong id="displayCambio">$0.00</strong></p>
                    </div>

                    <div id="infoTarjeta" style="display:none;text-align:left;margin-bottom:15px;padding:10px;background:#e3f2fd;border-radius:5px;font-size:12px;">
                        <strong>LECTOR DE TARJETA:</strong> Conectado<br>
                        Presente la tarjeta del cliente en el lector
                    </div>

                    <div id="infoTransferencia" style="display:none;text-align:left;margin-bottom:15px;padding:10px;background:#e8f5e9;border-radius:5px;font-size:12px;">
                        <strong>DATOS PARA TRANSFERENCIA:</strong><br>
                        Banco: ${config.banco}<br>
                        Cuenta: ${config.numeroCuenta}<br>
                        <em>El cliente debe realizar la transferencia</em>
                    </div>

                    <button class="brutal-button soft-blue w-100" style="margin-top:10px;"
                        onclick="Sales.confirmarPago()">
                        COBRAR E IMPRIMIR TICKET
                    </button>

                    <button class="brutal-button soft-mauve w-100" style="margin-top:5px;"
                        onclick="Sales.cerrarModalPago()">
                        CANCELAR
                    </button>

                    <button class="brutal-button w-100" style="margin-top:15px;font-size:10px;padding:5px;"
                        onclick="Sales.mostrarModalConfigPago(); Sales.cerrarModalPago();">
                        CONFIGURAR MÉTODOS DE PAGO
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.actualizarMontoRecibido();
    },

    actualizarMontoRecibido() {
        const metodo = document.getElementById('metodoPago')?.value;
        const divMonto = document.getElementById('divMontoRecibido');
        const infoTarjeta = document.getElementById('infoTarjeta');
        const infoTransferencia = document.getElementById('infoTransferencia');
        
        if (!metodo) return;
        
        const total = this.getTotalCarrito() * 1.16;
        
        if (metodo === 'EFECTIVO') {
            if (divMonto) divMonto.style.display = 'block';
            if (infoTarjeta) infoTarjeta.style.display = 'none';
            if (infoTransferencia) infoTransferencia.style.display = 'none';
        } else if (metodo === 'TARJETA') {
            if (divMonto) divMonto.style.display = 'none';
            if (infoTarjeta) infoTarjeta.style.display = 'block';
            if (infoTransferencia) infoTransferencia.style.display = 'none';
            document.getElementById('montoRecibido').value = total;
        } else if (metodo === 'TRANSFERENCIA') {
            if (divMonto) divMonto.style.display = 'none';
            if (infoTarjeta) infoTarjeta.style.display = 'none';
            if (infoTransferencia) infoTransferencia.style.display = 'block';
            document.getElementById('montoRecibido').value = total;
        }
    },

    actualizarCambio() {
        const total = this.getTotalCarrito() * 1.16;
        const recibido = parseFloat(document.getElementById('montoRecibido').value) || 0;
        const cambio = Math.max(0, recibido - total);
        document.getElementById('displayCambio').textContent = '$' + cambio.toFixed(2);
    },

    cerrarModalPago() {
        const modal = document.getElementById('modalPago');
        if (modal) modal.remove();
    },

    confirmarPago() {
        const metodoPago = document.getElementById('metodoPago').value;
        let montoRecibido = parseFloat(document.getElementById('montoRecibido').value) || 0;
        const total = this.getTotalCarrito();
        const cambio = Math.max(0, montoRecibido - total);

        if (metodoPago === 'EFECTIVO' && montoRecibido < total) {
            App.mostrarNotificacion('MONTO INSUFICIENTE', 'error');
            return;
        }

        const folio = this.getFolio();
        const venta = {
            folio,
            id: App.generarId(),
            fecha: new Date().toISOString(),
            items: [...this.carrito],
            subtotal: total,
            impuesto: total * 0.16,
            total: total * 1.16,
            metodoPago,
            montoRecibido: metodoPago === 'EFECTIVO' ? montoRecibido : total,
            cambio: metodoPago === 'EFECTIVO' ? cambio : 0,
            vendedor: this.getVendedor(),
            tienda: this.configTienda
        };

        this.ventas.push(venta);

        this.carrito.forEach(item => {
            const producto = this.productos.find(p => p.id === item.id);
            if (producto) producto.stock -= item.cantidad;
        });

        this.guardarVentas();
        localStorage.setItem('productos', JSON.stringify(this.productos));

        this.carrito = [];
        this.cerrarModalPago();

        this.mostrarTicket(venta);
    },

    mostrarTicket(venta) {
        const fecha = new Date(venta.fecha);
        const fechaStr = fecha.toLocaleDateString('es-MX');
        const horaStr = fecha.toLocaleTimeString('es-MX');

        const ticketHTML = `
            <div style="position: fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;">
                <div style="background:white;padding:20px;border-radius:5px;width:320px;font-family:'Courier New',monospace;font-size:12px;max-height:90vh;overflow-y:auto;">
                    <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:10px;margin-bottom:10px;">
                        <strong>${venta.tienda.nombre}</strong><br>
                        ${venta.tienda.direccion}<br>
                        Tel: ${venta.tienda.telefono}<br>
                        RFC: ${venta.tienda.rfc}
                    </div>
                    
                    <div style="border-bottom:1px dashed #000;padding-bottom:10px;margin-bottom:10px;">
                        <div>Folio: <strong>#${venta.folio}</strong></div>
                        <div>Fecha: ${fechaStr}</div>
                        <div>Hora: ${horaStr}</div>
                        <div>Vendedor: ${venta.vendedor}</div>
                    </div>

                    <div style="border-bottom:1px dashed #000;padding-bottom:10px;margin-bottom:10px;">
                        ${venta.items.map(item => `
                            <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                                <span>${item.nombre} (${item.tipo.toUpperCase()})</span>
                                <span>${item.cantidad} x $${item.precio.toFixed(2)}</span>
                            </div>
                            <div style="text-align:right;margin-bottom:5px;">
                                $${(item.cantidad * item.precio).toFixed(2)}
                            </div>
                        `).join('')}
                    </div>

                    <div style="border-bottom:1px dashed #000;padding-bottom:10px;margin-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;">
                            <span>Subtotal:</span>
                            <span>$${venta.subtotal.toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span>IVA (16%):</span>
                            <span>$${venta.impuesto.toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;">
                            <span>TOTAL:</span>
                            <span>$${venta.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style="border-bottom:1px dashed #000;padding-bottom:10px;margin-bottom:10px;">
                        <div>Método: ${venta.metodoPago}</div>
                        ${venta.metodoPago === 'EFECTIVO' ? `
                            <div>Recibido: $${venta.montoRecibido.toFixed(2)}</div>
                            <div>Cambio: $${venta.cambio.toFixed(2)}</div>
                        ` : ''}
                        ${venta.metodoPago === 'TRANSFERENCIA' ? `
                            <div>Banco: ${venta.tienda.banco}</div>
                            <div>Cuenta: ${venta.tienda.numeroCuenta}</div>
                        ` : ''}
                    </div>

                    <div style="text-align:center;">
                        <p>¡GRACIAS POR SU COMPRA!</p>
                        <p>Vuelva pronto</p>
                    </div>

                    <button class="brutal-button soft-blue w-100" style="margin-top:15px;"
                        onclick="this.parentElement.parentElement.remove(); Dashboard.cargarVista('sales');">
                        CERRAR
                    </button>
                    
                    <button class="brutal-button w-100" style="margin-top:5px;"
                        onclick="window.print();">
                        IMPRIMIR
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', ticketHTML);
        App.mostrarNotificacion(`VENTA #${venta.folio} REGISTRADA`);
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

    actualizarVistaCarrito() {
        const carritoItems = document.getElementById('carritoItems');
        const cartTotales = document.getElementById('cartTotales');

        if (carritoItems) carritoItems.innerHTML = this.renderCarrito();
        
        const subtotal = this.getTotalCarrito();
        const iva = subtotal * 0.16;
        const total = subtotal * 1.16;
        
        if (cartTotales) {
            cartTotales.innerHTML = `
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                    <span>IVA (16%):</span>
                    <span>$${iva.toFixed(2)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;padding-top:5px;border-top:1px solid #ddd;">
                    <span>TOTAL:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            `;
        }

        const btnFinalizar = document.querySelector('button[onclick="Sales.mostrarModalPago()"]');
        const btnLimpiar = document.querySelector('button[onclick="Sales.limpiarCarrito()"]');

        if (btnFinalizar) btnFinalizar.disabled = this.carrito.length === 0;
        if (btnLimpiar) btnLimpiar.disabled = this.carrito.length === 0;
    },

    getVentasHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        const ventasHoy = this.ventas.filter(v => v.fecha.split('T')[0] === hoy);

        return {
            cantidad: ventasHoy.length,
            total: ventasHoy.reduce((sum, v) => sum + (v.subtotal || v.total), 0)
        };
    },

    getVentasSemana() {
        const ahora = new Date();
        const haceUnaSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        const ventasSemana = this.ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta >= haceUnaSemana;
        });

        return {
            cantidad: ventasSemana.length,
            total: ventasSemana.reduce((sum, v) => sum + (v.subtotal || v.total), 0)
        };
    },

    getVentasMes() {
        const ahora = new Date();
        const haceUnMes = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
        const ventasMes = this.ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta >= haceUnMes;
        });

        return {
            cantidad: ventasMes.length,
            total: ventasMes.reduce((sum, v) => sum + (v.subtotal || v.total), 0)
        };
    },

    getVentasPorPeriodo() {
        switch (this.filtroPeriodo) {
            case 'hoy':
                return this.getVentasHoy();
            case 'semana':
                return this.getVentasSemana();
            case 'mes':
                return this.getVentasMes();
            default:
                return this.getVentasHoy();
        }
    },

    setFiltroPeriodo(periodo) {
        this.filtroPeriodo = periodo;
        this.renderModalDetalleVentas(periodo);
    },

    renderModalDetalleVentas(periodo) {
        this.cargarDatos();
        let ventasFiltradas = [];
        let tituloPeriodo = '';
        
        const hoy = new Date();
        
        if (periodo === 'hoy') {
            const fechaHoy = hoy.toISOString().split('T')[0];
            ventasFiltradas = this.ventas.filter(v => v.fecha.split('T')[0] === fechaHoy);
            tituloPeriodo = 'Ventas de Hoy';
        } else if (periodo === 'semana') {
            const haceUnaSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
            const numSemana = Math.ceil(hoy.getDate() / 7);
            tituloPeriodo = `Semana ${numSemana} de ${hoy.toLocaleDateString('es-MX', { month: 'long' })}`;
            ventasFiltradas = this.ventas.filter(v => new Date(v.fecha) >= haceUnaSemana);
        } else if (periodo === 'mes') {
            const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            tituloPeriodo = `Ventas de ${mesesNombres[hoy.getMonth()]}`;
            const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
            ventasFiltradas = this.ventas.filter(v => new Date(v.fecha) >= haceUnMes);
        }

        ventasFiltradas = [...ventasFiltradas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const modal = document.createElement('div');
        modal.id = "modalDetalleVentas";

        let listaHTML = '';
        if (ventasFiltradas.length === 0) {
            listaHTML = `<div style="text-align:center;padding:40px;">No hay ventas en este período</div>`;
        } else {
            listaHTML = ventasFiltradas.map(v => {
                const fecha = new Date(v.fecha);
                const fechaStr = fecha.toLocaleDateString('es-MX');
                const horaStr = fecha.toLocaleTimeString('es-MX');
                return `
                    <div class="cart-item" style="margin-bottom:10px;padding:10px;border:1px solid #ddd;">
                        <div>
                            <div class="bold">Folio #${v.folio}</div>
                            <div style="font-size:11px;">${fechaStr} - ${horaStr}</div>
                            <div style="font-size:11px;">${v.items.length} producto(s) - ${v.metodoPago}</div>
                        </div>
                        <div style="text-align:right;">
                            <div class="bold">$${v.subtotal.toFixed(2)}</div>
                            <button class="brutal-button soft-blue" style="margin-top:5px;font-size:11px;padding:5px 8px;"
                                onclick="Sales.mostrarTicketPorFolio(${v.folio}); document.getElementById('modalDetalleVentas').remove();">
                                TICKET
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const total = ventasFiltradas.reduce((sum, v) => sum + v.subtotal, 0);
        const totalIVA = total * 0.16;
        const granTotal = total * 1.16;

        modal.innerHTML = `
            <div style="position: fixed;top:0; left:0;width:100%; height:100%;background: rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
                <div style="background:white;padding:20px;border-radius:10px;width:500px;max-height:85vh;overflow-y:auto;">
                    <h3>${tituloPeriodo}</h3>
                    <div style="text-align:center;margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:5px;">
                        <div style="font-size:12px;">Ventas: <strong>${ventasFiltradas.length}</strong></div>
                        <div style="font-size:14px;">Subtotal: <strong>$${total.toFixed(2)}</strong></div>
                        <div style="font-size:12px;">IVA: <strong>$${totalIVA.toFixed(2)}</strong></div>
                        <div style="font-size:16px;font-weight:bold;">Total: <strong>$${granTotal.toFixed(2)}</strong></div>
                    </div>
                    <div style="max-height:350px;overflow-y:auto;">
                        ${listaHTML}
                    </div>
                    <button class="brutal-button soft-mauve w-100" style="margin-top:15px;"
                        onclick="document.getElementById('modalDetalleVentas').remove()">
                        CERRAR
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    mostrarModalConfigPago() {
        let config = this.getConfigTienda();
        
        const modal = document.createElement('div');
        modal.id = "modalConfigPago";

        modal.innerHTML = `
            <div style="position: fixed;top:0; left:0;width:100%; height:100%;background: rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
                <div style="background:white;padding:20px;border-radius:10px;width:350px;text-align:center;">
                    <h3>CONFIGURAR MÉTODOS DE PAGO</h3>
                    
                    <div style="text-align:left;margin-bottom:15px;padding:10px;background:#fff3cd;border-radius:5px;font-size:12px;">
                        <strong>Atención:</strong> Para usar tarjeta o transferencia necesitas 配置 del lector de tarjeta y/o datos de cuenta bancaria.
                    </div>

                    <div style="text-align:left;margin-bottom:10px;">
                        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                            <input type="checkbox" id="chkLector" ${config.tieneLectorTarjeta ? 'checked' : ''} 
                                onchange="Sales.toggleConfigLector()">
                           Tengo lector de tarjeta
                        </label>
                    </div>

                    <div id="divLectorInfo" style="display:${config.tieneLectorTarjeta ? 'block' : 'none'};text-align:left;margin-bottom:15px;padding:10px;background:#e3f2fd;border-radius:5px;font-size:12px;">
                        <strong>Lector de tarjeta:</strong> Conectado y listo para usar
                    </div>

                    <hr style="margin:15px 0;">

                    <div style="text-align:left;margin-bottom:10px;">
                        <label>Banco para transferencias:</label>
                        <input type="text" id="txtBanco" class="brutal-input" style="width:100%;" 
                            value="${config.banco || ''}" placeholder="Ej. BBVA, Santander, Banorte">
                    </div>

                    <div style="text-align:left;margin-bottom:15px;">
                        <label>Número de cuenta:</label>
                        <input type="text" id="txtCuenta" class="brutal-input" style="width:100%;" 
                            value="${config.numeroCuenta || ''}" placeholder="Número de cuenta CLABE">
                    </div>

                    <div id="divCuentaInfo" style="display:${config.numeroCuenta && config.banco ? 'block' : 'none'};text-align:left;margin-bottom:15px;padding:10px;background:#e8f5e9;border-radius:5px;font-size:12px;">
                        <strong>Transferencia:</strong> Configurada - ${config.banco}
                    </div>

                    <button class="brutal-button soft-blue w-100" style="margin-top:10px;"
                        onclick="Sales.guardarConfigPago()">
                        GUARDAR CONFIGURACIÓN
                    </button>

                    <button class="brutal-button soft-mauve w-100" style="margin-top:5px;"
                        onclick="document.getElementById('modalConfigPago').remove()">
                        CANCELAR
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    toggleConfigLector() {
        const tieneLector = document.getElementById('chkLector').checked;
        const divLectorInfo = document.getElementById('divLectorInfo');
        if (divLectorInfo) {
            divLectorInfo.style.display = tieneLector ? 'block' : 'none';
        }
    },

    guardarConfigPago() {
        const tieneLector = document.getElementById('chkLector').checked;
        const banco = document.getElementById('txtBanco').value.trim();
        const numeroCuenta = document.getElementById('txtCuenta').value.trim();

        const configAnterior = this.getConfigTienda();
        const config = {
            ...configAnterior,
            tieneLectorTarjeta: tieneLector,
            banco: banco,
            numeroCuenta: numeroCuenta
        };

        this.guardarConfigTienda(config);
        document.getElementById('modalConfigPago').remove();
        App.mostrarNotificacion('Configuración guardada');
    },

    actualizarStats() {
        const stats = this.getVentasPorPeriodo();
        const statNumber = document.getElementById('statPeriodoNum');
        const statLabel = document.getElementById('statPeriodoLabel');
        
        if (statNumber && statLabel) {
            const labels = { hoy: 'HOY', semana: 'ESTA SEMANA', mes: 'ESTE MES' };
            statNumber.textContent = stats.cantidad;
            statLabel.textContent = labels[this.filtroPeriodo];
            statNumber.nextElementSibling.textContent = '$' + stats.total.toFixed(2);
            statNumber.nextElementSibling.nextElementSibling.textContent = 'TOTAL: ' + labels[this.filtroPeriodo];
        }
    },

    renderHistorialTickets() {
        if (this.ventas.length === 0) {
            return `<div style="text-align:center;padding:40px;">SIN VENTAS REGISTRADAS</div>`;
        }

        const ventasOrdenadas = [...this.ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return ventasOrdenadas.map(v => {
            const fecha = new Date(v.fecha);
            const fechaStr = fecha.toLocaleDateString('es-MX');
            const horaStr = fecha.toLocaleTimeString('es-MX');
            
            return `
                <div class="cart-item" style="margin-bottom:10px;padding:15px;">
                    <div>
                        <div class="bold">Folio #${v.folio}</div>
                        <div>${fechaStr} - ${horaStr}</div>
                        <div>${v.items.length} producto(s)</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="bold">$${v.subtotal.toFixed(2)}</div>
                        <button class="brutal-button soft-blue" style="margin-top:5px;"
                            onclick="Sales.mostrarTicket(${v.folio})">
                            VER TICKET
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    mostrarTicketPorFolio(folio) {
        const venta = this.ventas.find(v => v.folio === folio);
        if (venta) {
            this.mostrarTicket(venta);
        }
    },

    renderModalHistorial() {
        const modal = document.createElement('div');
        modal.id = "modalHistorial";

        const ventasOrdenadas = [...this.ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        modal.innerHTML = `
            <div style="position: fixed;top:0; left:0;width:100%; height:100%;background: rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
                <div style="background:white;padding:20px;border-radius:10px;width:500px;max-height:80vh;overflow-y:auto;">
                    <h3>HISTORIAL DE TICKETS</h3>
                    <div style="max-height:400px;overflow-y:auto;">
                        ${ventasOrdenadas.map(v => {
                            const fecha = new Date(v.fecha);
                            const fechaStr = fecha.toLocaleDateString('es-MX');
                            const horaStr = fecha.toLocaleTimeString('es-MX');
                            return `
                                <div class="cart-item" style="margin-bottom:10px;padding:10px;border:1px solid #ddd;">
                                    <div>
                                        <div class="bold">Folio #${v.folio}</div>
                                        <div>${fechaStr} - ${horaStr}</div>
                                        <div>${v.items.length} producto(s)</div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div class="bold">$${v.subtotal.toFixed(2)}</div>
                                        <button class="brutal-button soft-blue" style="margin-top:5px;font-size:12px;padding:5px 10px;"
                                            onclick="Sales.mostrarTicketPorFolio(${v.folio}); document.getElementById('modalHistorial').remove();">
                                            VER TICKET
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button class="brutal-button soft-mauve w-100" style="margin-top:15px;"
                        onclick="document.getElementById('modalHistorial').remove()">
                        CERRAR
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
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