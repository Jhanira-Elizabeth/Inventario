# NetStar Inventory Management App

Una aplicación móvil desarrollada con Ionic Angular para la gestión de inventarios de la empresa NetStar en Ambato, Ecuador.

## 📱 Descripción

La aplicación NetStar Inventory permite digitalizar y optimizar la gestión de inventario de equipos y materiales, mejorando el control, seguimiento y disponibilidad en tiempo real. Está diseñada con un sistema de roles para diferentes tipos de usuarios de la empresa.

## 🎯 Características Principales

### Gestión por Roles
- **Administrador**: Acceso completo a todas las funcionalidades
- **Encargado**: Gestión de entregas de materiales e inventario
- **Técnico**: Reporte de uso de materiales por obra

### Funcionalidades
- ✅ Autenticación segura por roles
- ✅ Dashboard personalizado según usuario
- ✅ Gestión de materiales con control de stock
- ✅ Seguimiento de obras y proyectos
- ✅ Sistema de alertas de bajo stock
- ✅ Historial de movimientos de materiales
- ✅ Interfaz adaptativa y moderna
- 🔄 Escaneo de códigos QR/barras (próximamente)
- 🔄 Reportes y estadísticas (próximamente)
- 🔄 Sincronización en tiempo real (próximamente)

## 🛠️ Tecnologías Utilizadas

- **Framework**: Ionic 7 + Angular 18
- **Lenguaje**: TypeScript
- **UI**: Ionic Components
- **Almacenamiento**: LocalStorage (temporal)
- **Cámara**: Capacitor Camera Plugin
- **Estado**: RxJS + Angular Services

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js (v18 o superior)
- npm (v8 o superior)
- Ionic CLI

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd netstar-inventory

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ionic serve

# Construir para producción
ionic build
```

### Ejecutar en dispositivo móvil
```bash
# Agregar plataforma
ionic capacitor add android
ionic capacitor add ios

# Construir y sincronizar
ionic capacitor build android
ionic capacitor build ios

# Ejecutar en dispositivo
ionic capacitor run android
ionic capacitor run ios
```

## 👥 Usuarios de Prueba

La aplicación incluye usuarios predefinidos para testing:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| encargado1 | encargado123 | Encargado |
| tecnico1 | tecnico123 | Técnico |

## 📂 Estructura del Proyecto

```
src/
├── app/
│   ├── auth/                 # Módulo de autenticación
│   ├── shared/              # Servicios y modelos compartidos
│   │   ├── models/          # Interfaces y tipos
│   │   ├── services/        # Servicios de negocio
│   │   └── guards/          # Guards de rutas
│   ├── tab1/                # Dashboard principal
│   ├── tab2/                # Gestión de inventario
│   ├── tab3/                # Gestión de obras
│   ├── users/               # Gestión de usuarios (admin)
│   ├── reports/             # Reportes (admin)
│   └── tabs/                # Sistema de navegación
├── assets/                  # Recursos estáticos
└── theme/                   # Estilos globales
```

## 🔒 Permisos por Rol

### Administrador
- ✅ Gestión completa de materiales
- ✅ Gestión de obras
- ✅ Gestión de usuarios
- ✅ Acceso a todos los reportes
- ✅ Entrega de materiales
- ✅ Visualización de inventario

### Encargado
- ✅ Entrega de materiales a técnicos
- ✅ Monitoreo de existencias
- ✅ Alertas de bajo stock
- ✅ Consulta de materiales
- ❌ Gestión de usuarios
- ❌ Reportes administrativos

### Técnico
- ✅ Reporte de uso de materiales por obra
- ✅ Consulta de disponibilidad de materiales
- ❌ Gestión de materiales
- ❌ Entregas de material
- ❌ Reportes administrativos

## 🔄 Próximas Funcionalidades

- [ ] Integración con base de datos real
- [ ] Sincronización en tiempo real
- [ ] Escaneo de códigos QR/barras
- [ ] Generación de reportes en PDF
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Geolocalización de obras
- [ ] Firma digital para entregas

## 📱 Capturas de Pantalla

_Las capturas de pantalla se agregarán próximamente_

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Empresa**: NetStar
- **Ubicación**: Ambato, Ecuador
- **Proyecto**: Sistema de Gestión de Inventario

---

Desarrollado con ❤️ para NetStar Ambato
