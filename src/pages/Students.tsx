import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { studentsApi } from '../services/api';
import { getFullName, getInitials, getAge, formatDate, generateId } from '../utils/formatters';
import { StudentForm } from '../components/StudentForm';
import type { Student } from '../types';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (err) {
      setError('Error al cargar los estudiantes');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      await studentsApi.delete(selectedStudent.id);
      setStudents(students.filter(s => s.id !== selectedStudent.id));
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
    } catch (err) {
      setError('Error al eliminar el estudiante');
      console.error('Error deleting student:', err);
    }
  };

  const handleCreateStudent = async (studentData: Omit<Student, 'id' | 'enrollmentDate' | 'isActive'>) => {
    try {
      setFormLoading(true);
      const newStudent = await studentsApi.create({
        ...studentData,
        enrollmentDate: new Date().toISOString().split('T')[0],
        isActive: true
      });
      setStudents(prev => [...prev, newStudent]);
      setFormOpen(false);
    } catch (err) {
      setError('Error al crear el estudiante');
      console.error('Error creating student:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStudent = async (studentData: Omit<Student, 'id' | 'enrollmentDate' | 'isActive'>) => {
    if (!editingStudent) return;
    
    try {
      setFormLoading(true);
      const updatedStudent = await studentsApi.update(editingStudent.id, studentData);
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? updatedStudent : s));
      setFormOpen(false);
      setEditingStudent(null);
    } catch (err) {
      setError('Error al actualizar el estudiante');
      console.error('Error updating student:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const handleOpenEditForm = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingStudent(null);
    setFormLoading(false);
  };

  const filteredStudents = students.filter(student =>
    getFullName(student.firstName, student.lastName)
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Estudiantes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateForm}
        >
          Nuevo Estudiante
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Buscar estudiantes por nombre, grado o sección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Students Grid */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }}
        gap={3}
      >
        {filteredStudents.map((student) => (
          <Card key={student.id} sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getInitials(student.firstName, student.lastName)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" component="h3">
                    {getFullName(student.firstName, student.lastName)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.grade} - Sección {student.section}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEditForm(student)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedStudent(student);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Edad:</strong> {getAge(student.dateOfBirth)} años
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Padre/Tutor:</strong> {student.parentName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Teléfono:</strong> {student.parentPhone}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Fecha de inscripción:</strong> {formatDate(student.enrollmentDate)}
                </Typography>
              </Box>

              <Box display="flex" gap={1}>
                <Chip
                  label={student.isActive ? 'Activo' : 'Inactivo'}
                  color={student.isActive ? 'success' : 'default'}
                  size="small"
                />
                <Chip
                  label={`${student.grade} ${student.section}`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {filteredStudents.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando tu primer estudiante'
            }
          </Typography>
        </Box>
      )}

      {/* Student Form Dialog */}
      <StudentForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent}
        student={editingStudent}
        loading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar a{' '}
            <strong>
              {selectedStudent && getFullName(selectedStudent.firstName, selectedStudent.lastName)}
            </strong>
            ? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteStudent} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
