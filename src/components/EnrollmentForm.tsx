import { useState, useEffect } from 'react';
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
  Typography,
  Chip,
  Box,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import type { Enrollment, EnrollmentStatus, Student, Grade } from '../types';
import { studentsApi, gradesApi } from '../services/api';

interface EnrollmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Enrollment>) => void;
  enrollment?: Enrollment;
  mode: 'create' | 'edit' | 'view';
}

interface FormData {
  studentPublicId: string;
  groupId: number;
  enrollmentDate: string;
  academicYear: string;
  enrollmentFee: number;
  status: EnrollmentStatus;
  notes: string;
}

const getStatusColor = (status: EnrollmentStatus) => {
  switch (status) {
    case 'PENDIENTE': return 'warning';
    case 'CONFIRMADA': return 'info';
    case 'COMPLETADA': return 'success';
    case 'CANCELADA': return 'error';
    default: return 'default';
  }
};

const getStatusLabel = (status: EnrollmentStatus) => {
  switch (status) {
    case 'PENDIENTE': return 'Pendiente';
    case 'CONFIRMADA': return 'Confirmada';
    case 'COMPLETADA': return 'Completada';
    case 'CANCELADA': return 'Cancelada';
    default: return status;
  }
};

export default function EnrollmentForm({ 
  open, 
  onClose, 
  onSubmit, 
  enrollment, 
  mode 
}: EnrollmentFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearchText, setStudentSearchText] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      studentPublicId: enrollment?.studentPublicId || '',
      groupId: enrollment?.groupId || 0,
      enrollmentDate: enrollment?.enrollmentDate || new Date().toISOString().split('T')[0],
      academicYear: enrollment?.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      enrollmentFee: enrollment?.enrollmentFee || 250,
      status: enrollment?.status || 'PENDIENTE',
      notes: enrollment?.notes || ''
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const gradesData = await gradesApi.getAll();
        setGrades(gradesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  // Función para buscar estudiantes
  const searchStudents = async (searchText: string) => {
    if (searchText.length < 2) {
      // Solo mantener el estudiante seleccionado si existe
      const currentStudentId = control._getWatch('studentPublicId');
      if (currentStudentId) {
        const currentStudent = students.find(s => s.id === currentStudentId);
        setStudents(currentStudent ? [currentStudent] : []);
      } else {
        setStudents([]);
      }
      return;
    }

    try {
      setStudentLoading(true);
      const response = await studentsApi.searchPaginated(
        { searchText },
        { page: 0, size: 20, unpaginated: false }
      );
      setStudents(response.content);
    } catch (error) {
      console.error('Error searching students:', error);
      setStudents([]);
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    if (enrollment) {
      reset({
        studentPublicId: enrollment.studentPublicId,
        groupId: enrollment.groupId,
        enrollmentDate: enrollment.enrollmentDate,
        academicYear: enrollment.academicYear,
        enrollmentFee: enrollment.enrollmentFee,
        status: enrollment.status,
        notes: enrollment.notes || ''
      });

      // Si estamos editando, cargar el estudiante específico
      if (enrollment.studentPublicId) {
        studentsApi.getById(enrollment.studentPublicId)
          .then(student => {
            if (student) {
              setStudents([student]);
              setStudentSearchText(`${student.firstName} ${student.lastName}`);
            }
          })
          .catch(error => {
            console.error('Error loading student:', error);
          });
      }
    }
  }, [enrollment, reset]);

  const handleFormSubmit = (data: FormData) => {
    const submitData: Partial<Enrollment> = {
      ...data,
      isActive: true
    };

    if (enrollment) {
      submitData.id = enrollment.id;
      submitData.publicId = enrollment.publicId;
    }

    onSubmit(submitData);
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nueva Inscripción' : 
                mode === 'edit' ? 'Editar Inscripción' : 
                'Ver Inscripción';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          {enrollment && (
            <Chip 
              label={getStatusLabel(enrollment.status)} 
              color={getStatusColor(enrollment.status)}
              size="small"
            />
          )}
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {loading ? (
            <Typography>Cargando...</Typography>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Controller
                    name="studentPublicId"
                    control={control}
                    rules={{ required: 'El estudiante es obligatorio' }}
                    render={({ field: { onChange, value } }) => {
                      const selectedStudent = students.find(s => s.id === value) || null;
                      
                      return (
                        <Autocomplete
                          sx={{ flex: 1, minWidth: 200 }}
                          options={students}
                          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                          loading={studentLoading}
                          onInputChange={(_, newInputValue) => {
                            setStudentSearchText(newInputValue);
                            searchStudents(newInputValue);
                          }}
                          onChange={(_, newValue) => {
                            onChange(newValue?.id || '');
                            // Asegurar que el estudiante seleccionado esté en la lista
                            if (newValue) {
                              if (!students.find(s => s.id === newValue.id)) {
                                setStudents(prev => [...prev, newValue]);
                              }
                            }
                          }}
                          value={selectedStudent}
                          disabled={isReadOnly}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Estudiante"
                              error={!!errors.studentPublicId}
                              helperText={errors.studentPublicId?.message}
                              placeholder="Buscar estudiante por nombre..."
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              <Box>
                                <Typography variant="body1">
                                  {option.firstName} {option.lastName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {option.grade} {option.section} - {option.email}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          noOptionsText="No se encontraron estudiantes"
                          loadingText="Buscando estudiantes..."
                          isOptionEqualToValue={(option, value) => option.id === value?.id}
                        />
                      );
                    }}
                  />

                  <Controller
                    name="groupId"
                    control={control}
                    rules={{ required: 'El grupo es obligatorio', min: { value: 1, message: 'Seleccione un grupo' } }}
                    render={({ field }) => (
                      <FormControl 
                        sx={{ flex: 1, minWidth: 200 }} 
                        error={!!errors.groupId} 
                        disabled={isReadOnly}
                      >
                        <InputLabel>Grupo</InputLabel>
                        <Select {...field} label="Grupo">
                          {grades.map((grade) => 
                            grade.sections.map((section, index) => (
                              <MenuItem key={`${grade.id}-${index}`} value={parseInt(grade.id) * 10 + index + 1}>
                                {grade.name} {section}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {errors.groupId && (
                          <Typography variant="caption" color="error">
                            {errors.groupId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Controller
                    name="enrollmentDate"
                    control={control}
                    rules={{ required: 'La fecha de inscripción es obligatoria' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Fecha de Inscripción"
                        type="date"
                        sx={{ flex: 1, minWidth: 200 }}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.enrollmentDate}
                        helperText={errors.enrollmentDate?.message}
                        disabled={isReadOnly}
                      />
                    )}
                  />

                  <Controller
                    name="academicYear"
                    control={control}
                    rules={{ required: 'El año académico es obligatorio' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Año Académico"
                        sx={{ flex: 1, minWidth: 200 }}
                        placeholder="2024-2025"
                        error={!!errors.academicYear}
                        helperText={errors.academicYear?.message}
                        disabled={isReadOnly}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Controller
                    name="enrollmentFee"
                    control={control}
                    rules={{ 
                      required: 'La cuota de inscripción es obligatoria',
                      min: { value: 0.01, message: 'La cuota debe ser mayor a 0' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cuota de Inscripción"
                        type="number"
                        sx={{ flex: 1, minWidth: 200 }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        error={!!errors.enrollmentFee}
                        helperText={errors.enrollmentFee?.message}
                        disabled={isReadOnly}
                      />
                    )}
                  />

                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl 
                        sx={{ flex: 1, minWidth: 200 }} 
                        disabled={isReadOnly || mode === 'create'}
                      >
                        <InputLabel>Estado</InputLabel>
                        <Select {...field} label="Estado">
                          <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                          <MenuItem value="CONFIRMADA">Confirmada</MenuItem>
                          <MenuItem value="COMPLETADA">Completada</MenuItem>
                          <MenuItem value="CANCELADA">Cancelada</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>

                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notas"
                      multiline
                      rows={3}
                      fullWidth
                      placeholder="Observaciones adicionales sobre la inscripción..."
                      disabled={isReadOnly}
                    />
                  )}
                />

                {enrollment && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>ID:</strong> {enrollment.publicId}
                    </Typography>
                    {enrollment.studentFullName && (
                      <Typography variant="body2" color="textSecondary">
                        <strong>Estudiante:</strong> {enrollment.studentFullName}
                      </Typography>
                    )}
                    {enrollment.groupFullName && (
                      <Typography variant="body2" color="textSecondary">
                        <strong>Grupo:</strong> {enrollment.groupFullName}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            {mode === 'view' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting || loading}
            >
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
