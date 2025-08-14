import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  Typography,
  CircularProgress,
  Collapse,
  IconButton,
  Alert,
  Button,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import type { Student } from '../types';
import {
  studentsApi,
  type StudentFilters,
  type PaginationParams,
  type PaginatedResponse
} from '../services/api';
import { getFullName, getInitials, getAge, formatDate } from '../utils/formatters';
import { EmergencyContactInfo } from './EmergencyContactInfo';
import { TutorInfo } from './TutorInfo';

interface StudentSearchProps {
  onStudentSelect?: (student: Student) => void;
  onStudentEdit?: (student: Student) => void;
  onStudentDelete?: (student: Student) => void;
  onStudentView?: (student: Student) => void;
  showSelectAction?: boolean;
  showManagementActions?: boolean;
  showCreateButton?: boolean;
  onCreateStudent?: () => void;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({
  onStudentSelect,
  onStudentEdit,
  onStudentDelete,
  onStudentView,
  showSelectAction = false,
  showManagementActions = true,
  showCreateButton = true,
  onCreateStudent
}) => {
  const [filters, setFilters] = useState<StudentFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 0,
    size: 10,
    sortBy: 'firstName',
    sortDir: 'asc'
  });
  const [data, setData] = useState<PaginatedResponse<Student> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Función para realizar la búsqueda
  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchFilters: StudentFilters = {
        ...filters,
        searchText: searchText.trim() || undefined
      };

      const result = await studentsApi.searchPaginated(searchFilters, pagination);
      setData(result);
    } catch (err) {
      console.error('Error al buscar estudiantes:', err);
      setError('Error al cargar los estudiantes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, searchText]);

  // Efecto para realizar búsqueda inicial y cuando cambian los filtros
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Manejar cambios en filtros
  const handleFilterChange = (key: keyof StudentFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset a la primera página
  };

  // Manejar búsqueda por texto
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 0 }));
    performSearch();
  };

  const handleSearchTextChange = (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setPagination(prev => ({ ...prev, page: 0 }));
    }
  };

  return (
    <Box>
      {/* Barra de búsqueda principal */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, apellido, email o nombre del padre..."
              value={searchText}
              onChange={(e) => handleSearchTextChange(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>
          
          {showCreateButton && onCreateStudent && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateStudent}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nuevo Estudiante
            </Button>
          )}
          
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              {loading && (
                <CircularProgress
                  size={20}
                  sx={{ ml: 0.5, minWidth: 20, height: 20 }}
                />
              )}
            </IconButton>
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            <Typography variant="body2">
              Filtros avanzados
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Filtros avanzados (colapsables) */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <TextField
              label="Grado"
              value={filters.grade || ''}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              placeholder="Ej: Primero, Segundo..."
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Sección"
              value={filters.section || ''}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              placeholder="Ej: A, B, C..."
              sx={{ minWidth: 120 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('isActive', value === '' ? undefined : value === 'true');
                }}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
      </Collapse>

      {/* Grid de tarjetas de estudiantes */}
      <Paper sx={{ width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={6}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Cargando estudiantes...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {data?.content && data.content.length > 0 ? (
              <Box 
                display="grid" 
                gridTemplateColumns={{ 
                  xs: '1fr', 
                  sm: '1fr 1fr', 
                  md: '1fr 1fr 1fr',
                  lg: '1fr 1fr 1fr 1fr'
                }}
                gap={3}
              >
                {data.content.map((student) => (
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
                        {(showManagementActions || showSelectAction) && (
                          <Box display="flex" gap={0.5}>
                            {showSelectAction && onStudentSelect && (
                              <Tooltip title="Seleccionar estudiante">
                                <IconButton
                                  size="small"
                                  onClick={() => onStudentSelect(student)}
                                  color="primary"
                                >
                                  <PersonIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {showManagementActions && (
                              <>
                                {onStudentView && (
                                  <Tooltip title="Ver detalles">
                                    <IconButton
                                      size="small"
                                      onClick={() => onStudentView(student)}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {onStudentEdit && (
                                  <Tooltip title="Editar estudiante">
                                    <IconButton
                                      size="small"
                                      onClick={() => onStudentEdit(student)}
                                      color="primary"
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {onStudentDelete && (
                                  <Tooltip title="Eliminar estudiante">
                                    <IconButton
                                      size="small"
                                      onClick={() => onStudentDelete(student)}
                                      color="error"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </Box>
                        )}
                      </Box>

                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Edad:</strong> {getAge(student.dateOfBirth)} años
                        </Typography>
                        {/* Renderiza el tutor si existe */}
                        <TutorInfo tutor={student.tutors?.[0]} />
                        {/* Renderiza el contacto de emergencia si existe */}
                        <EmergencyContactInfo contact={student.emergencyContacts?.[0]} />
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Fecha de registro:</strong> {formatDate(student.createdAt)}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1}>
                        <Chip
                          label={student.isActive ? 'Activo' : 'Inactivo'}
                          color={student.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={8}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No se encontraron estudiantes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intenta ajustar los filtros de búsqueda
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Paginación */}
        {data && data.totalElements > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {(data.number * data.size) + 1} - {Math.min((data.number + 1) * data.size, data.totalElements)} de {data.totalElements} estudiantes
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Por página</InputLabel>
                  <Select
                    value={pagination.size}
                    label="Por página"
                    onChange={(e) => setPagination(prev => ({ ...prev, size: Number(e.target.value), page: 0 }))}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
                
                <Pagination
                  count={data.totalPages}
                  page={data.number + 1}
                  onChange={(_event, page) => setPagination(prev => ({ ...prev, page: page - 1 }))}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
