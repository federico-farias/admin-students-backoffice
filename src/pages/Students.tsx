import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import { StudentSearch } from '../components/StudentSearch';
import { StudentForm } from '../components/StudentForm';
import { studentsApi } from '../services/api';
import type { Student } from '../types';

export const Students: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'create'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStudentView = (student: Student) => {
    setSelectedStudent(student);
    setFormMode('view');
    setFormDialogOpen(true);
  };

  const handleStudentEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormMode('edit');
    setFormDialogOpen(true);
  };

  const handleStudentDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleCreateStudent = () => {
    setSelectedStudent(null);
    setFormMode('create');
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedStudent(null);
    setError('');
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedStudent(null);
    setError('');
  };

  const handleFormSuccess = () => {
    handleRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      setError('');
      await studentsApi.delete(selectedStudent.id);
      handleCloseDeleteDialog();
      handleRefresh();
    } catch (err) {
      setError('Error al eliminar el estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Estudiantes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los estudiantes con herramientas de búsqueda y filtrado avanzadas
        </Typography>
      </Box>

      <StudentSearch 
        key={refreshKey}
        onStudentView={handleStudentView}
        onStudentEdit={handleStudentEdit}
        onStudentDelete={handleStudentDelete}
        onCreateStudent={handleCreateStudent}
        showManagementActions={true}
        showCreateButton={true}
      />

      {/* Formulario para crear/editar/ver estudiantes */}
      <StudentForm
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSuccess={handleFormSuccess}
        student={selectedStudent}
        mode={formMode}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar Estudiante</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {selectedStudent && (
            <Box>
              <Typography>
                ¿Estás seguro de que quieres eliminar al estudiante <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>?
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                Esta acción no se puede deshacer. Todos los datos relacionados con este estudiante se perderán.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
