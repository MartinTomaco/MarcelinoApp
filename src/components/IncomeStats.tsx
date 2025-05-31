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
  TooltipProps,
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
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          ${data.amount.toLocaleString()}
        </Typography>
      </Paper>
    );
  }
  return null;
};

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
    .map(([date, amount]) => {
      const parsedDate = parseISO(date);
      return {
        date: format(parsedDate, 'dd/MM', { locale: es }),
        dayOfWeek: format(parsedDate, 'EEEE', { locale: es }).replace(/^\w/, c => c.toUpperCase()),
        amount,
      };
    });

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
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
        
        <Grid container spacing={2} mb={4}>
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
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}; 