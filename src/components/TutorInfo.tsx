import React from 'react';
import { Typography, Box } from '@mui/material';
import type { Tutor } from '../types';

interface TutorInfoProps {
  tutor?: Tutor;
  fields?: Array<'name' | 'relationship' | 'phone' | 'email' | 'address' | 'documentNumber'>;
}

export const TutorInfo: React.FC<TutorInfoProps> = ({ tutor, fields = ['name', 'relationship', 'phone'] }) => {
  if (!tutor) return null;

  return (
    <Box mb={1}>
      {fields.includes('name') && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Padre/Tutor:</strong> {tutor.firstName} {tutor.lastName}
        </Typography>
      )}
      {fields.includes('relationship') && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Relación:</strong> {tutor.relationship}
        </Typography>
      )}
      {fields.includes('phone') && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Teléfono:</strong> {tutor.phone}
        </Typography>
      )}
      {fields.includes('email') && tutor.email && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Email:</strong> {tutor.email}
        </Typography>
      )}
      {fields.includes('address') && tutor.address && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Dirección:</strong> {tutor.address}
        </Typography>
      )}
      {fields.includes('documentNumber') && tutor.documentNumber && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Documento:</strong> {tutor.documentNumber}
        </Typography>
      )}
    </Box>
  );
};
