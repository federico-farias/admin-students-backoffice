# Configuración del Proxy

Este proyecto está configurado para trabajar tanto con datos mock como con un backend real usando un proxy para evitar problemas de CORS.

## Configuración

### 1. Variables de Entorno

El proyecto usa las siguientes variables de entorno:

- `VITE_USE_MOCK`: Define si usar datos mock (`true`) o API real (`false`)
- `VITE_API_BASE_URL`: URL del backend (por defecto: `http://localhost:3000`)

### 2. Proxy Configuration

En `vite.config.ts` está configurado un proxy que redirige todas las peticiones que comiencen con `/api` al backend:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000', // URL de tu backend
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### 3. Uso

#### Modo Mock (Desarrollo)
```bash
# En .env
VITE_USE_MOCK=true
```

#### Modo API Real
```bash
# En .env
VITE_USE_MOCK=false
```

Luego inicia el servidor de desarrollo:
```bash
npm run dev
```

### 4. Endpoints del Backend

Cuando uses la API real, asegúrate de que tu backend tenga los siguientes endpoints:

**Estudiantes:**
- `GET /api/students` - Obtener todos los estudiantes
- `GET /api/students/:id` - Obtener estudiante por ID
- `POST /api/students` - Crear nuevo estudiante
- `PUT /api/students/:id` - Actualizar estudiante
- `DELETE /api/students/:id` - Eliminar estudiante
- `GET /api/students/search?q=query` - Buscar estudiantes

**Pagos:**
- `GET /api/payments` - Obtener todos los pagos
- `GET /api/payments/student/:studentId` - Obtener pagos por estudiante
- `POST /api/payments` - Crear nuevo pago
- `PUT /api/payments/:id` - Actualizar pago
- `DELETE /api/payments/:id` - Eliminar pago

**Grupos:**
- `GET /api/groups` - Obtener todos los grupos
- `GET /api/groups/:id` - Obtener grupo por ID
- `POST /api/groups` - Crear nuevo grupo
- `PUT /api/groups/:id` - Actualizar grupo
- `DELETE /api/groups/:id` - Eliminar grupo
- `GET /api/groups/filter?academicLevel=X&grade=Y` - Filtrar grupos
- `GET /api/groups/available?academicLevel=X&grade=Y` - Grupos disponibles
- `PATCH /api/groups/:id/student-count` - Actualizar contador de estudiantes
- `GET /api/groups/stats` - Estadísticas de grupos

**Dashboard:**
- `GET /api/dashboard/stats` - Estadísticas del dashboard

**Grados:**
- `GET /api/grades` - Obtener todos los grados

## Beneficios

1. **Sin CORS**: No necesitas configurar CORS en tu backend
2. **Desarrollo flexible**: Puedes alternar entre mock y API real fácilmente
3. **URLs limpias**: Las peticiones se hacen a `/api/*` independientemente del entorno
4. **Hot reload**: Funciona perfectamente con el hot reload de Vite
