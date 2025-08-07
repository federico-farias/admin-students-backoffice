import type { Student, Payment, DashboardStats, Grade } from '../types';

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
    enrollmentDate: '2024-02-01',
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
    enrollmentDate: '2024-02-01',
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

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Students API
export const studentsApi = {
  async getAll(): Promise<Student[]> {
    await delay(500);
    return [...mockStudents];
  },

  async getById(id: string): Promise<Student | null> {
    await delay(300);
    return mockStudents.find(student => student.id === id) || null;
  },

  async create(student: Omit<Student, 'id'>): Promise<Student> {
    await delay(500);
    const newStudent: Student = {
      ...student,
      id: (mockStudents.length + 1).toString()
    };
    mockStudents.push(newStudent);
    return newStudent;
  },

  async update(id: string, student: Partial<Student>): Promise<Student> {
    await delay(500);
    const index = mockStudents.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Estudiante no encontrado');
    
    mockStudents[index] = { ...mockStudents[index], ...student };
    return mockStudents[index];
  },

  async delete(id: string): Promise<void> {
    await delay(500);
    const index = mockStudents.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Estudiante no encontrado');
    
    mockStudents.splice(index, 1);
  }
};

// Payments API
export const paymentsApi = {
  async getAll(): Promise<Payment[]> {
    await delay(500);
    return [...mockPayments];
  },

  async getByStudentId(studentId: string): Promise<Payment[]> {
    await delay(300);
    return mockPayments.filter(payment => payment.studentId === studentId);
  },

  async create(payment: Omit<Payment, 'id'>): Promise<Payment> {
    await delay(500);
    const newPayment: Payment = {
      ...payment,
      id: (mockPayments.length + 1).toString()
    };
    mockPayments.push(newPayment);
    return newPayment;
  },

  async update(id: string, payment: Partial<Payment>): Promise<Payment> {
    await delay(500);
    const index = mockPayments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pago no encontrado');
    
    mockPayments[index] = { ...mockPayments[index], ...payment };
    return mockPayments[index];
  },

  async delete(id: string): Promise<void> {
    await delay(500);
    const index = mockPayments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pago no encontrado');
    
    mockPayments.splice(index, 1);
  }
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
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
};

// Grades API
export const gradesApi = {
  async getAll(): Promise<Grade[]> {
    await delay(300);
    return [...mockGrades];
  }
};
