import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Stack,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyStats } from '../types';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface IncomeStatsProps {
  stats: MonthlyStats;
  onMonthChange?: (date: Date) => void;
}

export const IncomeStats: React.FC<IncomeStatsProps> = ({ stats, onMonthChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const chartData = Object.entries(stats.incomeByDay)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, amount]) => ({
      date: format(parseISO(date), 'dd/MM', { locale: es }),
      amount,
    }));

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
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
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Ingreso Total</Typography>
              <Typography variant="h4" color="primary">
                ${stats.totalIncome.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Promedio Diario</Typography>
              <Typography variant="h4" color="primary">
                ${stats.averageDailyIncome.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Días Laborables</Typography>
              <Typography variant="h4" color="primary">
                {stats.totalWorkDays}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ height: 400, mt: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}; 