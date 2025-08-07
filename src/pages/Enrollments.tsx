import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import EnrollmentSearch from '../components/EnrollmentSearch';
import EnrollmentForm from '../components/EnrollmentForm';
import type { Enrollment } from '../types';
import { enrollmentsApi } from '../services/api';

export default function Enrollments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateClick = () => {
    setSelectedEnrollment(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleView = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEnrollment(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedEnrollment(null);
    setRefreshTrigger(prev => prev + 1);
    
    const action = formMode === 'create' ? 'creada' : 'actualizada';
    setSuccessMessage(`Inscripción ${action} exitosamente`);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleStatusChange = async (enrollmentId: string, action: 'confirm' | 'cancel' | 'complete') => {
    try {
      switch (action) {
        case 'confirm':
          await enrollmentsApi.confirm(enrollmentId);
          setSuccessMessage('Inscripción confirmada exitosamente');
          break;
        case 'cancel':
          await enrollmentsApi.cancel(enrollmentId);
          setSuccessMessage('Inscripción cancelada exitosamente');
          break;
        case 'complete':
          await enrollmentsApi.complete(enrollmentId);
          setSuccessMessage('Inscripción completada exitosamente');
          break;
        default:
          throw new Error('Acción no válida');
      }
      
      setRefreshTrigger(prev => prev + 1);
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      setErrorMessage('Error al actualizar el estado de la inscripción');
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Encabezado */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h4" component="h1">
            Inscripciones
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            size="large"
          >
            Nueva Inscripción
          </Button>
        </Box>

        {/* Mensajes de estado */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* Búsqueda y lista de inscripciones */}
        <EnrollmentSearch
          onEdit={handleEdit}
          onView={handleView}
          onStatusChange={handleStatusChange}
          refreshTrigger={refreshTrigger}
        />

        {/* Formulario de inscripción */}
        <EnrollmentForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          enrollment={selectedEnrollment || undefined}
          mode={formMode}
        />
      </Box>
    </Container>
  );
}
