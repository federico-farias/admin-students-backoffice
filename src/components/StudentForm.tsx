import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  Alert
} from '@mui/material';
import { studentsApi } from '../services/api';
import type { Student } from '../types';
import { TutorSelector } from './TutorSelector';

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  tutorIds: string[];
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

interface StudentFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  tutorIds?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  student?: Student | null;
  mode?: 'create' | 'edit' | 'view';
}

export const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onClose,
  onSuccess,
  student,
  mode = 'create'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    tutorIds: [],
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });
  const [errors, setErrors] = useState<StudentFormErrors>({});

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth,
        tutorIds: [], // TODO: Cargar tutorIds del estudiante cuando el backend esté disponible
        address: student.address,
        emergencyContactName: student.emergencyContact?.name || '',
        emergencyContactPhone: student.emergencyContact?.phone || '',
        emergencyContactRelationship: student.emergencyContact?.relationship || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        tutorIds: [],
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: ''
      });
    }
    setErrors({});
  }, [student, open]);

  const validateForm = (): boolean => {
    const newErrors: StudentFormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La fecha de nacimiento es obligatoria';
    if (formData.tutorIds.length === 0) newErrors.tutorIds = 'Debe seleccionar al menos un tutor';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      const studentData: Omit<Student, 'id'> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth,
        grade: '', // Campo removido del formulario, valor por defecto
        section: '', // Campo removido del formulario, valor por defecto
        parentName: '', // TODO: Obtener del primer tutor cuando el backend esté disponible
        parentPhone: '', // TODO: Obtener del primer tutor cuando el backend esté disponible
        parentEmail: undefined, // TODO: Obtener del primer tutor cuando el backend esté disponible
        address: formData.address.trim(),
        isActive: true,
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone || formData.emergencyContactRelationship) ? {
          name: formData.emergencyContactName || '',
          phone: formData.emergencyContactPhone || '',
          relationship: formData.emergencyContactRelationship || ''
        } : undefined
      };

      if (mode === 'create') {
        await studentsApi.create(studentData);
      } else if (mode === 'edit' && student) {
        await studentsApi.update(student.id, studentData);
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Error al guardar el estudiante. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value as string
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof StudentFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        {mode === 'create' ? 'Nuevo Estudiante' : mode === 'edit' ? 'Editar Estudiante' : 'Ver Estudiante'}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 1 }}>
          {/* Información del Estudiante */}
          <Typography variant="h6" gutterBottom color="primary">
            Información del Estudiante
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Nombre"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label="Apellido"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={{ flex: 1, minWidth: 200 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Fecha de Nacimiento"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label="Email del Estudiante (Opcional)"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ flex: 1, minWidth: 200 }}
              />
            </Box>
            <TextField
              label="Teléfono del Estudiante (Opcional)"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              label="Dirección"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleInputChange('address')}
              error={!!errors.address}
              helperText={errors.address}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Selector de Tutores */}
          <TutorSelector
            selectedTutorIds={formData.tutorIds}
            onTutorIdsChange={(tutorIds) => {
              setFormData(prev => ({ ...prev, tutorIds }));
              // Limpiar error cuando se seleccionen tutores
              if (tutorIds.length > 0 && errors.tutorIds) {
                setErrors(prev => ({ ...prev, tutorIds: undefined }));
              }
            }}
            label="Tutores del Estudiante"
            required={true}
            disabled={mode === 'view'}
            error={errors.tutorIds}
            helperText="Selecciona al menos un tutor responsable del estudiante"
          />

          <Divider sx={{ my: 2 }} />

          {/* Contacto de Emergencia */}
          <Typography variant="h6" gutterBottom color="primary">
            Contacto de Emergencia (Opcional)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              value={formData.emergencyContactName}
              onChange={handleInputChange('emergencyContactName')}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Teléfono"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange('emergencyContactPhone')}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label="Parentesco"
                placeholder="Ej: Tío, Abuelo, etc."
                value={formData.emergencyContactRelationship}
                onChange={handleInputChange('emergencyContactRelationship')}
                sx={{ flex: 1, minWidth: 200 }}
              />
            </Box>
          </Box>
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
          {loading ? 'Guardando...' : student ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
