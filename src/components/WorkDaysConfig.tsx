import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { WorkDayConfig } from '../types';

interface WorkDaysConfigProps {
  config: WorkDayConfig[];
  onConfigChange: (config: WorkDayConfig[]) => void;
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const WorkDaysConfig: React.FC<WorkDaysConfigProps> = ({
  config,
  onConfigChange,
}) => {
  const handleDayToggle = (dayIndex: number) => {
    const newConfig = config.map(day => {
      if (day.dayOfWeek === dayIndex) {
        return { ...day, isWorkDay: !day.isWorkDay };
      }
      return day;
    });
    onConfigChange(newConfig);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" gutterBottom>
          Configuración de Días Laborables
        </Typography>
        <FormGroup>
          {DAYS_OF_WEEK.map((day, index) => (
            <FormControlLabel
              key={day}
              control={
                <Switch
                  checked={config[index].isWorkDay}
                  onChange={() => handleDayToggle(index)}
                />
              }
              label={day}
            />
          ))}
        </FormGroup>
      </Paper>
    </Box>
  );
}; 