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
  Divider,
  Alert
} from '@mui/material';
import { gradesApi, studentsApi } from '../services/api';
import type { Student, Grade } from '../types';

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  academicLevel: string;
  grade: string;
  group: string; // antes section
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
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
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    academicLevel: '',
    grade: '',
    group: '', // antes section
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });
  const [errors, setErrors] = useState<Partial<StudentFormData>>({});

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await gradesApi.getAll();
        setGrades(data);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
    fetchGrades();
  }, []);

  useEffect(() => {
    if (student) {
      // Determinar academicLevel a partir del grade
      let academicLevel = '';
      if (student.grade.startsWith('Maternal')) academicLevel = 'Maternal';
      else if (student.grade.startsWith('Preescolar')) academicLevel = 'Preescolar';
      else if (student.grade.startsWith('Primaria')) academicLevel = 'Primaria';
      else if (student.grade.startsWith('Secundaria')) academicLevel = 'Secundaria';
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth,
        academicLevel,
        grade: student.grade,
        group: student.section,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail || '',
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
        academicLevel: '',
        grade: '',
        group: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: ''
      });
    }
    setErrors({});
  }, [student, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La fecha de nacimiento es obligatoria';
    if (!formData.grade) newErrors.grade = 'El grado es obligatorio';
    if (!formData.group) newErrors.group = 'El grupo es obligatorio';
    if (!formData.parentName.trim()) newErrors.parentName = 'El nombre del padre/tutor es obligatorio';
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'El teléfono del padre/tutor es obligatorio';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (formData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Email inválido';
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
        grade: formData.grade,
        section: formData.group,
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        parentEmail: formData.parentEmail || undefined,
        address: formData.address.trim(),
        enrollmentDate: new Date().toISOString().split('T')[0],
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
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Filtrar grados según el nivel académico seleccionado
let filteredGrades: Grade[] = [];
if (formData.academicLevel === 'Maternal') {
  filteredGrades = [
    { id: 'maternal-1', name: 'Primero', sections: ['A', 'B'] },
    { id: 'maternal-2', name: 'Segundo', sections: ['A', 'B'] }
  ];
} else if (formData.academicLevel === 'Preescolar') {
  filteredGrades = [
    { id: 'preescolar-1', name: 'Primero', sections: ['A', 'B'] },
    { id: 'preescolar-2', name: 'Segundo', sections: ['A', 'B'] },
    { id: 'preescolar-3', name: 'Tercero', sections: ['A', 'B'] }
  ];
} else if (formData.academicLevel === 'Primaria') {
  filteredGrades = [
    { id: 'primaria-1', name: 'Primero', sections: ['A', 'B'] },
    { id: 'primaria-2', name: 'Segundo', sections: ['A', 'B'] },
    { id: 'primaria-3', name: 'Tercero', sections: ['A', 'B'] },
    { id: 'primaria-4', name: 'Cuarto', sections: ['A', 'B'] },
    { id: 'primaria-5', name: 'Quinto', sections: ['A', 'B'] },
    { id: 'primaria-6', name: 'Sexto', sections: ['A', 'B'] }
  ];
} else if (formData.academicLevel === 'Secundaria') {
  filteredGrades = [
    { id: 'secundaria-1', name: 'Primero', sections: ['A', 'B'] },
    { id: 'secundaria-2', name: 'Segundo', sections: ['A', 'B'] },
    { id: 'secundaria-3', name: 'Tercero', sections: ['A', 'B'] }
  ];
}
  const selectedGradeData = grades.find(g => g.name === formData.grade);
  const availableGroups = selectedGradeData?.sections || [];

  // Limpiar grupo si el grado cambia
  useEffect(() => {
    if (formData.grade && !availableGroups.includes(formData.group)) {
      setFormData(prev => ({ ...prev, group: '' }));
    }
  }, [formData.grade, availableGroups, formData.group]);

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

          {/* Información Académica */}
          <Typography variant="h6" gutterBottom color="primary">
            Información Académica
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
              <InputLabel>Nivel Académico</InputLabel>
              <Select
                value={formData.academicLevel}
                label="Nivel Académico"
                onChange={handleInputChange('academicLevel')}
              >
                <MenuItem value="Maternal">Maternal</MenuItem>
                <MenuItem value="Preescolar">Preescolar</MenuItem>
                <MenuItem value="Primaria">Primaria</MenuItem>
                <MenuItem value="Secundaria">Secundaria</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1, minWidth: 200 }} error={!!errors.grade}>
              <InputLabel>Grado</InputLabel>
              <Select
                value={formData.grade}
                label="Grado"
                onChange={handleInputChange('grade')}
                disabled={!formData.academicLevel}
              >
                {filteredGrades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.name}>
                    {grade.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.grade && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.grade}
                </Typography>
              )}
            </FormControl>
            <FormControl sx={{ flex: 1, minWidth: 200 }} error={!!errors.group}>
              <InputLabel>Grupo</InputLabel>
              <Select
                value={formData.group}
                label="Grupo"
                onChange={handleInputChange('group')}
                disabled={!formData.grade}
              >
                {availableGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
              {errors.group && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.group}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Información del Padre/Tutor */}
          <Typography variant="h6" gutterBottom color="primary">
            Información del Padre/Tutor
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Nombre del Padre/Tutor"
                value={formData.parentName}
                onChange={handleInputChange('parentName')}
                error={!!errors.parentName}
                helperText={errors.parentName}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label="Teléfono del Padre/Tutor"
                value={formData.parentPhone}
                onChange={handleInputChange('parentPhone')}
                error={!!errors.parentPhone}
                helperText={errors.parentPhone}
                sx={{ flex: 1, minWidth: 200 }}
              />
            </Box>
            <TextField
              label="Email del Padre/Tutor (Opcional)"
              type="email"
              value={formData.parentEmail}
              onChange={handleInputChange('parentEmail')}
              error={!!errors.parentEmail}
              helperText={errors.parentEmail}
            />
          </Box>

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
