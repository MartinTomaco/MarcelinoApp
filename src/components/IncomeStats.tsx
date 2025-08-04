import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Stack,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MonthlyStats, Driver } from '../types';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

interface IncomeStatsProps {
  stats: MonthlyStats;
  drivers: Driver[];
  onMonthChange?: (date: Date) => void;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper elevation={3} sx={{ p: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {data.dayOfWeek}
        </Typography>
        <Typography variant="body2">
          {data.date}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
          Ingresos: ${data.income?.toLocaleString() || 0}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Gastos: ${data.expenses?.toLocaleString() || 0}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          Neto: ${data.net?.toLocaleString() || 0}
        </Typography>
      </Paper>
    );
  }
  return null;
};

export const IncomeStats: React.FC<IncomeStatsProps> = ({ stats, drivers, onMonthChange }) => {
  // Usar el mes actual de las estadísticas en lugar de un estado interno
  const currentDate = useMemo(() => {
    // Extraer el mes de las estadísticas si hay datos, sino usar el mes actual
    const dates = Object.keys({ ...stats.incomeByDay, ...stats.expensesByDay });
    if (dates.length > 0) {
      const firstDate = dates[0];
      return new Date(firstDate);
    }
    return new Date();
  }, [stats.incomeByDay, stats.expensesByDay]);

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    onMonthChange?.(newDate);
  };

  const chartData = Object.keys({ ...stats.incomeByDay, ...stats.expensesByDay })
    .sort((dateA, dateB) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map((date) => {
      const parsedDate = parseISO(date);
      const income = stats.incomeByDay[date] || 0;
      const expenses = stats.expensesByDay[date] || 0;
      return {
        date: format(parsedDate, 'dd/MM', { locale: es }),
        dayOfWeek: format(parsedDate, 'EEEE', { locale: es }).replace(/^\w/, c => c.toUpperCase()),
        income,
        expenses,
        net: income - expenses,
      };
    });

  // Combinar conductores que tienen ingresos y gastos
  const allDriverIds = new Set([
    ...Object.keys(stats.incomeByDriver),
    ...Object.keys(stats.expensesByDriver)
  ]);

  const driverStats = Array.from(allDriverIds).map((driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    const income = stats.incomeByDriver[driverId] || 0;
    const expenses = stats.expensesByDriver[driverId] || 0;
    return {
      name: driver?.name || 'Conductor Desconocido',
      color: driver?.vehicleColor || '#1976d2',
      income,
      expenses,
      net: income - expenses,
    };
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2 },
      '@media (max-width:370px)': { 
        p: 0.5 
      }
    }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 1, sm: 2 },
        '@media (max-width:370px)': { 
          p: 0.5 
        }
      }}>
        <Stack direction="column" spacing={2} mb={2}>
          <Typography variant="h5">
            Estadísticas Mensuales
          </Typography>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
            <IconButton onClick={handlePreviousMonth} size="small">
              <ArrowBackIosNewIcon />
            </IconButton>
            <Typography variant="h6">
              {format(currentDate, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase())}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small">
              <ArrowForwardIosIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Resumen de estadísticas */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon />
                  <Typography variant="h6">Ingresos</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${stats.totalIncome.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Promedio diario: ${stats.averageDailyIncome.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingDownIcon />
                  <Typography variant="h6">Gastos</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${stats.totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Promedio diario: ${stats.averageDailyExpenses.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              bgcolor: stats.netIncome >= 0 ? 'success.main' : 'error.main', 
              color: 'white' 
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccountBalanceIcon />
                  <Typography variant="h6">Ganancia Neta</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${Math.abs(stats.netIncome).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {stats.netIncome >= 0 ? 'Ganancia' : 'Pérdida'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Estadísticas por conductor */}
        {driverStats.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" mb={2}>
              Estadísticas por Conductor
            </Typography>
            <Grid container spacing={2}>
              {driverStats.map((driver, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: driver.color,
                            border: 1,
                            borderColor: 'divider',
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {driver.name}
                        </Typography>
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="success.main">
                          Ingresos: ${driver.income.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          Gastos: ${driver.expenses.toLocaleString()}
                        </Typography>
                        <Divider />
                        <Typography variant="body1" fontWeight="bold" 
                          color={driver.net >= 0 ? 'success.main' : 'error.main'}>
                          Neto: ${Math.abs(driver.net).toLocaleString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Gráfico de barras */}
        <Box mb={3}>
          <Typography variant="h6" mb={2}>
            Transacciones Diarias
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#4caf50" name="Ingresos" />
              <Bar dataKey="expenses" fill="#f44336" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Gráficos circulares de distribución por conductor */}
        {driverStats.length > 1 && (
          <Box>
            <Grid container spacing={3}>
              {/* Gráfico de distribución de ingresos */}
              {stats.totalIncome > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" mb={2}>
                    Distribución de Ingresos por Conductor
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={driverStats.filter(d => d.income > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="income"
                      >
                        {driverStats.filter(d => d.income > 0).map((entry, index) => (
                          <Cell key={`cell-income-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
              )}

              {/* Gráfico de distribución de gastos */}
              {stats.totalExpenses > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" mb={2}>
                    Distribución de Gastos por Conductor
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={driverStats.filter(d => d.expenses > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="expenses"
                      >
                        {driverStats.filter(d => d.expenses > 0).map((entry, index) => (
                          <Cell key={`cell-expenses-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}; 