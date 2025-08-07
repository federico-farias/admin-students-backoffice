import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Pagination,
  Alert,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  CheckCircle as ConfirmIcon,
  Cancel as CancelIcon,
  Done as CompleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { Enrollment, EnrollmentFilters, EnrollmentStatus } from '../types';
import { enrollmentsApi } from '../services/api';

interface EnrollmentSearchProps {
  onEdit: (enrollment: Enrollment) => void;
  onView: (enrollment: Enrollment) => void;
  onStatusChange: (enrollmentId: string, action: 'confirm' | 'cancel' | 'complete') => void;
  refreshTrigger?: number;
}

const statusColors: Record<EnrollmentStatus, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'info',
  COMPLETADA: 'success',
  CANCELADA: 'error',
};

const statusLabels: Record<EnrollmentStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

export default function EnrollmentSearch({ onEdit, onView, onStatusChange, refreshTrigger }: EnrollmentSearchProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EnrollmentFilters>({
    page: 1,
    limit: 12,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const loadEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Convertir página base-1 a base-0 para la API
      const apiFilters = {
        ...filters,
        searchText: filters.studentName || filters.searchText
      };
      
      const paginationParams = {
        page: (filters.page || 1) - 1, // Convertir de base-1 a base-0
        size: filters.limit || 12
      };
      
      const response = await enrollmentsApi.searchPaginated(apiFilters, paginationParams);
      setEnrollments(response.content);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalElements);
    } catch (err) {
      setError('Error al cargar las inscripciones');
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [filters, refreshTrigger]);

  const handleFilterChange = (key: keyof EnrollmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to first page when changing other filters
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
    });
  };

  const handleStatusAction = async (enrollment: Enrollment, action: 'confirm' | 'cancel' | 'complete') => {
    try {
      await onStatusChange(enrollment.publicId, action);
      loadEnrollments(); // Refresh the list
    } catch (error) {
      console.error('Error updating enrollment status:', error);
    }
  };

  const getAvailableActions = (status: EnrollmentStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return ['confirm', 'cancel'];
      case 'CONFIRMADA':
        return ['complete', 'cancel'];
      case 'COMPLETADA':
      case 'CANCELADA':
        return [];
      default:
        return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Buscar Inscripciones
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Buscar por estudiante"
                variant="outlined"
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
                value={filters.studentName || ''}
                onChange={(e) => handleFilterChange('studentName', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Nombre o apellido del estudiante"
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="CONFIRMADA">Confirmada</MenuItem>
                  <MenuItem value="COMPLETADA">Completada</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Año Académico"
                variant="outlined"
                size="small"
                sx={{ minWidth: 150 }}
                value={filters.academicYear || ''}
                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                placeholder="2024-2025"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                size="small"
              >
                Buscar
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                size="small"
              >
                Limpiar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Resultados */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Cargando inscripciones...</Typography>
      ) : (
        <>
          {/* Información de resultados */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              {totalItems > 0 
                ? `Mostrando ${enrollments.length} de ${totalItems} inscripciones`
                : 'No se encontraron inscripciones'
              }
            </Typography>
          </Box>

          {/* Lista de inscripciones */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {enrollments.map((enrollment) => (
              <Card key={enrollment.publicId} sx={{ 
                '&:hover': { 
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {enrollment.studentFullName || `Estudiante ${enrollment.studentPublicId}`}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        <Chip
                          label={statusLabels[enrollment.status]}
                          color={statusColors[enrollment.status]}
                          size="small"
                        />
                        <Typography variant="body2" color="textSecondary">
                          ID: {enrollment.publicId}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onView(enrollment)}
                        title="Ver detalles"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => onEdit(enrollment)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>

                      {/* Acciones de estado */}
                      {getAvailableActions(enrollment.status).map((action) => (
                        <IconButton
                          key={action}
                          size="small"
                          color={action === 'cancel' ? 'error' : 'success'}
                          onClick={() => handleStatusAction(enrollment, action as any)}
                          title={
                            action === 'confirm' ? 'Confirmar' :
                            action === 'cancel' ? 'Cancelar' :
                            action === 'complete' ? 'Completar' : action
                          }
                        >
                          {action === 'confirm' && <ConfirmIcon />}
                          {action === 'cancel' && <CancelIcon />}
                          {action === 'complete' && <CompleteIcon />}
                        </IconButton>
                      ))}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Grupo
                      </Typography>
                      <Typography variant="body2">
                        {enrollment.groupFullName || `Grupo ${enrollment.groupId}`}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Fecha de Inscripción
                      </Typography>
                      <Typography variant="body2">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString('es-CO')}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Año Académico
                      </Typography>
                      <Typography variant="body2">
                        {enrollment.academicYear}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Cuota
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(enrollment.enrollmentFee)}
                      </Typography>
                    </Box>
                  </Box>

                  {enrollment.notes && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        <strong>Notas:</strong> {enrollment.notes}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={filters.page || 1}
                onChange={(_, page) => handleFilterChange('page', page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
