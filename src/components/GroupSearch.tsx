import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
  TableSortLabel,
  Collapse,
  IconButton,
  Alert,
  Button,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import type { Group } from '../types/group';
import {
  searchGroups,
  type GroupFilters,
  type PaginationParams,
  type PaginatedResponse
} from '../services/groupsApi';

interface GroupSearchProps {
  onGroupSelect?: (group: Group) => void;
  onGroupEdit?: (group: Group) => void;
  onGroupDelete?: (group: Group) => void;
  onGroupView?: (group: Group) => void;
  showSelectAction?: boolean;
  showManagementActions?: boolean;
  showCreateButton?: boolean;
  onCreateGroup?: () => void;
}

export const GroupSearch: React.FC<GroupSearchProps> = ({
  onGroupSelect,
  onGroupEdit,
  onGroupDelete,
  onGroupView,
  showSelectAction = false,
  showManagementActions = true,
  showCreateButton = true,
  onCreateGroup
}) => {
  // Estados para filtros
  const [filters, setFilters] = useState<GroupFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para paginación y ordenamiento
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Estados para datos y carga
  const [data, setData] = useState<PaginatedResponse<Group> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para buscar grupos
  const searchGroupsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pagination: PaginationParams = {
        page,
        size,
        sortBy,
        sortDir
      };
      
      const result = await searchGroups(filters, pagination);
      setData(result);
    } catch (err) {
      setError('Error al buscar grupos. Por favor, intenta nuevamente.');
      console.error('Error searching groups:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, size, sortBy, sortDir]);

  // Efecto para buscar cuando cambien los filtros
  useEffect(() => {
    searchGroupsData();
  }, [searchGroupsData]);

  // Manejadores de eventos
  const handleFilterChange = (key: keyof GroupFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
    setPage(0); // Resetear a la primera página
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property: string) => {
    const isAsc = sortBy === property && sortDir === 'asc';
    setSortDir(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  return (
    <Box>
      {/* Header con título y botón crear */}
      {showCreateButton && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Búsqueda de Grupos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateGroup}
          >
            Nuevo Grupo
          </Button>
        </Box>
      )}

      {/* Barra de búsqueda principal */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
          <Box flex={1}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, grado o año académico..."
              value={filters.searchText || ''}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.availableOnly || false}
                  onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                />
              }
              label="Solo con cupos disponibles"
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
            >
              <FilterIcon />
              {getActiveFiltersCount() > 0 && (
                <Chip
                  size="small"
                  label={getActiveFiltersCount()}
                  color="primary"
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
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Nivel Académico</InputLabel>
              <Select
                value={filters.academicLevel || ''}
                onChange={(e) => handleFilterChange('academicLevel', e.target.value)}
                label="Nivel Académico"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Maternal">Maternal</MenuItem>
                <MenuItem value="Preescolar">Preescolar</MenuItem>
                <MenuItem value="Primaria">Primaria</MenuItem>
                <MenuItem value="Secundaria">Secundaria</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Grado"
              value={filters.grade || ''}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              placeholder="Ej: Primero, Segundo..."
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Nombre del Grupo"
              value={filters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Ej: A, B, C..."
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="Año Académico"
              value={filters.academicYear || ''}
              onChange={(e) => handleFilterChange('academicYear', e.target.value)}
              placeholder="Ej: 2024-2025"
              sx={{ minWidth: 150 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
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
                <MenuItem value="true">Activos</MenuItem>
                <MenuItem value="false">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
              onClick={clearFilters}
            >
              Limpiar filtros
            </Typography>
          </Box>
        </Paper>
      </Collapse>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla de resultados */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'academicLevel'}
                    direction={sortBy === 'academicLevel' ? sortDir : 'asc'}
                    onClick={() => handleSort('academicLevel')}
                  >
                    Nivel
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'grade'}
                    direction={sortBy === 'grade' ? sortDir : 'asc'}
                    onClick={() => handleSort('grade')}
                  >
                    Grado
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? sortDir : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'academicYear'}
                    direction={sortBy === 'academicYear' ? sortDir : 'asc'}
                    onClick={() => handleSort('academicYear')}
                  >
                    Año Académico
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Estudiantes</TableCell>
                <TableCell align="center">Estado</TableCell>
                {(showSelectAction || showManagementActions) && (
                  <TableCell align="center">Acciones</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showSelectAction || showManagementActions ? 7 : 6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data?.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showSelectAction || showManagementActions ? 7 : 6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron grupos
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.content.map((group) => (
                  <TableRow key={group.id} hover>
                    <TableCell className="capitalize">
                      {group.academicLevel}
                    </TableCell>
                    <TableCell className="capitalize">
                      {group.grade}
                    </TableCell>
                    <TableCell className="capitalize">
                      {group.name}
                    </TableCell>
                    <TableCell>{group.academicYear}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Typography variant="body2">
                          {group.studentsCount}/{group.maxStudents}
                        </Typography>
                        {group.studentsCount >= group.maxStudents && (
                          <Chip
                            label="Lleno"
                            size="small"
                            color="warning"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={group.isActive ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={group.isActive ? 'success' : 'default'}
                        variant={group.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    {(showSelectAction || showManagementActions) && (
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          {showSelectAction && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => onGroupSelect?.(group)}
                            >
                              Seleccionar
                            </Button>
                          )}
                          {showManagementActions && (
                            <>
                              <Tooltip title="Ver detalles">
                                <IconButton 
                                  size="small"
                                  onClick={() => onGroupView?.(group)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton 
                                  size="small"
                                  onClick={() => onGroupEdit?.(group)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => onGroupDelete?.(group)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Paginación */}
        {data && (
          <TablePagination
            component="div"
            count={data.totalElements}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={size}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        )}
      </Paper>
    </Box>
  );
};
