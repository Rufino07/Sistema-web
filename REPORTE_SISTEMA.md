# REPORTE TÉCNICO DEL SISTEMA DE GESTIÓN

**Proyecto:** Sistema Web de Gestión para Papelería  
**Fecha de Análisis:** 15 de Abril de 2026  
**Versión del Sistema:** 1.0.0

---

## 1. RESUMEN EJECUTIVO

El Sistema de Gestión para Papelería es una aplicación web desarrollada con tecnología Node.js/Express que permite la administración de inventario, registro de ventas y gestión de proveedores. Utiliza una arquitectura SPA (Single Page Application) con persistencia mediante localStorage del navegador.

**Características principales:**
- Landing page con diseño brutalist
- Sistema de autenticación con sesión
- Gestión completa de inventario (CRUD)
- Sistema de ventas con carrito de compras
- Gestión de proveedores
- Dashboard con estadísticas en tiempo real

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Runtime | Node.js | LTS |
| Servidor HTTP | Express.js | 5.2.1 |
| Frontend | Vanilla JavaScript | ES6+ |
| Estilos | CSS3 (Brutalist) | - |
| Persistencia | localStorage | - |

### 2.2 Estructura de Archivos

```
Sistema-web/
├── index.html          # Landing page principal
├── index.js          # Servidor Express
├── package.json      # Dependencias
├── css/
│   ├── admin.css
│   └── brutalist.css
├── js/
│   ├── auth.js        # Autenticación
│   ├── dashboard.js   # Orquestador
│   ├── main.js       # Utilidades
│   ├── products.js    # Inventario
│   ├── sales.js     # Ventas
│   ├── suppliers.js  # Proveedores
│   └── stats.js     # Estadísticas
└── pages/
    ├── login.html
    └── dashboard.html
```

### 2.3 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                  NAVEGADOR CLIENTE                │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │
│  │ Landing │  │ Login  │  │ Dashboard SPA   │  │
│  │  Page  │  │ Page   │  │ (múltiples    │  │
│  │        │  │        │  │   vistas)     │  │
│  └─────────┘  └─────────┘  └─────────────────┘  │
│         │         │              │               │
│         └─────────┴──────────────┘               │
│                      │                        │
│              ┌─────▼─────┐                 │
│              │  local   │                 │
│              │Storage  │                 │
│              └─────────┘                 │
└─────────────────────────────────────────────────┘
                    │
              ┌─────▼─────┐
              │ Express   │
              │  Server  │
              │port:3000 │
              └─────────┘
```

---

## 3. FUNCIONALIDADES DEL SISTEMA

### 3.1 Módulo de Autenticación (`auth.js`)

**Descripción:**
Gestiona el inicio de sesión, cierre de sesión y protección de rutas.

**Usuarios por defecto:**

| ID | Email | Contraseña | Rol |
|----|-------|----------|------|
| 1 | admin1@papeleria.com | Admin#2026 | admin |
| 2 | admin2@papeleria.com | Papeleria#2026 | admin |

**Características técnicas:**
- Sesión almacenada en localStorage como JSON
- Expiración de sesión: 1 hora (3,600,000 ms)
- Redirección automática si no hay sesión activa
- Modo test configurable para pruebas

**Métodos principales:**
- `init()` - Inicializa el sistema
- `handleLogin(event)` - Procesa credenciales
- `verificarSesion()` - Valida sesión activa
- `cerrarSesion()` - Cierra la sesión actual

### 3.2 Módulo de Productos (`products.js`)

**Descripción:**
Gestión completa del inventario con validaciones de negocio.

**Categorías disponibles:**
- TODOS
- ESCOLAR
- OFICINA
- ARTÍSTICO
- PAPELERÍA

**Entidad Producto:**
```javascript
{
  id: Number,
  nombre: String,
  precioSuelta: Number (≤ $50),
  precioPaquete: Number (> $100),
  stock: Number,
  stockMinimo: Number,
  fecha: Date
}
```

**Reglas de validación:**
1. Precio SUELTA no puede exceder $50.00
2. Precio PAQUETE debe ser mayor a $100.00

**Funcionalidades CRUD:**
- Agregar producto
- Editar producto
- Eliminar producto
- Filtrar por categoría

**Métricas展示:**
- Total de productos
- Productos con stock bajo
- Valor total del inventario

### 3.3 Módulo de Ventas (`sales.js`)

**Descripción:**
Sistema de punto de venta con carrito de compras.

**Tipos de venta:**
- SUELTA (unidad individual)
- PAQUETE (bundle con descuento)

**Flujo de venta:**
```
1. Seleccionar producto del catálogo
2. Modal: elegir tipo (suelta/paquete)
3. Definir cantidad
4. Agregar al carrito
5. Repetir o finalizar
6. Confirmar venta
   └─> Registra venta
   └─> Descuenta stock automáticamente
