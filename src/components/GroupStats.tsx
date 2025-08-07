import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Groups as GroupsIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface GroupStatsProps {
  stats: {
    totalGroups: number;
    totalStudents: number;
    fullGroups: number;
    averageOccupancy: number;
  } | null;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6" component="div" color="text.secondary">
          {title}
        </Typography>
        <Box color={`${color}.main`}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" component="div" fontWeight="bold">
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mt={1}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const GroupStats: React.FC<GroupStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography variant="body1" color="text.secondary">
          No hay datos de grupos disponibles
        </Typography>
      </Box>
    );
  }

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    if (percentage >= 50) return 'info';
    return 'success';
  };

  const getOccupancyChip = (percentage: number) => {
    const color = getOccupancyColor(percentage);
    let label = 'Baja ocupación';
    
    if (percentage >= 90) label = 'Ocupación crítica';
    else if (percentage >= 75) label = 'Alta ocupación';
    else if (percentage >= 50) label = 'Ocupación media';

    return (
      <Chip
        label={`${percentage}% - ${label}`}
        color={color}
        variant="outlined"
        size="small"
      />
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Estadísticas de Grupos
      </Typography>
      
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3}>
        <StatCard
          title="Total de Grupos"
          value={stats.totalGroups}
          icon={<GroupsIcon />}
          color="primary"
          subtitle="Grupos registrados"
        />
        
        <StatCard
          title="Total Estudiantes"
          value={stats.totalStudents}
          icon={<PeopleIcon />}
          color="info"
          subtitle="En todos los grupos"
        />
        
        <StatCard
          title="Grupos Llenos"
          value={stats.fullGroups}
          icon={<WarningIcon />}
          color={stats.fullGroups > 0 ? 'warning' : 'success'}
          subtitle={`de ${stats.totalGroups} grupos`}
        />
        
        <StatCard
          title="Ocupación Promedio"
          value={`${stats.averageOccupancy}%`}
          icon={<TrendingUpIcon />}
          color={getOccupancyColor(stats.averageOccupancy)}
          subtitle="Capacidad utilizada"
        />
      </Box>

      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estado General
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              {getOccupancyChip(stats.averageOccupancy)}
              <Typography variant="body2" color="text.secondary">
                {stats.fullGroups > 0 
                  ? `Atención: ${stats.fullGroups} grupo(s) están llenos` 
                  : 'Todos los grupos tienen capacidad disponible'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
