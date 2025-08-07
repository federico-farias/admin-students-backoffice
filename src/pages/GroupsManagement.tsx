import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  List as ListIcon
} from '@mui/icons-material';
import { GroupSearch } from '../components/GroupSearch';
import { Groups as GroupsList } from './Groups';
import type { Group } from '../types/group';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const GroupsManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'delete' | 'create'>('view');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGroupView = (group: Group) => {
    setSelectedGroup(group);
    setDialogType('view');
    setDialogOpen(true);
  };

  const handleGroupEdit = (group: Group) => {
    setSelectedGroup(group);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleGroupDelete = (group: Group) => {
    setSelectedGroup(group);
    setDialogType('delete');
    setDialogOpen(true);
  };

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setDialogType('create');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedGroup(null);
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Grupos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los grupos académicos con herramientas de búsqueda y filtrado avanzadas
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Gestión de grupos">
            <Tab 
              label="Búsqueda Avanzada" 
              icon={<SearchIcon />} 
              iconPosition="start"
              id="tab-0"
              aria-controls="simple-tabpanel-0"
            />
            <Tab 
              label="Lista Completa" 
              icon={<ListIcon />} 
              iconPosition="start"
              id="tab-1"
              aria-controls="simple-tabpanel-1"
            />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <GroupSearch 
            onGroupView={handleGroupView}
            onGroupEdit={handleGroupEdit}
            onGroupDelete={handleGroupDelete}
            onCreateGroup={handleCreateGroup}
            showManagementActions={true}
            showCreateButton={true}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <GroupsList />
        </TabPanel>
      </Paper>

      {/* Simple Dialog para mostrar info del grupo */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'view' && 'Detalles del Grupo'}
          {dialogType === 'edit' && 'Editar Grupo'}
          {dialogType === 'delete' && 'Eliminar Grupo'}
          {dialogType === 'create' && 'Crear Nuevo Grupo'}
        </DialogTitle>
        <DialogContent>
          {selectedGroup ? (
            <Box>
              <Typography><strong>ID:</strong> {selectedGroup.id}</Typography>
              <Typography><strong>Nivel Académico:</strong> {selectedGroup.academicLevel}</Typography>
              <Typography><strong>Grado:</strong> {selectedGroup.grade}</Typography>
              <Typography><strong>Nombre:</strong> {selectedGroup.name}</Typography>
              <Typography><strong>Año Académico:</strong> {selectedGroup.academicYear}</Typography>
              <Typography><strong>Estudiantes:</strong> {selectedGroup.studentsCount}/{selectedGroup.maxStudents}</Typography>
              <Typography><strong>Estado:</strong> {selectedGroup.isActive ? 'Activo' : 'Inactivo'}</Typography>
              
              {dialogType === 'delete' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  ¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.
                </Alert>
              )}
            </Box>
          ) : (
            <Typography>
              {dialogType === 'create' && 'Aquí irá el formulario para crear un nuevo grupo.'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogType === 'delete' ? 'Cancelar' : 'Cerrar'}
          </Button>
          {dialogType === 'delete' && (
            <Button color="error" variant="contained">
              Eliminar
            </Button>
          )}
          {dialogType === 'edit' && (
            <Button color="primary" variant="contained">
              Guardar
            </Button>
          )}
          {dialogType === 'create' && (
            <Button color="primary" variant="contained">
              Crear
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
