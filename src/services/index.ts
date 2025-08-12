// Re-exportar todas las APIs desde los archivos individuales
export * from './apiClient';
export * from './studentsApi';
export * from './paymentsApi';
export * from './dashboardApi';
export * from './gradesApi';
export * from './enrollmentsApi';
export * from './groupsApi';
export * from './tutorsApi';
export * from './emergencyContactsApi';

// Re-exportar tipos compartidos
export type { PaginationParams, PaginatedResponse } from './apiClient';
export type { StudentFilters } from './studentsApi';

// Re-exportar cliente API para casos especiales
export { apiClient } from './apiClient';
