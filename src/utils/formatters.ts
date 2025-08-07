import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Configurar dayjs en español
dayjs.locale('es');

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const getAge = (dateOfBirth: string): number => {
  return dayjs().diff(dayjs(dateOfBirth), 'year');
};

export const isPaymentOverdue = (dueDate: string): boolean => {
  return dayjs(dueDate).isBefore(dayjs(), 'day');
};

export const getPaymentStatus = (status: string): { color: string; label: string } => {
  switch (status) {
    case 'pagado':
      return { color: 'success', label: 'Pagado' };
    case 'pendiente':
      return { color: 'warning', label: 'Pendiente' };
    case 'vencido':
      return { color: 'error', label: 'Vencido' };
    default:
      return { color: 'default', label: 'Desconocido' };
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
  return phoneRegex.test(phone);
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Función para normalizar datos de grupos que vienen del backend
export const normalizeGroupData = (group: any): any => {
  return {
    ...group,
    academicLevel: capitalizeFirstLetter(group.academicLevel || ''),
    grade: capitalizeFirstLetter(group.grade || ''),
    name: group.name?.toUpperCase() || ''
  };
};

// Función para normalizar arrays de grupos
export const normalizeGroupsArray = (groups: any[]): any[] => {
  return groups.map(normalizeGroupData);
};

// Función para preparar datos de grupo para enviar al backend (convierte a mayúsculas)
export const prepareGroupForBackend = (group: any): any => {
  return {
    ...group,
    academicLevel: group.academicLevel?.toUpperCase() || '',
    grade: group.grade?.toUpperCase() || '',
    name: group.name?.toUpperCase() || ''
  };
};
