import React from 'react';
import { Typography, Box } from '@mui/material';
import type { EmergencyContact } from '../types';

interface EmergencyContactInfoProps {
  contact?: EmergencyContact;
  fields?: Array<'name' | 'relationship' | 'phone' | 'email' | 'address'>;
}

export const EmergencyContactInfo: React.FC<EmergencyContactInfoProps> = ({ contact, fields = ['name', 'relationship', 'phone'] }) => {
  if (!contact) return null;

  return (
    <Box mb={1}>
      {fields.includes('name') && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Contacto:</strong> {contact.firstName} {contact.lastName}
        </Typography>
      )}
      {fields.includes('phone') && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Teléfono:</strong> {contact.phone}
        </Typography>
      )}
    </Box>
  );
};
