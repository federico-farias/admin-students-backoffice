import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  DialogContentText
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { groupsApi } from '../services/groupsApi';
import type { Group } from '../types/group';

const academicLevels = ['Maternal', 'Preescolar', 'Primaria', 'Secundaria'];
const gradesByLevel: Record<string, string[]> = {
  Maternal: ['Primero', 'Segundo'],
  Preescolar: ['Primero', 'Segundo', 'Tercero'],
  Primaria: ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto'],
  Secundaria: ['Primero', 'Segundo', 'Tercero']
};

// Generar años académicos (actual y algunos anteriores/posteriores)
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

export const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [editing, setEditing] = useState<Group | null>(null);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<Omit<Group, 'id' | 'studentsCount'>>({
    academicLevel: 'Maternal',
    grade: '',
    name: '',
    maxStudents: 10,
    academicYear: academicYears[2] // Año actual (índice 2 en el array)
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await groupsApi.getAll();
      setGroups(data);
    } catch (err) {
      setError('Error al cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (group?: Group) => {
    if (group) {
      setEditing(group);
      setForm({
        academicLevel: group.academicLevel,
        grade: group.grade,
        name: group.name,
        maxStudents: group.maxStudents,
        academicYear: group.academicYear
      });
    } else {
      setEditing(null);
      setForm({ academicLevel: 'Maternal', grade: '', name: '', maxStudents: 10, academicYear: academicYears[2] });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setError('');
    setForm({ academicLevel: 'Maternal', grade: '', name: '', maxStudents: 10, academicYear: academicYears[2] });
  };

  const handleChange = (field: keyof typeof form) => (e: any) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (field === 'academicLevel') setForm(prev => ({ ...prev, grade: '' }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validaciones
      if (!form.academicLevel || !form.grade || !form.name || !form.academicYear) {
        setError('Todos los campos son obligatorios');
        return;
      }

      if (form.maxStudents < 1 || form.maxStudents > 99) {
        setError('El cupo máximo debe estar entre 1 y 99');
        return;
      }

      // Verificar si ya existe un grupo con la misma combinación
      const existingGroup = groups.find(g => 
        g.academicLevel === form.academicLevel && 
        g.grade === form.grade && 
        g.name.toLowerCase() === form.name.toLowerCase() &&
        g.academicYear === form.academicYear &&
        (!editing || g.id !== editing.id)
      );

      if (existingGroup) {
        setError(`Ya existe un grupo ${form.name} para ${form.academicLevel} ${form.grade} en el ciclo ${form.academicYear}`);
        return;
      }

      setLoading(true);
      
      if (editing) {
        await groupsApi.update(editing.id, form);
      } else {
        await groupsApi.create(form);
      }
      
      await fetchGroups();
      handleClose();
    } catch (err) {
      setError('Error al guardar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (group: Group) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setGroupToDelete(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (groupToDelete) {
      try {
        setError('');
        await groupsApi.delete(groupToDelete.id);
        await fetchGroups();
        closeDeleteDialog();
      } catch (err) {
        setError('Error al eliminar el grupo');
      }
    }
  };

  const getCapacityColor = (group: Group) => {
    const percentage = (group.studentsCount / group.maxStudents) * 100;
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  const getCapacityText = (group: Group) => {
    const percentage = (group.studentsCount / group.maxStudents) * 100;
    if (percentage >= 100) return 'Lleno';
    if (percentage >= 80) return 'Casi lleno';
    return 'Disponible';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Gestión de Grupos</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          disabled={loading}
        >
          Nuevo Grupo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ciclo Escolar</TableCell>
            <TableCell>Nivel</TableCell>
            <TableCell>Grado</TableCell>
            <TableCell>Grupo</TableCell>
            <TableCell>Cupo Máximo</TableCell>
            <TableCell>Alumnos</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map(group => (
            <TableRow key={group.id}>
              <TableCell>
                <Typography variant="body2" color="primary">
                  {group.academicYear}
                </Typography>
              </TableCell>
              <TableCell className={'capitalize'}>{group.academicLevel}</TableCell>
              <TableCell className="capitalize">{group.grade}</TableCell>
              <TableCell>
                <Typography variant="h6" component="span">
                  {group.name}
                </Typography>
              </TableCell>
              <TableCell>{group.maxStudents}</TableCell>
              <TableCell>
                <Typography variant="body2">
                  {group.studentsCount}/{group.maxStudents}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getCapacityText(group)}
                  color={getCapacityColor(group)}
                  variant="outlined"
                  size="small"
                  icon={group.studentsCount >= group.maxStudents ? <WarningIcon /> : undefined}
                />
              </TableCell>
              <TableCell>
                <Tooltip title="Editar grupo">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpen(group)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar grupo">
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => openDeleteDialog(group)}
                    disabled={loading || group.studentsCount > 0}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {groups.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body2" color="text.secondary">
                  No hay grupos registrados
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Dialog para crear/editar grupo */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Grupo' : 'Nuevo Grupo'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350, pt: 2 }}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
          
          <FormControl style={{ margin: '8px 0' }} fullWidth>
            <InputLabel>Ciclo Escolar</InputLabel>
            <Select 
              value={form.academicYear} 
              label="Ciclo Escolar" 
              onChange={handleChange('academicYear')}
              disabled={loading}
            >
              {academicYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Nivel Académico</InputLabel>
            <Select 
              value={form.academicLevel} 
              label="Nivel Académico" 
              onChange={handleChange('academicLevel')}
              disabled={loading}
            >
              {academicLevels.map(level => (
                <MenuItem key={level} value={level} className="capitalize">
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth disabled={!form.academicLevel || loading}>
            <InputLabel>Grado</InputLabel>
            <Select 
              value={form.grade} 
              label="Grado" 
              onChange={handleChange('grade')}
            >
              {(gradesByLevel[form.academicLevel] || []).map(grade => (
                <MenuItem key={grade} value={grade} className="capitalize">
                  {grade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField 
            label="Nombre del Grupo (A, B, C...)" 
            value={form.name} 
            onChange={handleChange('name')}
            inputProps={{ 
              maxLength: 1, 
              style: { textTransform: 'uppercase' } 
            }}
            disabled={loading}
            helperText="Ingrese una letra para identificar el grupo"
          />
          
          <TextField 
            label="Cupo Máximo de Estudiantes" 
            type="number" 
            value={form.maxStudents} 
            onChange={handleChange('maxStudents')}
            inputProps={{ min: 1, max: 99 }}
            disabled={loading}
            helperText="Número máximo de estudiantes permitidos"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading || !form.academicLevel || !form.grade || !form.name || !form.academicYear}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {groupToDelete && groupToDelete.studentsCount > 0 ? (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Este grupo tiene {groupToDelete.studentsCount} estudiante(s) registrado(s).
                </Alert>
                No se puede eliminar un grupo que tiene estudiantes asignados. 
                Primero debe reasignar o eliminar a todos los estudiantes del grupo.
              </>
            ) : (
              <>
                ¿Está seguro que desea eliminar el grupo{' '}
                <strong>
                  <span className="capitalize">{groupToDelete?.academicLevel}</span>{' '}
                  <span className="capitalize">{groupToDelete?.grade}</span> - Grupo {groupToDelete?.name} 
                  ({groupToDelete?.academicYear})
                </strong>?
                <br />
                Esta acción no se puede deshacer.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>
            Cancelar
          </Button>
          {groupToDelete && groupToDelete.studentsCount === 0 && (
            <Button 
              onClick={confirmDelete} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
