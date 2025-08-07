import axios from 'axios';
import type { Group } from '../types/group';

// Configuración del cliente HTTP
const apiClient = axios.create({
  baseURL: '/api', // Usa el proxy configurado en vite.config.ts
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para alternar entre mock y API real
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false;

// Tipos para filtros y paginación
export interface GroupFilters {
  searchText?: string;
  academicLevel?: string;
  grade?: string;
  name?: string;
  academicYear?: string;
  isActive?: boolean;
  availableOnly?: boolean;
}

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

// Mock data para desarrollo
let mockGroups: Group[] = [
  {
    id: '1',
    academicLevel: 'Primaria',
    grade: 'Primero',
    name: 'A',
    academicYear: '2024-2025',
    maxStudents: 25,
    studentsCount: 20,
    isActive: true
  },
  {
    id: '2',
    academicLevel: 'Primaria',
    grade: 'Segundo',
    name: 'B',
    academicYear: '2024-2025',
    maxStudents: 30,
    studentsCount: 28,
    isActive: true
  },
  {
    id: '3',
    academicLevel: 'Secundaria',
    grade: 'Tercero',
    name: 'A',
    academicYear: '2024-2025',
    maxStudents: 20,
    studentsCount: 15,
    isActive: true
  },
  {
    id: '4',
    academicLevel: 'Primaria',
    grade: 'Cuarto',
    name: 'C',
    academicYear: '2023-2024',
    maxStudents: 22,
    studentsCount: 18,
    isActive: false
  },
  {
    id: '5',
    academicLevel: 'Secundaria',
    grade: 'Primero',
    name: 'B',
    academicYear: '2024-2025',
    maxStudents: 25,
    studentsCount: 23,
    isActive: true
  }
];

let groupIdCounter = 6;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const groupsApi = {
  async getAll(): Promise<Group[]> {
    if (USE_MOCK) {
      await delay(300);
      return [...mockGroups];
    }
    
    const response = await apiClient.get<Group[]>('/groups');
    return response.data.map(fromBackendFormat);
  },
  
  async getById(id: string): Promise<Group | undefined> {
    if (USE_MOCK) {
      await delay(200);
      return mockGroups.find(g => g.id === id);
    }
    
    try {
      const response = await apiClient.get<Group>(`/groups/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  },
  
  async create(group: Omit<Group, 'id' | 'studentsCount'>): Promise<Group> {
    if (USE_MOCK) {
      await delay(300);
      const newGroup: Group = {
        ...group,
        id: (groupIdCounter++).toString(),
        studentsCount: 0
      };
      mockGroups.push(newGroup);
      return newGroup;
    }
    
    // Preparar datos para el backend (convertir a mayúsculas)
    const groupForBackend = toBackendFormat(group);
    const response = await apiClient.post<Group>('/groups', groupForBackend);
    return fromBackendFormat(response.data);
  },
  
  async update(id: string, group: Partial<Group>): Promise<Group | undefined> {
    if (USE_MOCK) {
      await delay(300);
      const idx = mockGroups.findIndex(g => g.id === id);
      if (idx === -1) return undefined;
      mockGroups[idx] = { ...mockGroups[idx], ...group };
      return mockGroups[idx];
    }
    
    try {
      // Preparar datos para el backend (convertir a mayúsculas)
      const groupForBackend = toBackendFormat(group);
      const response = await apiClient.put<Group>(`/groups/${id}`, groupForBackend);
      return fromBackendFormat(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  },
  
  async delete(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay(200);
      const prevLen = mockGroups.length;
      mockGroups = mockGroups.filter(g => g.id !== id);
      return mockGroups.length < prevLen;
    }
    
    try {
      await apiClient.delete(`/groups/${id}`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },
  
  // Funciones auxiliares para consultas específicas
  async getByAcademicLevelAndGrade(academicLevel: string, grade: string): Promise<Group[]> {
    if (USE_MOCK) {
      await delay(200);
      return mockGroups.filter(g => g.academicLevel === academicLevel && g.grade === grade);
    }
    
    // Convertir parámetros a mayúsculas para el backend
    const academicLevelUpper = academicLevel.toUpperCase();
    const gradeUpper = grade.toUpperCase();
    
    const response = await apiClient.get<Group[]>(`/groups/filter?academicLevel=${encodeURIComponent(academicLevelUpper)}&grade=${encodeURIComponent(gradeUpper)}`);
    return response.data;
  },
  
  async getAvailableGroups(academicLevel: string, grade: string): Promise<Group[]> {
    if (USE_MOCK) {
      await delay(200);
      return mockGroups.filter(g => 
        g.academicLevel === academicLevel && 
        g.grade === grade && 
        g.studentsCount < g.maxStudents
      );
    }
    
    // Convertir parámetros a mayúsculas para el backend
    const academicLevelUpper = academicLevel.toUpperCase();
    const gradeUpper = grade.toUpperCase();
    
    const response = await apiClient.get<Group[]>(`/groups/available?academicLevel=${encodeURIComponent(academicLevelUpper)}&grade=${encodeURIComponent(gradeUpper)}`);
    return response.data;
  },
  
  async updateStudentCount(id: string, increment: number): Promise<Group | undefined> {
    if (USE_MOCK) {
      await delay(200);
      const group = mockGroups.find(g => g.id === id);
      if (group) {
        group.studentsCount = Math.max(0, group.studentsCount + increment);
        return group;
      }
      return undefined;
    }
    
    try {
      const response = await apiClient.patch<Group>(`/groups/${id}/student-count`, { increment });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  },
  
  async getGroupStats(): Promise<{
    totalGroups: number;
    totalStudents: number;
    fullGroups: number;
    averageOccupancy: number;
  }> {
    if (USE_MOCK) {
      await delay(200);
      const totalGroups = mockGroups.length;
      const totalStudents = mockGroups.reduce((sum, g) => sum + g.studentsCount, 0);
      const fullGroups = mockGroups.filter(g => g.studentsCount >= g.maxStudents).length;
      const totalCapacity = mockGroups.reduce((sum, g) => sum + g.maxStudents, 0);
      const averageOccupancy = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;
      
      return {
        totalGroups,
        totalStudents,
        fullGroups,
        averageOccupancy: Math.round(averageOccupancy * 100) / 100
      };
    }
    
    const response = await apiClient.get('/groups/stats');
    return response.data;
  }
};

// Función auxiliar para filtrar grupos en mock
const filterMockGroups = (filters: GroupFilters, pagination: PaginationParams): PaginatedResponse<Group> => {
  let filteredGroups = [...mockGroups];

  // Aplicar filtros
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    filteredGroups = filteredGroups.filter(group =>
      group.name.toLowerCase().includes(searchLower) ||
      group.grade.toLowerCase().includes(searchLower) ||
      group.academicYear.toLowerCase().includes(searchLower)
    );
  }

  if (filters.academicLevel) {
    filteredGroups = filteredGroups.filter(group => 
      group.academicLevel === filters.academicLevel
    );
  }

  if (filters.grade) {
    filteredGroups = filteredGroups.filter(group => 
      group.grade.toLowerCase().includes(filters.grade!.toLowerCase())
    );
  }

  if (filters.name) {
    filteredGroups = filteredGroups.filter(group => 
      group.name.toLowerCase().includes(filters.name!.toLowerCase())
    );
  }

  if (filters.academicYear) {
    filteredGroups = filteredGroups.filter(group => 
      group.academicYear === filters.academicYear
    );
  }

  if (filters.isActive !== undefined) {
    filteredGroups = filteredGroups.filter(group => 
      group.isActive === filters.isActive
    );
  }

  if (filters.availableOnly) {
    filteredGroups = filteredGroups.filter(group => 
      (group.studentsCount || 0) < group.maxStudents
    );
  }

  // Aplicar ordenamiento
  const sortBy = pagination.sortBy || 'id';
  const sortDir = pagination.sortDir || 'asc';
  
  filteredGroups.sort((a, b) => {
    let aValue: any = a[sortBy as keyof Group];
    let bValue: any = b[sortBy as keyof Group];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Aplicar paginación si no es unpaginated
  if (pagination.unpaginated) {
    return {
      content: filteredGroups,
      totalElements: filteredGroups.length,
      totalPages: 1,
      number: 0,
      size: filteredGroups.length,
      first: true,
      last: true
    };
  }

  const page = pagination.page || 0;
  const size = pagination.size || 10;
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedContent = filteredGroups.slice(startIndex, endIndex);

  return {
    content: paginatedContent,
    totalElements: filteredGroups.length,
    totalPages: Math.ceil(filteredGroups.length / size),
    number: page,
    size: size,
    first: page === 0,
    last: page >= Math.ceil(filteredGroups.length / size) - 1
  };
};

// Función auxiliar para convertir datos a formato backend
const toBackendFormat = (group: any): any => {
  return {
    ...group,
    academicLevel: group.academicLevel.toUpperCase()
  };
};

// Función auxiliar para convertir datos de formato backend
const fromBackendFormat = (group: any): Group => {
  return {
    ...group,
    id: group.id?.toString() || '',
    academicLevel: group.academicLevel?.charAt(0).toUpperCase() + group.academicLevel?.slice(1).toLowerCase() || ''
  };
};

/**
 * Obtiene grupos con filtros y paginación
 */
export const searchGroups = async (
  filters: GroupFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<Group>> => {
  if (USE_MOCK) {
    // Simular delay de red
    await delay(300);
    return filterMockGroups(filters, pagination);
  }

  try {
    const params = new URLSearchParams();
    
    // Agregar filtros
    if (filters.searchText) params.append('searchText', filters.searchText);
    if (filters.academicLevel) params.append('academicLevel', filters.academicLevel.toUpperCase());
    if (filters.grade) params.append('grade', filters.grade);
    if (filters.name) params.append('name', filters.name);
    if (filters.academicYear) params.append('academicYear', filters.academicYear);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.availableOnly) params.append('availableOnly', filters.availableOnly.toString());
    
    // Agregar paginación
    if (pagination.page !== undefined) params.append('page', pagination.page.toString());
    if (pagination.size !== undefined) params.append('size', pagination.size.toString());
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortDir) params.append('sortDir', pagination.sortDir);
    if (pagination.unpaginated) params.append('unpaginated', pagination.unpaginated.toString());

    const response = await apiClient.get(`/groups?${params.toString()}`);
    
    return {
      ...response.data,
      content: response.data.content.map(fromBackendFormat)
    };
  } catch (error) {
    console.error('Error searching groups:', error);
    throw error;
  }
};

// Mantener compatibilidad con funciones legacy
export const getAll = groupsApi.getAll;
export const getById = groupsApi.getById;
export const create = groupsApi.create;
export const update = groupsApi.update;
export const deleteGroup = groupsApi.delete;
