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
  ContactPhone as ContactPhoneIcon
} from '@mui/icons-material';
import { emergencyContactsApi } from '../services/emergencyContactsApi';
import type { EmergencyContact } from '../types';

interface EmergencyContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  relationship: string;
  documentNumber: string;
}

interface EmergencyContactSelectorProps {
  selectedContactIds: string[];
  onContactIdsChange: (contactIds: string[]) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  maxContacts?: number;
}

export const EmergencyContactSelector: React.FC<EmergencyContactSelectorProps> = ({
  selectedContactIds,
  onContactIdsChange,
  label = "Contactos de Emergencia",
  required = false,
  disabled = false,
  error,
  helperText,
  maxContacts = 3
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<EmergencyContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string>('');
  
  // Estados para el diálogo de parentesco
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);
  const [selectedContactForRelationship, setSelectedContactForRelationship] = useState<EmergencyContact | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<string>('');
  
  const [formData, setFormData] = useState<EmergencyContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    relationship: '',
    documentNumber: ''
  });
  
  const [formErrors, setFormErrors] = useState<Partial<EmergencyContactFormData>>({});

  // Cargar contactos seleccionados cuando cambian los IDs
  useEffect(() => {
    const loadSelectedContacts = async () => {
      if (selectedContactIds.length === 0) {
        console.log('No contact IDs, clearing selected contacts');
        setSelectedContacts([]);
        return;
      }

      // Verificar si ya tenemos todos los contactos necesarios
      const currentContactIds = selectedContacts.map(c => c.publicId);
      const missingIds = selectedContactIds.filter(id => !currentContactIds.includes(id));
      const extraIds = currentContactIds.filter(id => !selectedContactIds.includes(id));
      
      // Si no hay cambios necesarios, no hacer nada
      if (missingIds.length === 0 && extraIds.length === 0) {
        console.log('Selected contacts already match, no need to reload');
        return;
      }

      try {        
        const contacts = await Promise.all(
          selectedContactIds.map(async (id) => {
            // Si ya tenemos este contacto en el estado, no lo volvemos a cargar
            const existingContact = selectedContacts.find(c => c.publicId === id);
            if (existingContact) {
              console.log(`Using existing contact for ID ${id}:`, existingContact);
              return existingContact;
            }
            
            const contact = await emergencyContactsApi.getById(id);
            return contact;
          })
        );
        const validContacts = contacts.filter(Boolean) as EmergencyContact[];
        setSelectedContacts(validContacts);
      } catch (error) {
        console.error('Error loading selected contacts:', error);
      }
    };

    loadSelectedContacts();
  }, [selectedContactIds]);

  // Función para buscar contactos
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await emergencyContactsApi.search(query);
      // Filtrar contactos que ya están seleccionados
      const filteredResults = results.filter(
        contact => !selectedContactIds.includes(contact.publicId)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching contacts:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un contacto de los resultados de búsqueda
  const handleSelectContact = (contact: EmergencyContact) => {
    // Verificar que no esté ya seleccionado
    if (selectedContactIds.includes(contact.publicId)) {
      console.log('Contact already selected, ignoring');
      return;
    }

    // Verificar límite máximo de contactos
    if (selectedContactIds.length >= maxContacts) {
      console.log(`Maximum contacts limit reached (${maxContacts})`);
      return;
    }
    
    // Abrir diálogo para seleccionar parentesco
    setSelectedContactForRelationship(contact);
    setSelectedRelationship('');
    setRelationshipDialogOpen(true);
    setSearchText('');
    setSearchResults([]);
  };

  // Remover un contacto seleccionado
  const handleRemoveContact = (contactId: string) => {
    const newContactIds = selectedContactIds.filter(id => id !== contactId);
    
    // Actualizar inmediatamente el estado local
    setSelectedContacts(prev => prev.filter(contact => contact.publicId !== contactId));

    // Notificar al componente padre
    onContactIdsChange(newContactIds);
  };

  // Abrir dialog para crear nuevo contacto
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

  // Manejar confirmación de parentesco
  const handleConfirmRelationship = () => {
    if (!selectedContactForRelationship || !selectedRelationship) return;
    
    // Crear el contacto con el parentesco seleccionado
    const contactWithRelationship = {
      ...selectedContactForRelationship,
      relationship: selectedRelationship
    };
    
    const newContactIds = [...selectedContactIds, selectedContactForRelationship.publicId];
    
    // Actualizar inmediatamente el estado local
    setSelectedContacts(prev => {
      // Verificar que no esté ya en la lista local
      if (prev.find(c => c.publicId === selectedContactForRelationship.publicId)) {
        console.log('Contact already in local state, not adding again');
        return prev;
      }
      return [...prev, contactWithRelationship];
    });
    
    // Notificar al componente padre
    onContactIdsChange(newContactIds);
    
    // Cerrar diálogo
    setRelationshipDialogOpen(false);
    setSelectedContactForRelationship(null);
    setSelectedRelationship('');
  };

  // Cerrar diálogo de parentesco
  const handleCloseRelationshipDialog = () => {
    setRelationshipDialogOpen(false);
    setSelectedContactForRelationship(null);
    setSelectedRelationship('');
  };

  // Validar formulario de nuevo contacto
  const validateContactForm = (): boolean => {
    const newErrors: Partial<EmergencyContactFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!formData.relationship) newErrors.relationship = 'La relación es obligatoria';

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Crear nuevo contacto
  const handleCreateContact = async () => {
    if (!validateContactForm()) return;

    // Verificar límite máximo de contactos
    if (selectedContactIds.length >= maxContacts) {
      setCreateError(`No puedes agregar más de ${maxContacts} contactos de emergencia.`);
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError('');

      const contactData: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt' | 'publicId'> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        address: formData.address.trim() || undefined,
        relationship: formData.relationship,
        documentNumber: formData.documentNumber.trim() || undefined,
        isActive: true
      };

      const newContact = await emergencyContactsApi.create(contactData);
      console.log('Created new contact:', newContact);
      
      // Actualizar inmediatamente el estado local
      setSelectedContacts(prev => {
        // Verificar que no esté ya en la lista
        if (prev.find(c => c.publicId === newContact.publicId)) {
          console.log('New contact already in local state, not adding again');
          return prev;
        }
        return [...prev, newContact];
      });
      
      // Agregar el nuevo contacto a la selección
      const newContactIds = [...selectedContactIds, newContact.publicId];
      console.log('New contact IDs after creation:', newContactIds);
      onContactIdsChange(newContactIds);
      
      handleCloseCreateDialog();
    } catch (err) {
      console.error('Error creating contact:', err);
      setCreateError('Error al crear el contacto. Por favor, intenta nuevamente.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Manejar cambios en el input de formulario
  const handleInputChange = (field: keyof EmergencyContactFormData) => (
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

  const isMaxContactsReached = selectedContactIds.length >= maxContacts;

  return (
    <Box>
      {/* Label del componente */}
      <Typography variant="h6" gutterBottom color="primary">
        {label} {required && '*'}
      </Typography>

      {/* Contactos seleccionados */}
      {selectedContacts.length > 0 && (
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Contactos seleccionados ({selectedContacts.length}/{maxContacts}):
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {selectedContacts.map((contact) => (
              <Chip
                key={contact.publicId}
                icon={<ContactPhoneIcon />}
                label={`${contact.firstName} ${contact.lastName} (${contact.relationship})`}
                onDelete={disabled ? undefined : () => handleRemoveContact(contact.publicId)}
                color="secondary"
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
            <Box component="li" {...props} onClick={() => handleSelectContact(option)}>
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
          disabled={disabled || isMaxContactsReached}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar contacto por nombre, teléfono o documento"
              placeholder={isMaxContactsReached ? "Límite máximo alcanzado" : "Escribe para buscar..."}
              helperText={
                isMaxContactsReached 
                  ? `Máximo ${maxContacts} contactos permitidos`
                  : searchText && searchResults.length === 0 && !loading
                  ? "No se encontraron contactos. Puedes crear uno nuevo."
                  : helperText || (error ? ' ' : undefined)
              }
              error={!!error}
            />
          )}
          noOptionsText={
            searchText ? (
              <Box textAlign="center" py={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No se encontraron contactos
                </Typography>
                {!isMaxContactsReached && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                  >
                    Crear nuevo contacto
                  </Button>
                )}
              </Box>
            ) : (
              "Escribe para buscar contactos"
            )
          }
        />

        {/* Botón para crear nuevo contacto */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          disabled={disabled || isMaxContactsReached}
          sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
        >
          Nuevo Contacto
        </Button>
      </Box>

      {/* Mensaje de error */}
      {error && (
        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}

      {/* Dialog para crear nuevo contacto */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Contacto de Emergencia</DialogTitle>
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
                <InputLabel>Relación</InputLabel>
                <Select
                  value={formData.relationship}
                  label="Relación"
                  onChange={handleInputChange('relationship')}
                >
                  <MenuItem value="Familiar">Familiar</MenuItem>
                  <MenuItem value="Amigo de la familia">Amigo de la familia</MenuItem>
                  <MenuItem value="Vecino">Vecino</MenuItem>
                  <MenuItem value="Médico">Médico</MenuItem>
                  <MenuItem value="Pediatra">Pediatra</MenuItem>
                  <MenuItem value="Enfermero/a">Enfermero/a</MenuItem>
                  <MenuItem value="Cuidador">Cuidador</MenuItem>
                  <MenuItem value="Profesor">Profesor</MenuItem>
                  <MenuItem value="Directivo escolar">Directivo escolar</MenuItem>
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
            onClick={handleCreateContact}
            variant="contained"
            disabled={createLoading}
          >
            {createLoading ? 'Creando...' : 'Crear Contacto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para seleccionar parentesco */}
      <Dialog
        open={relationshipDialogOpen}
        onClose={handleCloseRelationshipDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Seleccionar Relación</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
            Especifica la relación de <strong>{selectedContactForRelationship?.firstName} {selectedContactForRelationship?.lastName}</strong> con el estudiante:
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Relación</InputLabel>
            <Select
              value={selectedRelationship}
              label="Relación"
              onChange={(e) => setSelectedRelationship(e.target.value)}
            >
              <MenuItem value="Familiar">Familiar</MenuItem>
              <MenuItem value="Padre">Padre</MenuItem>
              <MenuItem value="Madre">Madre</MenuItem>
              <MenuItem value="Abuelo">Abuelo</MenuItem>
              <MenuItem value="Abuela">Abuela</MenuItem>
              <MenuItem value="Tío">Tío</MenuItem>
              <MenuItem value="Tía">Tía</MenuItem>
              <MenuItem value="Hermano">Hermano</MenuItem>
              <MenuItem value="Hermana">Hermana</MenuItem>
              <MenuItem value="Vecino">Vecino</MenuItem>
              <MenuItem value="Amigo de la Familia">Amigo de la Familia</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRelationshipDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmRelationship} 
            variant="contained"
            disabled={!selectedRelationship}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
