import axios from 'axios';
import type { Student } from '../types';
import { apiClient, USE_MOCK, delay } from './apiClient';
import type { PaginationParams, PaginatedResponse } from './apiClient';

// Tipos para filtros de estudiantes
export interface StudentFilters {
  searchText?: string;
  grade?: string;
  section?: string;
  isActive?: boolean;
}

// Mock data para desarrollo
const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana.garcia@email.com',
    phone: '123-456-7890',
    dateOfBirth: '2015-03-15',
    grade: 'Primero',
    section: 'A',
    parentName: 'María García',
    parentPhone: '987-654-3210',
    parentEmail: 'maria.garcia@email.com',
    address: 'Calle 123, Ciudad',
    isActive: true,
    emergencyContact: {
      name: 'Pedro García',
      phone: '555-0123',
      relationship: 'Padre'
    }
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'López',
    email: '',
    phone: '',
    dateOfBirth: '2014-07-22',
    grade: 'Segundo',
    section: 'B',
    parentName: 'Carmen López',
    parentPhone: '987-654-3211',
    parentEmail: 'carmen.lopez@email.com',
    address: 'Avenida 456, Ciudad',
    isActive: true
  }
];

// Students API
export const studentsApi = {
  async getAll(): Promise<Student[]> {
    if (USE_MOCK) {
      await delay(500);
      return [...mockStudents];
    }
    
    const response = await apiClient.get<Student[]>('/students');
    return response.data;
  },

  async getById(id: string): Promise<Student | undefined> {
    if (USE_MOCK) {
      await delay(300);
      return mockStudents.find(s => s.id === id);
    }
    
    try {
      const response = await apiClient.get<Student>(`/students/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  },

  async create(student: Omit<Student, 'id'>): Promise<Student> {
    if (USE_MOCK) {
      await delay(500);
      const newStudent: Student = {
        ...student,
        id: (mockStudents.length + 1).toString()
      };
      mockStudents.push(newStudent);
      return newStudent;
    }
    
    const response = await apiClient.post<Student>('/students', student);
    return response.data;
  },

  async update(id: string, student: Partial<Student>): Promise<Student> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockStudents.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Estudiante no encontrado');
      
      mockStudents[index] = { ...mockStudents[index], ...student };
      return mockStudents[index];
    }
    
    const response = await apiClient.put<Student>(`/students/${id}`, student);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockStudents.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Estudiante no encontrado');
      
      mockStudents.splice(index, 1);
      return;
    }
    
    await apiClient.delete(`/students/${id}`);
  },

  async search(query: string): Promise<Student[]> {
    if (USE_MOCK) {
      await delay(300);
      return mockStudents.filter(s => 
        s.firstName.toLowerCase().includes(query.toLowerCase()) ||
        s.lastName.toLowerCase().includes(query.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    const response = await apiClient.get<Student[]>(`/students/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async searchPaginated(
    filters: StudentFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Student>> {
    if (USE_MOCK) {
      await delay(500);
      
      // Aplicar filtros
      let filteredStudents = [...mockStudents];
      
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredStudents = filteredStudents.filter(s => 
          s.firstName.toLowerCase().includes(searchLower) ||
          s.lastName.toLowerCase().includes(searchLower) ||
          (s.email && s.email.toLowerCase().includes(searchLower)) ||
          (s.parentName && s.parentName.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.grade) {
        filteredStudents = filteredStudents.filter(s => s.grade === filters.grade);
      }
      
      if (filters.section) {
        filteredStudents = filteredStudents.filter(s => s.section === filters.section);
      }
      
      if (filters.isActive !== undefined) {
        filteredStudents = filteredStudents.filter(s => s.isActive === filters.isActive);
      }
      
      // Aplicar ordenamiento
      if (pagination.sortBy) {
        filteredStudents.sort((a, b) => {
          const aValue = (a as any)[pagination.sortBy!];
          const bValue = (b as any)[pagination.sortBy!];
          
          if (aValue < bValue) return pagination.sortDir === 'desc' ? 1 : -1;
          if (aValue > bValue) return pagination.sortDir === 'desc' ? -1 : 1;
          return 0;
        });
      }
      
      // Si se solicita sin paginación
      if (pagination.unpaginated) {
        return {
          content: filteredStudents,
          totalElements: filteredStudents.length,
          totalPages: 1,
          number: 0,
          size: filteredStudents.length,
          first: true,
          last: true
        };
      }
      
      // Aplicar paginación
      const page = pagination.page || 0;
      const size = pagination.size || 10;
      const start = page * size;
      const end = start + size;
      const paginatedContent = filteredStudents.slice(start, end);
      
      return {
        content: paginatedContent,
        totalElements: filteredStudents.length,
        totalPages: Math.ceil(filteredStudents.length / size),
        number: page,
        size: size,
        first: page === 0,
        last: end >= filteredStudents.length
      };
    }
    
    // Construir parámetros de query para el backend
    const params = new URLSearchParams();
    
    // Para el backend, usamos diferentes estrategias según los filtros disponibles
    if (filters.searchText && !filters.grade && !filters.section && filters.isActive === undefined) {
      // Usar el endpoint /search para búsqueda simple (compatible con el backend actual)
      if (filters.searchText) params.append('search', filters.searchText); // El backend espera 'search', no 'searchText'
      if (pagination.page !== undefined) params.append('page', pagination.page.toString());
      if (pagination.size !== undefined) params.append('size', pagination.size.toString());
      
      const response = await apiClient.get<PaginatedResponse<Student>>(`/students/search?${params.toString()}`);
      return response.data;
    } else {
      // Para filtros complejos, usar el endpoint principal y hacer filtrado en frontend
      // hasta que el backend implemente un endpoint unificado como el de grupos
      const activeOnly = filters.isActive !== false;
      const getAllResponse = await apiClient.get<Student[]>(`/students?activeOnly=${activeOnly}`);
      let filteredStudents = getAllResponse.data;
      
      // Aplicar filtros en el frontend
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredStudents = filteredStudents.filter(s => 
          s.firstName.toLowerCase().includes(searchLower) ||
          s.lastName.toLowerCase().includes(searchLower) ||
          (s.email && s.email.toLowerCase().includes(searchLower)) ||
          (s.parentName && s.parentName.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.grade) {
        filteredStudents = filteredStudents.filter(s => s.grade === filters.grade);
      }
      
      if (filters.section) {
        filteredStudents = filteredStudents.filter(s => s.section === filters.section);
      }
      
      // Aplicar ordenamiento
      if (pagination.sortBy) {
        filteredStudents.sort((a, b) => {
          const aValue = (a as any)[pagination.sortBy!];
          const bValue = (b as any)[pagination.sortBy!];
          
          if (aValue < bValue) return pagination.sortDir === 'desc' ? 1 : -1;
          if (aValue > bValue) return pagination.sortDir === 'desc' ? -1 : 1;
          return 0;
        });
      }
      
      // Si se solicita sin paginación
      if (pagination.unpaginated) {
        return {
          content: filteredStudents,
          totalElements: filteredStudents.length,
          totalPages: 1,
          number: 0,
          size: filteredStudents.length,
          first: true,
          last: true
        };
      }
      
      // Aplicar paginación
      const page = pagination.page || 0;
      const size = pagination.size || 10;
      const start = page * size;
      const end = start + size;
      const paginatedContent = filteredStudents.slice(start, end);
      
      return {
        content: paginatedContent,
        totalElements: filteredStudents.length,
        totalPages: Math.ceil(filteredStudents.length / size),
        number: page,
        size: size,
        first: page === 0,
        last: end >= filteredStudents.length
      };
    }
  }
};
