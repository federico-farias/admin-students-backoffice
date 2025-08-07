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
import { GroupSearch } from '../components/GroupSearch';
import { GroupFormDialog } from '../components/GroupFormDialog';
import type { Group } from '../types/group';
import { groupsApi } from '../services/groupsApi';

export const GroupsManagement: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'create'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleGroupView = (group: Group) => {
    setSelectedGroup(group);
    setFormMode('view');
    setFormDialogOpen(true);
  };

  const handleGroupEdit = (group: Group) => {
    setSelectedGroup(group);
    setFormMode('edit');
    setFormDialogOpen(true);
  };

  const handleGroupDelete = (group: Group) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setFormMode('create');
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedGroup(null);
    setError('');
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedGroup(null);
    setError('');
  };

  const handleFormSuccess = () => {
    handleRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      setError('');
      await groupsApi.delete(selectedGroup.id);
      handleCloseDeleteDialog();
      handleRefresh();
    } catch (err) {
      setError('Error al eliminar el grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Grupos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los grupos académicos con herramientas de búsqueda y filtrado avanzadas
        </Typography>
      </Box>

      <GroupSearch 
        key={refreshKey}
        onGroupView={handleGroupView}
        onGroupEdit={handleGroupEdit}
        onGroupDelete={handleGroupDelete}
        onCreateGroup={handleCreateGroup}
        showManagementActions={true}
        showCreateButton={true}
      />

      {/* Formulario para crear/editar/ver grupos */}
      <GroupFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSuccess={handleFormSuccess}
        group={selectedGroup}
        mode={formMode}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar Grupo</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {selectedGroup && (
            <Box>
              <Typography>
                ¿Estás seguro de que quieres eliminar el grupo <strong>{selectedGroup.academicLevel} {selectedGroup.grade} - {selectedGroup.name}</strong>?
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                Esta acción no se puede deshacer. Todos los datos relacionados con este grupo se perderán.
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
