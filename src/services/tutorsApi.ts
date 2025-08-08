import { apiClient, delay, USE_MOCK } from './apiClient';
import type { Tutor } from '../types';
import type { PaginationParams, PaginatedResponse } from './apiClient';

// Mock data para tutores
const mockTutors: Tutor[] = [
  {
    id: '1',
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@email.com',
    phone: '987-654-3210',
    address: 'Calle 123, Ciudad',
    relationship: 'Madre',
    documentNumber: '12345678',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Carmen',
    lastName: 'López',
    email: 'carmen.lopez@email.com',
    phone: '987-654-3211',
    address: 'Avenida 456, Ciudad',
    relationship: 'Madre',
    documentNumber: '87654321',
    isActive: true,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z'
  },
  {
    id: '3',
    firstName: 'Pedro',
    lastName: 'García',
    email: 'pedro.garcia@email.com',
    phone: '555-0123',
    address: 'Calle 123, Ciudad',
    relationship: 'Padre',
    documentNumber: '11223344',
    isActive: true,
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z'
  }
];

export interface TutorFilters {
  searchText?: string;
  relationship?: string;
  isActive?: boolean;
}

export const tutorsApi = {
  async getAll(): Promise<Tutor[]> {
    if (USE_MOCK) {
      await delay(300);
      return [...mockTutors];
    }
    
    const response = await apiClient.get<Tutor[]>('/tutors');
    return response.data;
  },

  async getById(id: string): Promise<Tutor | undefined> {
    if (USE_MOCK) {
      await delay(200);
      return mockTutors.find(t => t.id === id);
    }
    
    try {
      const response = await apiClient.get<Tutor>(`/tutors/${id}`);
      return response.data;
    } catch (error) {
      return undefined;
    }
  },

  async search(query: string): Promise<Tutor[]> {
    if (USE_MOCK) {
      await delay(300);
      const searchLower = query.toLowerCase();
      return mockTutors.filter(t => 
        t.firstName.toLowerCase().includes(searchLower) ||
        t.lastName.toLowerCase().includes(searchLower) ||
        (t.email && t.email.toLowerCase().includes(searchLower)) ||
        t.phone.includes(query) ||
        (t.documentNumber && t.documentNumber.includes(query))
      );
    }
    
    const response = await apiClient.get<PaginatedResponse<Tutor>>(`/tutors/search?search=${encodeURIComponent(query)}`);
    return response.data.content;
  },

  async searchPaginated(
    filters: TutorFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Tutor>> {
    if (USE_MOCK) {
      await delay(400);
      
      // Aplicar filtros
      let filteredTutors = [...mockTutors];
      
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredTutors = filteredTutors.filter(t => 
          t.firstName.toLowerCase().includes(searchLower) ||
          t.lastName.toLowerCase().includes(searchLower) ||
          (t.email && t.email.toLowerCase().includes(searchLower)) ||
          t.phone.includes(filters.searchText!) ||
          (t.documentNumber && t.documentNumber.includes(filters.searchText!))
        );
      }
      
      if (filters.relationship) {
        filteredTutors = filteredTutors.filter(t => t.relationship === filters.relationship);
      }
      
      if (filters.isActive !== undefined) {
        filteredTutors = filteredTutors.filter(t => t.isActive === filters.isActive);
      }
      
      // Aplicar ordenamiento
      if (pagination.sortBy) {
        filteredTutors.sort((a, b) => {
          const aValue = (a as any)[pagination.sortBy!];
          const bValue = (b as any)[pagination.sortBy!];
          
          if (aValue < bValue) return pagination.sortDir === 'desc' ? 1 : -1;
          if (aValue > bValue) return pagination.sortDir === 'desc' ? -1 : 1;
          return 0;
        });
      }
      
      // Aplicar paginación
      const page = pagination.page || 0;
      const size = pagination.size || 10;
      const start = page * size;
      const end = start + size;
      const paginatedContent = filteredTutors.slice(start, end);
      
      return {
        content: paginatedContent,
        totalElements: filteredTutors.length,
        totalPages: Math.ceil(filteredTutors.length / size),
        number: page,
        size: size,
        first: page === 0,
        last: end >= filteredTutors.length
      };
    }
    
    // Construir parámetros de query para el backend
    const params = new URLSearchParams();
    
    if (filters.searchText) params.append('searchText', filters.searchText);
    if (filters.relationship) params.append('relationship', filters.relationship);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    
    if (pagination.page !== undefined) params.append('page', pagination.page.toString());
    if (pagination.size !== undefined) params.append('size', pagination.size.toString());
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortDir) params.append('sortDir', pagination.sortDir);
    
    const response = await apiClient.get<PaginatedResponse<Tutor>>(`/tutors?${params.toString()}`);
    return response.data;
  },

  async create(tutor: Omit<Tutor, 'id' | 'createdAt' | 'updatedAt' | 'publicId'>): Promise<Tutor> {
    if (USE_MOCK) {
      await delay(500);
      const newTutor: Tutor = {
        ...tutor,
        publicId: '',
        id: (mockTutors.length + 1).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockTutors.push(newTutor);
      return newTutor;
    }
    
    const response = await apiClient.post<Tutor>('/tutors', tutor);
    return response.data;
  },

  async update(id: string, tutor: Partial<Tutor>): Promise<Tutor> {
    if (USE_MOCK) {
      await delay(400);
      const index = mockTutors.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tutor no encontrado');
      
      mockTutors[index] = { 
        ...mockTutors[index], 
        ...tutor, 
        updatedAt: new Date().toISOString() 
      };
      return mockTutors[index];
    }
    
    const response = await apiClient.put<Tutor>(`/tutors/${id}`, tutor);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(300);
      const index = mockTutors.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tutor no encontrado');
      
      mockTutors.splice(index, 1);
      return;
    }
    
    await apiClient.delete(`/tutors/${id}`);
  }
};
