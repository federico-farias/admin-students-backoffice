import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Divider,
  Badge,
  Avatar,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { getFullName, getInitials, getAge, formatDate } from '../utils/formatters';
import type { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onView?: (student: Student) => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onSelect?: (student: Student) => void;
  showSelectAction?: boolean;
  showManagementActions?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onView,
  onEdit,
  onDelete,
  onSelect,
  showSelectAction = false,
  showManagementActions = true
}) => {
  return (
    <Card sx={{ height: 'fit-content', position: 'relative' }}>
      <CardContent sx={{ pt: 2, pb: 2 }}>
        <Stack spacing={1}>
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
      {/* Controles en la parte inferior con fecha de registro a la izquierda */}
      {(showManagementActions || showSelectAction) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1.5,
            bgcolor: 'grey.100',
            borderTop: '1px solid #e0e0e0',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
            <strong>Registro:</strong> {formatDate(student.createdAt)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {showManagementActions && (
              <>
                {onView && (
                  <Tooltip title="Ver detalles">
                    <IconButton size="small" onClick={() => onView(student)} sx={{ color: 'info.main' }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onEdit && (
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(student)} sx={{ color: 'warning.main' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onDelete(student)} sx={{ color: 'error.main' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
            {showSelectAction && onSelect && (
              <Tooltip title="Seleccionar estudiante">
                <IconButton size="small" onClick={() => onSelect(student)} sx={{ color: 'primary.main' }}>
                  <PersonIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default StudentCard;
