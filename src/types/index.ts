export interface Student {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  address: string;
  isActive: boolean;
  tutorIds: string[]; // IDs of associated tutors
  tutors: Tutor[];
  emergencyContactIds: string[]; // IDs of associated emergency contacts
  emergencyContacts: EmergencyContact[];
  createdAt: string;
}

export interface Tutor {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  relationship: string; // Padre, Madre, Abuelo, etc.
  documentNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export type EnrollmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export interface Enrollment {
  id: string;
  publicId: string;
  studentPublicId: string;
  studentFullName?: string;
  groupId: number;
  groupFullName?: string;
  enrollmentDate: string;
  academicYear: string;
  enrollmentFee: number;
  status: EnrollmentStatus;
  notes?: string;
  isActive: boolean;
}

export interface EnrollmentFilters {
  status?: EnrollmentStatus;
  academicYear?: string;
  groupId?: number;
  isActive?: boolean;
  searchText?: string;
  studentName?: string;
  page?: number;
  limit?: number;
}

export type EnrollmentFilter = {
  status?: EnrollmentStatus;
  academicYear?: string;
  groupId?: number;
  isActive?: boolean;
  searchText?: string;
  dateRange?: {
    start: string;
    end: string;
  };
};

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface EmergencyContact {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  relationship: string; // Familiar, Amigo, Médico, etc.
  documentNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs para requests al backend
export interface StudentTutorRequest {
  tutorPublicId: string;
  relationship: string;
}

export interface StudentEmergencyContactRequest {
  emergencyContactPublicId: string;
  relationship: string;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  address: string;
  tutors: StudentTutorRequest[];
  emergencyContactsInfo: StudentEmergencyContactRequest[];
}

export interface UpdateStudentRequest extends CreateStudentRequest {
}
