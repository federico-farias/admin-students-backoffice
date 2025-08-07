// Re-exportar todas las APIs
export { studentsApi } from './studentsApi';
export { paymentsApi } from './paymentsApi';
export { dashboardApi } from './dashboardApi';
export { gradesApi } from './gradesApi';
export { enrollmentsApi } from './enrollmentsApi';
export { groupsApi } from './groupsApi';

// Re-exportar tipos compartidos
export type { PaginationParams, PaginatedResponse } from './apiClient';
export type { StudentFilters } from './studentsApi';

// Re-exportar cliente API para casos especiales
export { apiClient } from './apiClient';
