import type { Group } from '../types/group';

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
    await delay(300);
    return [...mockGroups];
  },
  async getById(id: string): Promise<Group | undefined> {
    await delay(200);
    return mockGroups.find(g => g.id === id);
  },
  async create(group: Omit<Group, 'id' | 'studentsCount'>): Promise<Group> {
    await delay(300);
    const newGroup: Group = {
      ...group,
      id: (mockGroups.length + 1).toString(),
      studentsCount: 0
    };
    mockGroups.push(newGroup);
    return newGroup;
  },
  async update(id: string, group: Partial<Group>): Promise<Group | undefined> {
    await delay(300);
    const idx = mockGroups.findIndex(g => g.id === id);
    if (idx === -1) return undefined;
    mockGroups[idx] = { ...mockGroups[idx], ...group };
    return mockGroups[idx];
  },
  async delete(id: string): Promise<boolean> {
    await delay(200);
    const prevLen = mockGroups.length;
    mockGroups = mockGroups.filter(g => g.id !== id);
    return mockGroups.length < prevLen;
  },
  
  // Funciones auxiliares para consultas específicas
  async getByAcademicLevelAndGrade(academicLevel: string, grade: string): Promise<Group[]> {
    await delay(200);
    return mockGroups.filter(g => g.academicLevel === academicLevel && g.grade === grade);
  },
  
  async getAvailableGroups(academicLevel: string, grade: string): Promise<Group[]> {
    await delay(200);
    return mockGroups.filter(g => 
      g.academicLevel === academicLevel && 
      g.grade === grade && 
      g.studentsCount < g.maxStudents
    );
  },
  
  async updateStudentCount(id: string, increment: number): Promise<Group | undefined> {
    await delay(200);
    const group = mockGroups.find(g => g.id === id);
    if (group) {
      group.studentsCount = Math.max(0, group.studentsCount + increment);
      return group;
    }
    return undefined;
  },
  
  async getGroupStats(): Promise<{
    totalGroups: number;
    totalStudents: number;
    fullGroups: number;
    averageOccupancy: number;
  }> {
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
};
