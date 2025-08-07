import axios from 'axios';
import type { Enrollment, EnrollmentFilters, EnrollmentStatus } from '../types';
import { apiClient, USE_MOCK, delay } from './apiClient';
import type { PaginationParams, PaginatedResponse } from './apiClient';

// Mock data para desarrollo
const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    publicId: 'enr-001',
    studentPublicId: '1',
    studentFullName: 'Ana García',
    groupId: 1,
    groupFullName: 'Primero A',
    enrollmentDate: '2024-02-01',
    academicYear: '2024-2025',
    enrollmentFee: 250.00,
    status: 'CONFIRMADA',
    notes: 'Inscripción completa con documentos',
    isActive: true
  },
  {
    id: '2',
    publicId: 'enr-002',
    studentPublicId: '2',
    studentFullName: 'Carlos López',
    groupId: 2,
    groupFullName: 'Segundo B',
    enrollmentDate: '2024-02-01',
    academicYear: '2024-2025',
    enrollmentFee: 250.00,
    status: 'PENDIENTE',
    notes: 'Falta documentación médica',
    isActive: true
  }
];

// Enrollments API
export const enrollmentsApi = {
  async getAll(): Promise<Enrollment[]> {
    if (USE_MOCK) {
      await delay(500);
      return [...mockEnrollments];
    }
    
    const response = await apiClient.get<Enrollment[]>('/enrollments');
    return response.data;
  },

  async searchPaginated(
    filters: EnrollmentFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Enrollment>> {
    if (USE_MOCK) {
      await delay(500);
      
      // Aplicar filtros
      let filteredEnrollments = [...mockEnrollments];
      
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredEnrollments = filteredEnrollments.filter(e => 
          (e.studentFullName && e.studentFullName.toLowerCase().includes(searchLower)) ||
          (e.groupFullName && e.groupFullName.toLowerCase().includes(searchLower)) ||
          e.academicYear.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.status) {
        filteredEnrollments = filteredEnrollments.filter(e => e.status === filters.status);
      }
      
      if (filters.academicYear) {
        filteredEnrollments = filteredEnrollments.filter(e => e.academicYear === filters.academicYear);
      }
      
      if (filters.groupId !== undefined) {
        filteredEnrollments = filteredEnrollments.filter(e => e.groupId === filters.groupId);
      }
      
      if (filters.isActive !== undefined) {
        filteredEnrollments = filteredEnrollments.filter(e => e.isActive === filters.isActive);
      }
      
      // Aplicar ordenamiento
      if (pagination.sortBy) {
        filteredEnrollments.sort((a, b) => {
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
          content: filteredEnrollments,
          totalElements: filteredEnrollments.length,
          totalPages: 1,
          number: 0,
          size: filteredEnrollments.length,
          first: true,
          last: true
        };
      }
      
      // Aplicar paginación
      const page = pagination.page || 0;
      const size = pagination.size || 10;
      const start = page * size;
      const end = start + size;
      const paginatedContent = filteredEnrollments.slice(start, end);
      
      return {
        content: paginatedContent,
        totalElements: filteredEnrollments.length,
        totalPages: Math.ceil(filteredEnrollments.length / size),
        number: page,
        size: size,
        first: page === 0,
        last: end >= filteredEnrollments.length
      };
    }
    
    // Construir parámetros de query para el backend
    const params = new URLSearchParams();
    
    // Filtros
    if (filters.status) params.append('status', filters.status);
    if (filters.academicYear) params.append('academicYear', filters.academicYear);
    if (filters.groupId !== undefined) params.append('groupId', filters.groupId.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.searchText) params.append('searchText', filters.searchText);
    
    // Paginación
    if (pagination.page !== undefined) params.append('page', pagination.page.toString());
    if (pagination.size !== undefined) params.append('size', pagination.size.toString());
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortDir) params.append('sortDir', pagination.sortDir);
    
    const response = await apiClient.get<PaginatedResponse<Enrollment>>(`/enrollments?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Enrollment | undefined> {
    if (USE_MOCK) {
      await delay(300);
      return mockEnrollments.find(e => e.publicId === id);
    }
    
    try {
      const response = await apiClient.get<Enrollment>(`/enrollments/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  },

  async getByStudentId(studentPublicId: string): Promise<Enrollment[]> {
    if (USE_MOCK) {
      await delay(300);
      return mockEnrollments.filter(e => e.studentPublicId === studentPublicId);
    }
    
    const response = await apiClient.get<Enrollment[]>(`/enrollments/student/${studentPublicId}`);
    return response.data;
  },

  async getByGroupId(groupId: number): Promise<Enrollment[]> {
    if (USE_MOCK) {
      await delay(300);
      return mockEnrollments.filter(e => e.groupId === groupId);
    }
    
    const response = await apiClient.get<Enrollment[]>(`/enrollments/group/${groupId}`);
    return response.data;
  },

  async create(enrollment: Omit<Enrollment, 'id' | 'publicId'>): Promise<Enrollment> {
    if (USE_MOCK) {
      await delay(500);
      const newEnrollment: Enrollment = {
        ...enrollment,
        id: (mockEnrollments.length + 1).toString(),
        publicId: `enr-${(mockEnrollments.length + 1).toString().padStart(3, '0')}`
      };
      mockEnrollments.push(newEnrollment);
      return newEnrollment;
    }
    
    const response = await apiClient.post<Enrollment>('/enrollments', enrollment);
    return response.data;
  },

  async update(id: string, enrollment: Partial<Enrollment>): Promise<Enrollment> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockEnrollments.findIndex(e => e.publicId === id);
      if (index === -1) throw new Error('Inscripción no encontrada');
      
      mockEnrollments[index] = { ...mockEnrollments[index], ...enrollment };
      return mockEnrollments[index];
    }
    
    const response = await apiClient.put<Enrollment>(`/enrollments/${id}`, enrollment);
    return response.data;
  },

  async confirm(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const enrollment = mockEnrollments.find(e => e.publicId === id);
      if (enrollment && enrollment.status === 'PENDIENTE') {
        enrollment.status = 'CONFIRMADA';
      }
      return;
    }
    
    await apiClient.patch(`/enrollments/${id}/confirm`);
  },

  async complete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const enrollment = mockEnrollments.find(e => e.publicId === id);
      if (enrollment && enrollment.status === 'CONFIRMADA') {
        enrollment.status = 'COMPLETADA';
      }
      return;
    }
    
    await apiClient.patch(`/enrollments/${id}/complete`);
  },

  async cancel(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const enrollment = mockEnrollments.find(e => e.publicId === id);
      if (enrollment) {
        enrollment.status = 'CANCELADA';
        enrollment.isActive = false;
      }
      return;
    }
    
    await apiClient.patch(`/enrollments/${id}/cancel`);
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockEnrollments.findIndex(e => e.publicId === id);
      if (index === -1) throw new Error('Inscripción no encontrada');
      
      mockEnrollments.splice(index, 1);
      return;
    }
    
    await apiClient.delete(`/enrollments/${id}`);
  },

  async getCountByStatus(status: EnrollmentStatus): Promise<number> {
    if (USE_MOCK) {
      await delay(300);
      return mockEnrollments.filter(e => e.status === status).length;
    }
    
    const response = await apiClient.get<number>(`/enrollments/stats/count-by-status?status=${status}`);
    return response.data;
  },

  async getCountByAcademicYear(academicYear: string): Promise<number> {
    if (USE_MOCK) {
      await delay(300);
      return mockEnrollments.filter(e => e.academicYear === academicYear).length;
    }
    
    const response = await apiClient.get<number>(`/enrollments/stats/count-by-year?academicYear=${academicYear}`);
    return response.data;
  }
};
