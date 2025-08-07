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

export const getAge = (dateOfBirth: string): number => {
  return dayjs().diff(dayjs(dateOfBirth), 'year');
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

export const capitalizeText = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
