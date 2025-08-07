import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
  Alert
} from '@mui/material';
import { studentsApi } from '../services/api';
import { getFullName } from '../utils/formatters';
import type { Student, Payment } from '../types';

interface PaymentFormData {
  studentId: string;
  amount: number;
  description: string;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
  status: 'pendiente' | 'pagado' | 'vencido';
  dueDate: string;
  period: string;
  periodType: 'diario' | 'semanal' | 'mensual';
  paymentDate: string;
}

interface PaymentFormErrors {
  studentId?: string;
  amount?: string;
  description?: string;
  paymentMethod?: string;
  status?: string;
  dueDate?: string;
  period?: string;
  periodType?: string;
  paymentDate?: string;
}

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Payment, 'id'>) => Promise<void>;
  payment?: Payment | null;
  loading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  open,
  onClose,
  onSubmit,
  payment,
  loading = false
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<PaymentFormData>({
    studentId: '',
    amount: 0,
    description: '',
    paymentMethod: 'efectivo',
    status: 'pendiente',
    dueDate: '',
    period: '',
    periodType: 'mensual',
    paymentDate: ''
  });
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentsApi.getAll();
        setStudents(data.filter(s => s.isActive));
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (payment) {
      setFormData({
        studentId: payment.studentId,
        amount: payment.amount,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        dueDate: payment.dueDate,
        period: payment.period,
        periodType: 'mensual', // Por ahora asumimos mensual para pagos existentes
        paymentDate: payment.paymentDate || ''
      });
      const student = students.find(s => s.id === payment.studentId);
      setSelectedStudent(student || null);
    } else {
      setFormData({
        studentId: '',
        amount: 0,
        description: '',
        paymentMethod: 'efectivo',
        status: 'pendiente',
        dueDate: '',
        period: '',
        periodType: 'mensual',
        paymentDate: ''
      });
      setSelectedStudent(null);
    }
    setErrors({});
  }, [payment, open, students]);

  // Función para generar período automáticamente
  const generatePeriod = (periodType: 'diario' | 'semanal' | 'mensual', dueDate: string): string => {
    if (!dueDate) return '';
    
    const date = new Date(dueDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    switch (periodType) {
      case 'diario':
        return `Día ${day}/${month}/${year}`;
      case 'semanal':
        const weekNumber = Math.ceil(day / 7);
        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `Semana ${weekNumber} de ${monthNames[date.getMonth()]} ${year}`;
      case 'mensual':
        const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
        return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
      default:
        return '';
    }
  };

  // Actualizar período cuando cambia el tipo de período o fecha de vencimiento
  useEffect(() => {
    if (formData.periodType && formData.dueDate) {
      const newPeriod = generatePeriod(formData.periodType, formData.dueDate);
      setFormData(prev => ({ ...prev, period: newPeriod }));
    }
  }, [formData.periodType, formData.dueDate]);

  const validateForm = (): boolean => {
    const newErrors: PaymentFormErrors = {};

    if (!formData.studentId) newErrors.studentId = 'Debe seleccionar un estudiante';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'El monto debe ser mayor a 0';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.periodType) newErrors.periodType = 'Debe seleccionar el tipo de período';
    if (!formData.dueDate) newErrors.dueDate = 'La fecha de vencimiento es obligatoria';
    if (!formData.period.trim()) newErrors.period = 'El período es obligatorio';
    
    // Si el estado es pagado, debe tener fecha de pago
    if (formData.status === 'pagado' && !formData.paymentDate) {
      newErrors.paymentDate = 'La fecha de pago es obligatoria para pagos realizados';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const paymentData: Omit<Payment, 'id'> = {
        studentId: formData.studentId,
        amount: formData.amount,
        description: formData.description.trim(),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        dueDate: formData.dueDate,
        period: formData.period.trim(),
        periodType: formData.periodType,
        paymentDate: formData.status === 'pagado' ? formData.paymentDate : ''
      };

      await onSubmit(paymentData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? Number(value) : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleStudentChange = (student: Student | null) => {
    setSelectedStudent(student);
    setFormData(prev => ({
      ...prev,
      studentId: student?.id || ''
    }));
    if (errors.studentId) {
      setErrors(prev => ({
        ...prev,
        studentId: undefined
      }));
    }
  };

  // Auto-llenar fecha de pago cuando se marca como pagado
  useEffect(() => {
    if (formData.status === 'pagado' && !formData.paymentDate) {
      setFormData(prev => ({
        ...prev,
        paymentDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [formData.status, formData.paymentDate]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {payment ? 'Editar Pago' : 'Registrar Nuevo Pago'}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Selección de Estudiante */}
          <Autocomplete
            value={selectedStudent}
            onChange={(_, newValue) => handleStudentChange(newValue)}
            options={students}
            getOptionLabel={(student) => getFullName(student.firstName, student.lastName)}
            renderOption={(props, student) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1">
                    {getFullName(student.firstName, student.lastName)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.grade} - Sección {student.section}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Estudiante"
                error={!!errors.studentId}
                helperText={errors.studentId}
                required
              />
            )}
            disabled={!!payment} // No permitir cambiar estudiante al editar
          />

          {/* Información del Pago */}
          <Typography variant="h6" color="primary">
            Información del Pago
          </Typography>

          <TextField
            label="Descripción"
            value={formData.description}
            onChange={handleInputChange('description')}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Ej: Desayuno escolar"
            required
          />

          <FormControl fullWidth error={!!errors.periodType}>
            <InputLabel>Tipo de Período</InputLabel>
            <Select
              value={formData.periodType}
              label="Tipo de Período"
              onChange={handleInputChange('periodType')}
            >
              <MenuItem value="diario">Diario</MenuItem>
              <MenuItem value="semanal">Semanal</MenuItem>
              <MenuItem value="mensual">Mensual</MenuItem>
            </Select>
            {errors.periodType && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.periodType}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Monto"
              type="number"
              value={formData.amount || ''}
              onChange={handleInputChange('amount')}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
              sx={{ flex: 1 }}
              required
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Método de Pago"
                onChange={handleInputChange('paymentMethod')}
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Período"
            value={formData.period}
            error={!!errors.period}
            helperText={errors.period || 'El período se genera automáticamente basándose en el tipo y fecha de vencimiento'}
            placeholder="Se generará automáticamente"
            InputProps={{
              readOnly: true
            }}
            required
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Fecha de Vencimiento"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange('dueDate')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.dueDate}
              helperText={errors.dueDate}
              sx={{ flex: 1 }}
              required
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={handleInputChange('status')}
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="pagado">Pagado</MenuItem>
                <MenuItem value="vencido">Vencido</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {formData.status === 'pagado' && (
            <TextField
              label="Fecha de Pago"
              type="date"
              value={formData.paymentDate}
              onChange={handleInputChange('paymentDate')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.paymentDate}
              helperText={errors.paymentDate}
              required
            />
          )}

          {formData.status === 'pagado' && formData.amount > 0 && (
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Total a pagar:</strong> ${formData.amount.toLocaleString()}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Guardando...' : payment ? 'Actualizar' : 'Registrar Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
