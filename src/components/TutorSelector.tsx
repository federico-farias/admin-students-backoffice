import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { tutorsApi } from '../services/tutorsApi';
import type { Tutor } from '../types';

interface TutorFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  relationship: string;
  documentNumber: string;
}

interface TutorSelectorProps {
  selectedTutorIds: string[];
  onTutorIdsChange: (tutorIds: string[]) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export const TutorSelector: React.FC<TutorSelectorProps> = ({
  selectedTutorIds,
  onTutorIdsChange,
  label = "Tutores",
  required = false,
  disabled = false,
  error,
  helperText
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Tutor[]>([]);
  const [selectedTutors, setSelectedTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string>('');
  
  const [formData, setFormData] = useState<TutorFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    relationship: '',
    documentNumber: ''
  });
  
  const [formErrors, setFormErrors] = useState<Partial<TutorFormData>>({});

  // Cargar tutores seleccionados cuando cambian los IDs
  useEffect(() => {
    const loadSelectedTutors = async () => {
      if (selectedTutorIds.length === 0) {
        console.log('No tutor IDs, clearing selected tutors');
        setSelectedTutors([]);
        return;
      }

      // Verificar si ya tenemos todos los tutores necesarios
      const currentTutorIds = selectedTutors.map(t => t.id);
      const missingIds = selectedTutorIds.filter(id => !currentTutorIds.includes(id));
      const extraIds = currentTutorIds.filter(id => !selectedTutorIds.includes(id));
      
      // Si no hay cambios necesarios, no hacer nada
      if (missingIds.length === 0 && extraIds.length === 0) {
        console.log('Selected tutors already match, no need to reload');
        return;
      }

      try {        
        const tutors = await Promise.all(
          selectedTutorIds.map(async (id) => {
            // Si ya tenemos este tutor en el estado, no lo volvemos a cargar
            const existingTutor = selectedTutors.find(t => t.id === id);
            if (existingTutor) {
              console.log(`Using existing tutor for ID ${id}:`, existingTutor);
              return existingTutor;
            }
            
            const tutor = await tutorsApi.getById(id);
            return tutor;
          })
        );
        const validTutors = tutors.filter(Boolean) as Tutor[];
        setSelectedTutors(validTutors);
      } catch (error) {
        console.error('Error loading selected tutors:', error);
      }
    };

    loadSelectedTutors();
  }, [selectedTutorIds]); // Removemos selectedTutors de las dependencias para evitar loops

  // Función para buscar tutores
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await tutorsApi.search(query);
      // Filtrar tutores que ya están seleccionados
      const filteredResults = results.filter(
        tutor => !selectedTutorIds.includes(tutor.publicId)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching tutors:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un tutor de los resultados de búsqueda
  const handleSelectTutor = (tutor: Tutor) => {
    // Verificar que no esté ya seleccionado
    if (selectedTutorIds.includes(tutor.publicId)) {
      console.log('Tutor already selected, ignoring');
      return;
    }
    
    const newTutorIds = [...selectedTutorIds, tutor.publicId];
    
    // Actualizar inmediatamente el estado local
    setSelectedTutors(prev => {
      // Verificar que no esté ya en la lista local
      if (prev.find(t => t.publicId === tutor.publicId)) {
        console.log('Tutor already in local state, not adding again');
        return prev;
      }
      return [...prev, tutor];
    });
    
    // Notificar al componente padre
    onTutorIdsChange(newTutorIds);
    setSearchText('');
    setSearchResults([]);
  };

  // Remover un tutor seleccionado
  const handleRemoveTutor = (tutorId: string) => {
    const newTutorIds = selectedTutorIds.filter(id => id !== tutorId);
    
    // Actualizar inmediatamente el estado local
    setSelectedTutors(prev => prev.filter(tutor => tutor.publicId !== tutorId));

    // Notificar al componente padre
    onTutorIdsChange(newTutorIds);
  };

  // Abrir dialog para crear nuevo tutor
  const handleOpenCreateDialog = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      relationship: '',
      documentNumber: ''
    });
    setFormErrors({});
    setCreateError('');
    setCreateDialogOpen(true);
  };

  // Cerrar dialog de creación
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreateError('');
  };

  // Validar formulario de nuevo tutor
  const validateTutorForm = (): boolean => {
    const newErrors: Partial<TutorFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!formData.relationship) newErrors.relationship = 'El parentesco es obligatorio';

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Crear nuevo tutor
  const handleCreateTutor = async () => {
    if (!validateTutorForm()) return;

    try {
      setCreateLoading(true);
      setCreateError('');

      const tutorData: Omit<Tutor, 'id' | 'createdAt' | 'updatedAt' | 'publicId'> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        address: formData.address.trim() || undefined,
        relationship: formData.relationship,
        documentNumber: formData.documentNumber.trim() || undefined,
        isActive: true
      };

      const newTutor = await tutorsApi.create(tutorData);
      console.log('Created new tutor:', newTutor);
      
      // Actualizar inmediatamente el estado local
      setSelectedTutors(prev => {
        // Verificar que no esté ya en la lista
        if (prev.find(t => t.publicId === newTutor.publicId)) {
          console.log('New tutor already in local state, not adding again');
          return prev;
        }
        return [...prev, newTutor];
      });
      
      // Agregar el nuevo tutor a la selección
      const newTutorIds = [...selectedTutorIds, newTutor.publicId];
      console.log('New tutor IDs after creation:', newTutorIds);
      onTutorIdsChange(newTutorIds);
      
      handleCloseCreateDialog();
    } catch (err) {
      console.error('Error creating tutor:', err);
      setCreateError('Error al crear el tutor. Por favor, intenta nuevamente.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Manejar cambios en el input de formulario
  const handleInputChange = (field: keyof TutorFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value as string
    }));
    
    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Box>
      {/* Label del componente */}
      <Typography variant="h6" gutterBottom color="primary">
        {label} {required && '*'}
      </Typography>

      {/* Tutores seleccionados */}
      {selectedTutors.length > 0 && (
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tutores seleccionados:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {selectedTutors.map((tutor) => (
              <Chip
                key={tutor.publicId}
                icon={<PersonIcon />}
                label={`${tutor.firstName} ${tutor.lastName} (${tutor.relationship})`}
                onDelete={disabled ? undefined : () => handleRemoveTutor(tutor.publicId)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Campo de búsqueda */}
      <Box display="flex" gap={2} alignItems="flex-start">
        <Autocomplete
          sx={{ flexGrow: 1 }}
          freeSolo
          options={searchResults}
          getOptionLabel={(option) => 
            typeof option === 'string' 
              ? option 
              : `${option.firstName} ${option.lastName} (${option.relationship}) - ${option.phone}`
          }
          renderOption={(props, option) => (
            <Box component="li" {...props} onClick={() => handleSelectTutor(option)}>
              <Box>
                <Typography variant="body1">
                  {option.firstName} {option.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.relationship} • {option.phone}
                  {option.email && ` • ${option.email}`}
                </Typography>
              </Box>
            </Box>
          )}
          inputValue={searchText}
          onInputChange={(_, newValue) => {
            setSearchText(newValue);
            handleSearch(newValue);
          }}
          loading={loading}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar tutor por nombre, teléfono o documento"
              placeholder="Escribe para buscar..."
              helperText={
                searchText && searchResults.length === 0 && !loading
                  ? "No se encontraron tutores. Puedes crear uno nuevo."
                  : helperText || (error ? ' ' : undefined)
              }
              error={!!error}
            />
          )}
          noOptionsText={
            searchText ? (
              <Box textAlign="center" py={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No se encontraron tutores
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateDialog}
                >
                  Crear nuevo tutor
                </Button>
              </Box>
            ) : (
              "Escribe para buscar tutores"
            )
          }
        />

        {/* Botón para crear nuevo tutor */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          disabled={disabled}
          sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
        >
          Nuevo Tutor
        </Button>
      </Box>

      {/* Mensaje de error */}
      {error && (
        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}

      {/* Dialog para crear nuevo tutor */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Tutor</DialogTitle>
        <DialogContent dividers>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Nombre"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Apellido"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Teléfono"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ flex: 1 }} error={!!formErrors.relationship}>
                <InputLabel>Parentesco</InputLabel>
                <Select
                  value={formData.relationship}
                  label="Parentesco"
                  onChange={handleInputChange('relationship')}
                >
                  <MenuItem value="Padre">Padre</MenuItem>
                  <MenuItem value="Madre">Madre</MenuItem>
                  <MenuItem value="Abuelo">Abuelo</MenuItem>
                  <MenuItem value="Abuela">Abuela</MenuItem>
                  <MenuItem value="Tío">Tío</MenuItem>
                  <MenuItem value="Tía">Tía</MenuItem>
                  <MenuItem value="Hermano">Hermano</MenuItem>
                  <MenuItem value="Hermana">Hermana</MenuItem>
                  <MenuItem value="Tutor Legal">Tutor Legal</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
                {formErrors.relationship && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {formErrors.relationship}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <TextField
              label="Email (Opcional)"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />

            <TextField
              label="Número de Documento (Opcional)"
              value={formData.documentNumber}
              onChange={handleInputChange('documentNumber')}
              error={!!formErrors.documentNumber}
              helperText={formErrors.documentNumber}
            />

            <TextField
              label="Dirección (Opcional)"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleInputChange('address')}
              error={!!formErrors.address}
              helperText={formErrors.address}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseCreateDialog} disabled={createLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateTutor}
            variant="contained"
            disabled={createLoading}
          >
            {createLoading ? 'Creando...' : 'Crear Tutor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
