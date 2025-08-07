import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography
} from '@mui/material';
import type { Group } from '../types/group';
import { groupsApi } from '../services/groupsApi';

interface GroupFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group?: Group | null;
  mode: 'create' | 'edit' | 'view';
}

const academicLevels = ['Maternal', 'Preescolar', 'Primaria', 'Secundaria'];
const gradesByLevel: Record<string, string[]> = {
  Maternal: ['Primero', 'Segundo'],
  Preescolar: ['Primero', 'Segundo', 'Tercero'],
  Primaria: ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto'],
  Secundaria: ['Primero', 'Segundo', 'Tercero']
};

// Generar años académicos
const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -2; i <= 2; i++) {
    const year = currentYear + i;
    years.push(`${year}-${year + 1}`);
  }
  return years;
};

const academicYears = generateAcademicYears();

export const GroupFormDialog: React.FC<GroupFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
  group,
  mode
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<Omit<Group, 'id' | 'studentsCount'>>({
    academicLevel: 'Primaria',
    grade: '',
    name: '',
    maxStudents: 25,
    academicYear: academicYears[2], // Año actual
    isActive: true
  });

  // Resetear formulario cuando cambie el grupo o modo
  useEffect(() => {
    if (group && (mode === 'edit' || mode === 'view')) {
      setForm({
        academicLevel: group.academicLevel,
        grade: group.grade,
        name: group.name,
        maxStudents: group.maxStudents,
        academicYear: group.academicYear,
        isActive: group.isActive ?? true
      });
    } else if (mode === 'create') {
      setForm({
        academicLevel: 'Primaria',
        grade: '',
        name: '',
        maxStudents: 25,
        academicYear: academicYears[2],
        isActive: true
      });
    }
    setError('');
  }, [group, mode, open]);

  const handleInputChange = (field: keyof typeof form, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar grado cuando cambie el nivel académico
    if (field === 'academicLevel') {
      setForm(prev => ({
        ...prev,
        grade: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!form.academicLevel || !form.grade || !form.name || !form.academicYear) {
      setError('Todos los campos son obligatorios');
      return false;
    }
    if (form.maxStudents < 1 || form.maxStudents > 50) {
      setError('El número máximo de estudiantes debe estar entre 1 y 50');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      if (mode === 'create') {
        await groupsApi.create(form);
      } else if (mode === 'edit' && group) {
        await groupsApi.update(group.id, form);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(mode === 'create' ? 'Error al crear el grupo' : 'Error al actualizar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Crear Nuevo Grupo';
      case 'edit': return 'Editar Grupo';
      case 'view': return 'Detalles del Grupo';
      default: return '';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" sx={{ mt: 1 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2}>
              <FormControl fullWidth disabled={isReadOnly}>
                <InputLabel>Nivel Académico</InputLabel>
                <Select
                  value={form.academicLevel}
                  onChange={(e) => handleInputChange('academicLevel', e.target.value)}
                  label="Nivel Académico"
                >
                  {academicLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={isReadOnly}>
                <InputLabel>Grado</InputLabel>
                <Select
                  value={form.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  label="Grado"
                >
                  {gradesByLevel[form.academicLevel]?.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Nombre del Grupo"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: A, B, C..."
                disabled={isReadOnly}
              />

              <TextField
                fullWidth
                type="number"
                label="Máximo de Estudiantes"
                value={form.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
                inputProps={{ min: 1, max: 50 }}
                disabled={isReadOnly}
              />
            </Box>

            <FormControl fullWidth disabled={isReadOnly}>
              <InputLabel>Año Académico</InputLabel>
              <Select
                value={form.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                label="Año Académico"
              >
                {academicYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {mode === 'view' && group && (
              <Box>
                <TextField
                  fullWidth
                  label="Estudiantes Actuales"
                  value={`${group.studentsCount}/${group.maxStudents}`}
                  disabled
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" color="text.secondary">
                  <strong>Estado:</strong> {group.isActive ? 'Activo' : 'Inactivo'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>ID:</strong> {group.id}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {mode === 'view' ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!isReadOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Guardar')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