```

**Entidad Venta:**
```javascript
{
  id: Number,
  fecha: Date,
  items: Array [
    {
      id: Number,
      nombre: String,
      tipo: String,
      precio: Number,
      cantidad: Number
    }
  ],
  total: Number
}
```

**Métricas展示:**
- Ventas realizadas hoy
- Total facturado hoy

### 3.4 Módulo de Proveedores (`suppliers.js`)

**Descripción:**
Administración de contactos de proveedores.

**Entidad Proveedor:**
```javascript
{
  id: Number,
  nombre: String,
  contacto: String,
  telefono: String,
  email: String,
  direccion: String
}
```

**Funcionalidades:**
- CRUD completo de proveedores
- Historial de compras recientes
- Registro de compras a proveedores

### 3.5 Módulo de Estadísticas (`stats.js`)

**Descripción:**
Panel de métricas y visualización de datos.

**Indicadores展示:**
- Total de productos registrados
- Productos con stock bajo
- Valor total del inventario
- Lista completa de productos

---

## 4. FLUJO DE USO

### 4.1 Diagrama de Flujo

```
                              ┌──────────────────┐
                              │   Landing Page   │
                              │  localhost:3000 │
                              └───────┬────────┘
                                      │
                            click "ACCEDER AL PANEL"
                                      │
                                      ▼
                              ┌──────────────────┐
                              │   Login Page   │
                              │  pages/login  │
                              └───────┬────────┘
                                      │
                         ┌────Ingresa credenciales────┐
                         │                         │
                         │   Email + Password      │
                         │                         │
                         └───────────┬─────────────┘
                                     │
                    ┌────────┐      │      ┌────────┐
                    │ Validar│───────┴─────►│Error  │
                    │creden- │               │mens-  │
                    │ciales │               │sage   │
                    └────┬──┘               └──────┘
                         │
                   ┌─────▼─────┐
                   │  Sesión   │
                   │  Creada   │
                   └─────┬─────┘
                         │
                         ▼
                  ┌────────────┐
                  │Dashboard  │
                  │  main    │
                  └────┬────┘
                       │
         ┌─────────────┼─────────────┐
         │           │           │        │
         ▼           ▼           ▼        ▼
    ┌─────────┐ ┌───────┐ ┌────────┐ ┌──────┐
    │PRODUCTOS│ │VENTAS │ │PROVEE-│ │STATS │
    │        │ │       │ │DORES  │ │      │
    └─────────┘ └───────┘ └────────┘ └──────┘
