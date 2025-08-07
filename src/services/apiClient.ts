import axios from 'axios';

// Configuración del cliente HTTP
export const apiClient = axios.create({
  baseURL: '/api', // Usa el proxy configurado en vite.config.ts
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para alternar entre mock y API real
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false; // Cambia a false para usar API real

// Simular delay de red
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Tipos para filtros y paginación
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  unpaginated?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
