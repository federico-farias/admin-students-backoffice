import type { DashboardStats, Student, Payment } from '../types';
import { apiClient, USE_MOCK, delay } from './apiClient';

// Mock data (importamos de otros archivos en el futuro)
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
  }
];

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