```

### 4.2 Pasos de Operación

| Paso | Acción | Descripción |
|------|-------|-----------|
| 1 | Acceso | Abrir http://localhost:3000 |
| 2 | Login | Click en "ACCEDER AL PANEL" |
| 3 | Autenticar | Ingresar credenciales |
| 4 | Dashboard | Navegar por módulos |
| 5 | Gestionar | Realizar operaciones |
| 6 | Cerrar | Cerrar sesión |

---

## 5. REQUISITOS FUNCIONALES

| ID | Requisito | Prioridad | Estado |
|----|----------|----------|--------|
| RF1 | Landing page con acceso al sistema | Alta | ✅ Completo |
| RF2 | Login con validación de credenciales | Alta | ✅ Completo |
| RF3 | Protección de rutas (solo usuarios autentificados) | Alta | ✅ Completo |
| RF4 | Cerrar sesión | Alta | ✅ Completo |
| RF5 | Agregar productos al inventario | Alta | ✅ Completo |
| RF6 | Editar productos | Alta | ✅ Completo |
| RF7 | Eliminar productos | Alta | ✅ Completo |
| RF8 | Filtrar productos por categoría | Media | ✅ Completo |
| RF9 | Registro de ventas | Alta | ✅ Completo |
| RF10 | Carrito de compras | Alta | ✅ Completo |
| RF11 | Descuento automático de stock | Alta | ✅ Completo |
| RF12 | Agregar proveedores | Alta | ✅ Completo |
| RF13 | Editar proveedores | Alta | ✅ Completo |
| RF14 | Eliminar proveedores | Alta | ✅ Completo |
| RF15 | Dashboard con métricas | Alta | ✅ Completo |
| RF16 | Persistencia de datos | Alta | ✅ Completo |

---

## 6. REQUISITOS NO FUNCIONALES

### 6.1 Rendimiento

| Métrica | Requisito | Observación |
|--------|----------|------------|
| Tiempo de carga | < 2 segundos | Carga rápida sin librerías |
| Tamaño total JS | ~50 KB | Código optimizado |
| Uso de memoria | Moderado | localStorage como respaldo |

### 6.2 Usabilidad

| Aspecto | Estado |
|--------|-------|
| Interfaz visualmente distinguish | ✅ Estilo Brutalist |
| Navegación intuitiva | ✅ Sidebar con tabs |
| Feedback de operaciones | ✅ Notificaciones |
| Diseño responsivo | ⚠️ Básico |

### 6.3 Seguridad

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Sesión con timeout | ✅ | 1 hora de expiración |
| Contraseñas en localStorage | ⚠️ | Texto plano (sin hash) |
| HTTPS | ❌ | No implementado |

### 6.4 Compatibilidad

| Navegador | Estado |
|----------|--------|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Edge 90+ | ✅ |
| Safari 14+ | ✅ |

**Requerimientos:**
- localStorage habilitado
- JavaScript habilitado

### 6.5 Mantenibilidad

| Aspecto | Estado |
|---------|-------|
| Código modular | ✅ Por功能 |
| Sin dependencias externas (frontend) | ✅ Vanilla JS |
| Estilos separados | ✅ CSS dedicado |
| Estructura clara | ✅ Nombres descriptivos |

---

## 7. LIMITACIONES CONOCIDAS

### 7.1 Técnicas

| Limitación | Impacto | Solución sugerida |
|-----------|--------|------------------|
| Persistencia local | No multi-dispositivo | Backend con BD |
| Contraseñas texto plano | Seguridad baja | Hash + salt |
| Sin backup | Riesgo de pérdida | Export/import JSON |
| localStorage lleno | Fin de capacidad | Limpieza manual |

### 7.2 Funcionales

| Limitación | Impacto |
|-----------|--------|
| Sin roles múltiples | Solo admin |
| Sin reportes PDF | Solo visualización |
| Sin export de datos | Solo visualización |
| Sin multi-usuario | Sesión única |

---

## 8. PRUEBAS REALIZADAS

### 8.1 Pruebas Funcionales

| Prueba | Resultado |
|--------|---------|
| Login con credenciales válidas | ✅ Redirecciona a dashboard |
| Login con credenciales inválidas | ✅ Muestra error |
| Agregar producto | ✅ Persiste en localStorage |
| Editar producto | ✅ Actualiza datos |
| Eliminar producto | ✅ Remove del inventario |
| Registrar venta | ✅ Descuenta stock |
| Cerrar sesión | ✅ Limpia sesión |

### 8.2 Pruebas de Rendimiento

| Métrica | Valor |
|---------|------|
| Tiempo de respuesta | < 100ms |
| Tiempo de carga | ~1s |

---

## 9. DATOS DE PRUEBA

### Credenciales de acceso:

```
Usuario 1: admin1@papeleria.com / Admin#2026
Usuario 2: admin2@papeleria.com / Papeleria#2026
```

---

## 10. CONCLUSIONES

**Fortalezas:**
- Interfaz de usuario distintiva y funcional
- Código modular y mantenible
- Zero-config deployment
- Sistema completo de gestión

**Áreas de mejora:**
- Backend con base de datos
- Autenticación robusta
- Sistema de roles
- Reportes y exports
- API REST

**Recomendación:**
El sistema es funcional para uso educativo o como prototipo. Para producción se recomienda implementar un backend con base de datos y medidas de seguridad adicionales.

---

*Documento generado el 15 de Abril de 2026*