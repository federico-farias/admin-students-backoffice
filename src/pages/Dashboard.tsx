import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  People as PeopleIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { dashboardApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import type { DashboardStats } from '../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: `${color}.main`,
              color: 'white'
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        setError('Error al cargar las estadísticas');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Resumen general del sistema de gestión escolar
      </Typography>

      {/* Stats Cards */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }}
        gap={3}
        mb={3}
      >
        <StatCard
          title="Total de Estudiantes"
          value={stats.totalStudents}
          icon={<PeopleIcon />}
          color="primary"
        />
        <StatCard
          title="Estudiantes Activos"
          value={stats.activeStudents}
          icon={<PeopleIcon />}
          color="success"
        />
        <StatCard
          title="Pagos Realizados"
          value={stats.totalPayments}
          icon={<PaymentIcon />}
          color="success"
        />
        <StatCard
          title="Pagos Pendientes"
          value={stats.pendingPayments}
          icon={<WarningIcon />}
          color="warning"
        />
      </Box>

      {/* Revenue Cards */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
        gap={3}
        mb={3}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <MoneyIcon color="success" />
              <Typography variant="h6" component="h2">
                Ingresos del Mes
              </Typography>
            </Box>
            <Typography variant="h3" component="div" color="success.main" fontWeight="bold">
              {formatCurrency(stats.monthlyRevenue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de pagos recibidos este mes
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <WarningIcon color="warning" />
              <Typography variant="h6" component="h2">
                Monto Pendiente
              </Typography>
            </Box>
            <Typography variant="h3" component="div" color="warning.main" fontWeight="bold">
              {formatCurrency(stats.unpaidAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de pagos pendientes
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Summary Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Resumen Rápido
          </Typography>
          <Typography variant="body1" color="text.secondary">
            El sistema está funcionando correctamente. 
            {stats.pendingPayments > 0 && (
              <> Hay {stats.pendingPayments} pago(s) pendiente(s) que requieren atención.</>
            )}
            {stats.pendingPayments === 0 && (
              <> ¡Excelente! Todos los pagos están al día.</>
            )}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
