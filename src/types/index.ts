export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  grade: string;
  section: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string;
  enrollmentDate: string;
  isActive: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  description: string;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
  status: 'pendiente' | 'pagado' | 'vencido';
  dueDate: string;
  period: string; // Ej: "Enero 2025", "Semana 1-5 Febrero", "Día 15/08/2025"
  periodType?: 'diario' | 'semanal' | 'mensual'; // Tipo de período (opcional para compatibilidad)
}

export interface BreakfastPackage {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  isActive: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalPayments: number;
  pendingPayments: number;
  monthlyRevenue: number;
  unpaidAmount: number;
}

export interface Grade {
  id: string;
  name: string;
  sections: string[];
}

export type PaymentFilter = {
  status?: Payment['status'];
  paymentMethod?: Payment['paymentMethod'];
  dateRange?: {
    start: string;
    end: string;
  };
  studentId?: string;
};
