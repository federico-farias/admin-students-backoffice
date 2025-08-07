import axios from 'axios';
import type { Student, Payment, DashboardStats, Grade, Enrollment, EnrollmentFilters, EnrollmentStatus } from '../types';

// Tipos para filtros y paginación de estudiantes
export interface StudentFilters {
  searchText?: string;
  grade?: string;
  section?: string;
  isActive?: boolean;
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

const mockPayments: Payment[] = [
  {
    id: '1',
    studentId: '1',
    amount: 150.00,
    paymentDate: '2025-01-05',
    description: 'Desayuno - Enero 2025',
    paymentMethod: 'transferencia',
    status: 'pagado',
    dueDate: '2025-01-31',
    period: 'Enero 2025',
    periodType: 'mensual'
  },
  {
    id: '2',
    studentId: '2',
    amount: 30.00,
    paymentDate: '',
    description: 'Desayuno - Semana 1 Agosto',
    paymentMethod: 'efectivo',
    status: 'pendiente',
    dueDate: '2025-08-07',
    period: 'Semana 1 de Agosto 2025',
    periodType: 'semanal'
  },
  {
    id: '3',
    studentId: '3',
    amount: 5.00,
    paymentDate: '2025-08-06',
    description: 'Desayuno - Día 6 Agosto',
    paymentMethod: 'efectivo',
    status: 'pagado',
    dueDate: '2025-08-06',
    period: 'Día 6/8/2025',
    periodType: 'diario'
  }
];

const mockGrades: Grade[] = [
  { id: '1', name: 'Preescolar', sections: ['A', 'B'] },
  { id: '2', name: 'Primero', sections: ['A', 'B', 'C'] },
  { id: '3', name: 'Segundo', sections: ['A', 'B', 'C'] },
  { id: '4', name: 'Tercero', sections: ['A', 'B'] },
  { id: '5', name: 'Cuarto', sections: ['A', 'B'] },
  { id: '6', name: 'Quinto', sections: ['A', 'B'] },
  { id: '7', name: 'Sexto', sections: ['A'] }
];

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

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Payments API
export const paymentsApi = {
  async getAll(): Promise<Payment[]> {
    if (USE_MOCK) {
      await delay(500);
      return [...mockPayments];
    }
    
    const response = await apiClient.get<Payment[]>('/payments');
    return response.data;
  },

  async getByStudentId(studentId: string): Promise<Payment[]> {
    if (USE_MOCK) {
      await delay(300);
      return mockPayments.filter(p => p.studentId === studentId);
    }
    
    const response = await apiClient.get<Payment[]>(`/payments/student/${studentId}`);
    return response.data;
  },

  async create(payment: Omit<Payment, 'id'>): Promise<Payment> {
    if (USE_MOCK) {
      await delay(500);
      const newPayment: Payment = {
        ...payment,
        id: (mockPayments.length + 1).toString()
      };
      mockPayments.push(newPayment);
      return newPayment;
    }
    
    const response = await apiClient.post<Payment>('/payments', payment);
    return response.data;
  },

  async update(id: string, payment: Partial<Payment>): Promise<Payment> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockPayments.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Pago no encontrado');
      
      mockPayments[index] = { ...mockPayments[index], ...payment };
      return mockPayments[index];
    }
    
    const response = await apiClient.put<Payment>(`/payments/${id}`, payment);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(500);
      const index = mockPayments.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Pago no encontrado');
      
      mockPayments.splice(index, 1);
      return;
    }
    
    await apiClient.delete(`/payments/${id}`);
  }
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    if (USE_MOCK) {
      await delay(500);
      const totalStudents = mockStudents.length;
      const activeStudents = mockStudents.filter(s => s.isActive).length;
      const paidPayments = mockPayments.filter(p => p.status === 'pagado');
      const pendingPayments = mockPayments.filter(p => p.status === 'pendiente');
      
      return {
        totalStudents,
        activeStudents,
        totalPayments: paidPayments.length,
        pendingPayments: pendingPayments.length,
        monthlyRevenue: paidPayments.reduce((sum, p) => sum + p.amount, 0),
        unpaidAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0)
      };
    }
    
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }
};

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
