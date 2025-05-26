import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { IncomeRecord, WorkDayConfig, NonWorkingDay } from '../types';
import AddIcon from '@mui/icons-material/Add';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';

interface IncomeCalendarProps {
  records: IncomeRecord[];
  workDaysConfig: WorkDayConfig[];
  nonWorkingDays: NonWorkingDay[];
  onAddRecord: (record: Omit<IncomeRecord, 'id'>) => void;
  onEditRecord: (record: IncomeRecord) => void;
  onAddNonWorkingDay: (date: Date) => void;
}

export const IncomeCalendar: React.FC<IncomeCalendarProps> = ({
  records,
  workDaysConfig,
  nonWorkingDays,
  onAddRecord,
  onEditRecord,
  onAddNonWorkingDay,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    const existingRecord = records.find(
      record => isSameDay(record.date, date!)
    );
    
    if (existingRecord) {
      setAmount(existingRecord.amount.toString());
      setNotes(existingRecord.notes || '');
    } else {
      setAmount('');
      setNotes('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedDate || !amount) return;

    const record: Omit<IncomeRecord, 'id'> = {
      date: selectedDate,
      amount: parseFloat(amount),
      notes,
      driverId: '1', // TODO: Implementar selección de conductor
    };

    const existingRecord = records.find(
      r => isSameDay(r.date, selectedDate)
    );

    if (existingRecord) {
      onEditRecord({ ...record, id: existingRecord.id });
    } else {
      onAddRecord(record);
    }

    setIsDialogOpen(false);
  };

  const handleAddNonWorkingDay = () => {
    if (selectedDate) {
      onAddNonWorkingDay(selectedDate);
      setIsDialogOpen(false);
    }
  };

  const getDayIncome = (date: Date) => {
    const record = records.find(r => isSameDay(r.date, date));
    return record ? record.amount : 0;
  };

  const isNonWorkingDay = (date: Date) => {
    const dayConfig = workDaysConfig.find(config => config.dayOfWeek === date.getDay());
    const isSpecificNonWorkingDay = nonWorkingDays.some(nwd => 
      nwd.date.getFullYear() === date.getFullYear() &&
      nwd.date.getMonth() === date.getMonth() &&
      nwd.date.getDate() === date.getDate()
    );
    return !dayConfig?.isWorkDay || isSpecificNonWorkingDay;
  };

  const renderDay = (props: PickersDayProps<Date>) => {
    const { day, selected, ...other } = props;
    const hasIncome = getDayIncome(day);
    const nonWorking = isNonWorkingDay(day);
    
    return (
      <Box
        sx={{
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: hasIncome ? 'success.main' : 'transparent',
          },
        }}
      >
        <PickersDay
          {...other}
          day={day}
          selected={selected}
          sx={{
            backgroundColor: nonWorking ? 'grey.200' : undefined,
            '&:hover': {
              backgroundColor: nonWorking ? 'grey.300' : undefined,
            },
          }}
        />
        {hasIncome > 0 && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'success.main',
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          >
            ${hasIncome}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 1, sm: 2 },
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Calendario de Ingresos
          </Typography>
          <IconButton 
            color="primary" 
            onClick={() => setIsDialogOpen(true)}
            sx={{ display: { sm: 'none' } }}
          >
            <AddIcon />
          </IconButton>
        </Stack>

        <DateCalendar
          value={selectedDate}
          onChange={handleDateSelect}
          sx={{
            width: '100%',
            '& .MuiPickersDay-root': {
              position: 'relative',
            },
            '& .MuiPickersDay-root.Mui-selected': {
              backgroundColor: 'primary.main',
            },
          }}
          slots={{
            day: renderDay
          }}
        />
      </Paper>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>
          {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: es }) : ''}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              autoFocus
              label="Monto"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              label="Notas"
              fullWidth
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {selectedDate && !isNonWorkingDay(selectedDate) && (
              <Button
                startIcon={<EventBusyIcon />}
                onClick={handleAddNonWorkingDay}
                variant="outlined"
                color="secondary"
              >
                Marcar como día no laborable
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 