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
  Pagination,
  Stack,
  Divider,
  Badge,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Student } from '../types';
import {
  studentsApi,
  type StudentFilters,
  type PaginationParams,
  type PaginatedResponse
} from '../services/api';
import { getFullName, getInitials, getAge, formatDate } from '../utils/formatters';

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
                gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }}
                gap={3}
              >
                {data.content.map((student) => (
                  <Card key={student.id} sx={{ height: 'fit-content', position: 'relative' }}>
                    <CardContent sx={{ pt: 2, pb: 2 }}>
                      <Stack spacing={1}>
                        {/* Controles flotantes */}
                        {(showManagementActions || showSelectAction) && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(255,255,255,0.85)',
                              borderRadius: 3,
                              border: '1px solid #e0e0e0',
                              p: 1,
                              display: 'flex',
                              gap: 2,
                              zIndex: 10,
                              alignItems: 'center',
                              boxShadow: 0,
                            }}
                          >
                            {showManagementActions && (
                              <>
                                {onStudentView && (
                                  <Tooltip title="Ver detalles">
                                    <IconButton
                                      size="small"
                                      onClick={() => onStudentView(student)}
                                      sx={{ color: 'info.main', p: 1, transition: 'background 0.2s', '&:hover': { bgcolor: 'info.light', color: 'info.dark' } }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {onStudentEdit && (
                                  <Tooltip title="Editar">
                                    <IconButton
                                      size="small"
                                      onClick={() => onStudentEdit(student)}
                                      sx={{ color: 'warning.main', p: 1, transition: 'background 0.2s', '&:hover': { bgcolor: 'warning.light', color: 'warning.dark' } }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {onStudentDelete && (
                                  <Tooltip title="Eliminar">
                                    <IconButton
                                      size="small"
                                      onClick={() => onStudentDelete(student)}
                                      sx={{ color: 'error.main', p: 1, transition: 'background 0.2s', '&:hover': { bgcolor: 'error.light', color: 'error.dark' } }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                            {showSelectAction && onStudentSelect && (
                              <Tooltip title="Seleccionar estudiante">
                                <IconButton
                                  size="small"
                                  onClick={() => onStudentSelect(student)}
                                  sx={{ color: 'primary.main', p: 1, transition: 'background 0.2s', '&:hover': { bgcolor: 'primary.light', color: 'primary.dark' } }}
                                >
                                  <PersonIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                        {/* Bloque principal: Avatar, nombre y estado */}
                        <Stack direction="row" alignItems="flex-start" spacing={2}>
                          <Badge color={student.isActive ? 'success' : 'default'} variant="dot" overlap="circular">
                            <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 20 }}>
                              {getInitials(student.firstName, student.lastName)}
                            </Avatar>
                          </Badge>
                          <Box flex={1} minWidth={0}>
                            <Typography variant="h6" component="h3" noWrap sx={{ fontWeight: 700 }}>
                              {getFullName(student.firstName, student.lastName)}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 0.5 }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                                    {/* Icono de edad */}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#888" strokeWidth="2"/><path d="M16 2v4M8 2v4" stroke="#888" strokeWidth="2" strokeLinecap="round"/><path d="M3 10h18" stroke="#888" strokeWidth="2"/></svg>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 14 }}>
                                    <strong>Edad:</strong> {getAge(student.dateOfBirth)} años
                                  </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 14 }}>
                                    <strong>Registro:</strong> {formatDate(student.createdAt)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Stack>
                          </Box>
                        </Stack>
                        <Divider sx={{ my: 1, borderColor: 'grey.300' }} />
                        <Stack spacing={1}>
                          {/* Tutor principal */}
                          {student.tutors?.[0] && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: 15 }}>
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                                  {/* Icono de tutor */}
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="#888" strokeWidth="2"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke="#888" strokeWidth="2"/></svg>
                                </Box>
                                Tutor: {student.tutors[0].firstName} {student.tutors[0].lastName}
                              </Typography>
                              <Stack direction="row" spacing={2} sx={{ ml: 3 }}>
                                {student.tutors[0].relationship && (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
                                    Relación: {student.tutors[0].relationship}
                                  </Typography>
                                )}
                                {student.tutors[0].phone && (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
                                    Tel: {student.tutors[0].phone}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          )}
                          {/* Contacto de emergencia principal */}
                          {student.emergencyContacts?.[0] && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: 15 }}>
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                                  {/* Icono de emergencia */}
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#FF9800" strokeWidth="2"/><path d="M12 8v4" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#FF9800"/></svg>
                                </Box>
                                Contacto: {student.emergencyContacts[0].firstName} {student.emergencyContacts[0].lastName}
                              </Typography>
                              <Stack direction="row" spacing={2} sx={{ ml: 3 }}>
                                {student.emergencyContacts[0].phone && (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
                                    Tel: {student.emergencyContacts[0].phone}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Stack>
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
