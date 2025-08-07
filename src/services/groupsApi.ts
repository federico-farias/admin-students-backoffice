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
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false; // Cambia a false para usar API real

// Mock data para desarrollo
let mockGroups: Group[] = [
  { id: '1', academicLevel: 'Maternal', grade: 'Primero', name: 'A', maxStudents: 10, studentsCount: 8 },
  { id: '2', academicLevel: 'Maternal', grade: 'Segundo', name: 'A', maxStudents: 10, studentsCount: 10 },
  { id: '3', academicLevel: 'Primaria', grade: 'Primero', name: 'A', maxStudents: 10, studentsCount: 10 },
  { id: '4', academicLevel: 'Primaria', grade: 'Primero', name: 'B', maxStudents: 10, studentsCount: 2 },
  { id: '5', academicLevel: 'Secundaria', grade: 'Tercero', name: 'A', maxStudents: 10, studentsCount: 5 }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const groupsApi = {
  async getAll(): Promise<Group[]> {
    if (USE_MOCK) {
      await delay(300);
      return [...mockGroups];
    }
    console.log('Enviroment variable VITE_USE_MOCK:', USE_MOCK);
    const response = await apiClient.get<Group[]>('/groups');
    return response.data;
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
        id: (mockGroups.length + 1).toString(),
        studentsCount: 0
      };
      mockGroups.push(newGroup);
      return newGroup;
    }
    
    const response = await apiClient.post<Group>('/groups', group);
    return response.data;
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
      const response = await apiClient.put<Group>(`/groups/${id}`, group);
      return response.data;
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
    
    const response = await apiClient.get<Group[]>(`/groups/filter?academicLevel=${encodeURIComponent(academicLevel)}&grade=${encodeURIComponent(grade)}`);
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
    
    const response = await apiClient.get<Group[]>(`/groups/available?academicLevel=${encodeURIComponent(academicLevel)}&grade=${encodeURIComponent(grade)}`);
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
