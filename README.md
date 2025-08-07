# Sistema de Gestión Escolar - Escuela Lucía

Una aplicación web moderna para gestionar el registro de estudiantes y los pagos de desayunos escolares.

## 🚀 Características

- **Gestión de Estudiantes**: Registro, edición y eliminación de estudiantes
- **Gestión de Pagos**: Control de pagos de desayunos con múltiples métodos de pago
- **Dashboard Informativo**: Estadísticas y resumen general del sistema
- **Interfaz Moderna**: Diseño responsive con Material-UI
- **Búsqueda y Filtros**: Encuentra estudiantes y pagos fácilmente

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **Material-UI** para componentes de interfaz
- **React Router** para navegación
- **React Hook Form** para formularios
- **Day.js** para manejo de fechas
- **Axios** para llamadas HTTP

## 📋 Funcionalidades

### Dashboard
- Resumen de estudiantes activos
- Estadísticas de pagos
- Ingresos mensuales
- Pagos pendientes

### Gestión de Estudiantes
- Lista completa de estudiantes
- Información detallada de cada estudiante
- Búsqueda por nombre, grado o sección
- Estados activo/inactivo

### Gestión de Pagos
- Registro de pagos de desayunos
- Filtros por estado y método de pago
- Vista tabular con toda la información
- Seguimiento de pagos pendientes y vencidos

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 20.x o superior
- npm

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Navegar al directorio
cd student-administration

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── Layout.tsx      # Layout principal con navegación
├── pages/              # Páginas principales
│   ├── Dashboard.tsx   # Página de dashboard
│   ├── Students.tsx    # Gestión de estudiantes
│   └── Payments.tsx    # Gestión de pagos
├── services/           # Servicios y API
│   └── api.ts         # Funciones de API mock
├── types/             # Definiciones de tipos TypeScript
│   └── index.ts       # Tipos principales
├── utils/             # Utilidades
│   └── formatters.ts  # Funciones de formato
└── hooks/             # Custom React hooks
```

## 🎨 Características de la Interfaz

- **Responsive**: Adaptable a dispositivos móviles y desktop
- **Material Design**: Siguiendo las mejores prácticas de Material-UI
- **Navegación Intuitiva**: Sidebar colapsible en móviles
- **Tema Consistente**: Colores y tipografía unificados
- **Estados de Carga**: Indicadores de progreso y estados vacíos

## 📊 Próximas Funcionalidades

- [ ] Formularios de creación y edición de estudiantes
- [ ] Formularios de registro de pagos
- [ ] Reportes en PDF
- [ ] Notificaciones de pagos vencidos
- [ ] Integración con backend real
- [ ] Autenticación de usuarios
- [ ] Backup y exportación de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autor

Desarrollado para la gestión eficiente de estudiantes y pagos escolares.
