import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { paymentsApi, studentsApi } from '../services/api';
import { formatCurrency, formatDate, getPaymentStatus } from '../utils/formatters';
import { PaymentForm } from '../components/PaymentForm';
import type { Payment, Student } from '../types';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsData, studentsData] = await Promise.all([
        paymentsApi.getAll(),
        studentsApi.getAll()
      ]);
      setPayments(paymentsData);
      setStudents(studentsData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      setFormLoading(true);
      const newPayment = await paymentsApi.create(paymentData);
      setPayments(prev => [...prev, newPayment]);
      setFormOpen(false);
    } catch (err) {
      setError('Error al crear el pago');
      console.error('Error creating payment:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePayment = async (paymentData: Omit<Payment, 'id'>) => {
    if (!editingPayment) return;
    
    try {
      setFormLoading(true);
      const updatedPayment = await paymentsApi.update(editingPayment.id, paymentData);
      setPayments(prev => prev.map(p => p.id === editingPayment.id ? updatedPayment : p));
      setFormOpen(false);
      setEditingPayment(null);
    } catch (err) {
      setError('Error al actualizar el pago');
      console.error('Error updating payment:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      await paymentsApi.delete(selectedPayment.id);
      setPayments(prev => prev.filter(p => p.id !== selectedPayment.id));
      setDeleteDialogOpen(false);
      setSelectedPayment(null);
    } catch (err) {
      setError('Error al eliminar el pago');
      console.error('Error deleting payment:', err);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingPayment(null);
    setFormOpen(true);
  };

  const handleOpenEditForm = (payment: Payment) => {
    setEditingPayment(payment);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingPayment(null);
    setFormLoading(false);
  };

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Estudiante no encontrado';
  };

  const filteredPayments = payments.filter(payment => {
    const statusMatch = !statusFilter || payment.status === statusFilter;
    const methodMatch = !methodFilter || payment.paymentMethod === methodFilter;
    return statusMatch && methodMatch;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = filteredPayments
    .filter(p => p.status === 'pagado')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = filteredPayments
    .filter(p => p.status === 'pendiente')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Gestión de Pagos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateForm}
        >
          Registrar Pago
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }}
        gap={3}
        mb={4}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total General
            </Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {formatCurrency(totalAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredPayments.length} pagos
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pagos Realizados
            </Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {formatCurrency(paidAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredPayments.filter(p => p.status === 'pagado').length} pagos
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pagos Pendientes
            </Typography>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {formatCurrency(pendingAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredPayments.filter(p => p.status === 'pendiente').length} pagos
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <FilterIcon />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pagado">Pagado</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="vencido">Vencido</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Método</InputLabel>
              <Select
                value={methodFilter}
                label="Método"
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFilter('');
                setMethodFilter('');
              }}
            >
              Limpiar Filtros
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estudiante</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha de Pago</TableCell>
              <TableCell>Fecha de Vencimiento</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => {
              const statusInfo = getPaymentStatus(payment.status);
              return (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {getStudentName(payment.studentId)}
                    </Typography>
                  </TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>{payment.period}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                  </TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditForm(payment)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredPayments.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron pagos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter || methodFilter 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza registrando el primer pago'
            }
          </Typography>
        </Box>
      )}

      {/* Payment Form Dialog */}
      <PaymentForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={editingPayment ? handleUpdatePayment : handleCreatePayment}
        payment={editingPayment}
        loading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer.
          </Typography>
          {selectedPayment && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>Estudiante:</strong> {getStudentName(selectedPayment.studentId)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Descripción:</strong> {selectedPayment.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Monto:</strong> {formatCurrency(selectedPayment.amount)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeletePayment} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
