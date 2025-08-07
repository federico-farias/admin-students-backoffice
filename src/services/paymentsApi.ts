import type { Payment } from '../types';
import { apiClient, USE_MOCK, delay } from './apiClient';

// Mock data para desarrollo
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
