import type { Grade } from '../types';
import { apiClient, USE_MOCK, delay } from './apiClient';

// Mock data para desarrollo
const mockGrades: Grade[] = [
  { id: '1', name: 'Preescolar', sections: ['A', 'B'] },
  { id: '2', name: 'Primero', sections: ['A', 'B', 'C'] },
  { id: '3', name: 'Segundo', sections: ['A', 'B', 'C'] },
  { id: '4', name: 'Tercero', sections: ['A', 'B'] },
  { id: '5', name: 'Cuarto', sections: ['A', 'B'] },
  { id: '6', name: 'Quinto', sections: ['A', 'B'] },
  { id: '7', name: 'Sexto', sections: ['A'] }
];

// Grades API
export const gradesApi = {
  async getAll(): Promise<Grade[]> {
    if (USE_MOCK) {
      await delay(300);
      return [...mockGrades];
    }
    
    const response = await apiClient.get<Grade[]>('/grades');
    return response.data;
  }
};
