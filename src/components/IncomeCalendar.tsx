import React, { useState, useMemo, useCallback, useRef } from 'react';
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
import { format, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { IncomeRecord, WorkDayConfig, NonWorkingDay } from '../types';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DeleteIcon from '@mui/icons-material/Delete';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

interface IncomeCalendarProps {
  records: IncomeRecord[];
  workDaysConfig: WorkDayConfig[];
  nonWorkingDays: NonWorkingDay[];
  onAddRecord: (record: Omit<IncomeRecord, 'id'>) => void;
  onEditRecord: (record: IncomeRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onAddNonWorkingDay: (date: Date) => void;
  onRemoveNonWorkingDay: (date: Date) => void;
}

export const IncomeCalendar: React.FC<IncomeCalendarProps> = ({
  records,
  workDaysConfig,
  nonWorkingDays,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onAddNonWorkingDay,
  onRemoveNonWorkingDay,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDayIncome = useCallback((date: Date) => {
    const record = records.find(r => isSameDay(r.date, date));
    return record ? record.amount : 0;
  }, [records]);

  const isNonWorkingDay = useCallback((date: Date) => {
    const dayConfig = workDaysConfig.find(config => config.dayOfWeek === date.getDay());
    const isSpecificNonWorkingDay = nonWorkingDays.some(nwd => 
      nwd.date.getFullYear() === date.getFullYear() &&
      nwd.date.getMonth() === date.getMonth() &&
      nwd.date.getDate() === date.getDate()
    );
    return !dayConfig?.isWorkDay || isSpecificNonWorkingDay;
  }, [workDaysConfig, nonWorkingDays]);

  const renderDay = useCallback((props: PickersDayProps<Date>) => {
    const { day, selected, ...other } = props;
    const hasIncome = getDayIncome(day);
    const nonWorking = isNonWorkingDay(day);
    const record = records.find(r => isSameDay(r.date, day));
    const hasNotes = record?.notes && record.notes.trim().length > 0;
    
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {hasNotes && (
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: 'warning.main',
              position: 'absolute',
              top: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
            }}
            aria-hidden="true"
          />
        )}
        <PickersDay
          {...other}
          day={day}
          selected={selected}
          sx={{
            backgroundColor: nonWorking ? 'grey.200' : undefined,
            '&:hover': {
              backgroundColor: nonWorking ? 'grey.300' : undefined,
            },
            position: 'relative',
            zIndex: 2,
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
              zIndex: 1,
            }}
          >
            ${hasIncome}
          </Typography>
        )}
        {hasIncome > 0 && (
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              position: 'absolute',
              bottom: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
            }}
            aria-hidden="true"
          />
        )}
      </Box>
    );
  }, [getDayIncome, isNonWorkingDay, records]);

  const handleDateSelect = useCallback((date: Date | null) => {
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
  }, [records]);

  const handleSave = useCallback(() => {
    if (!selectedDate || !amount) return;

    const record: Omit<IncomeRecord, 'id'> = {
      date: selectedDate,
      amount: parseFloat(amount),
      notes,
      driverId: '1',
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
    setSelectedDate(null);
  }, [selectedDate, amount, notes, records, onEditRecord, onAddRecord]);

  const handleToggleNonWorkingDay = useCallback(() => {
    if (selectedDate) {
      const isNonWorking = nonWorkingDays.some(nwd => 
        nwd.date.getFullYear() === selectedDate.getFullYear() &&
        nwd.date.getMonth() === selectedDate.getMonth() &&
        nwd.date.getDate() === selectedDate.getDate()
      );

      if (isNonWorking) {
        onRemoveNonWorkingDay(selectedDate);
      } else {
        onAddNonWorkingDay(selectedDate);
      }
      setIsDialogOpen(false);
      setSelectedDate(null);
    }
  }, [selectedDate, nonWorkingDays, onAddNonWorkingDay, onRemoveNonWorkingDay]);

  const handleDelete = useCallback(() => {
    if (!selectedDate) return;
    
    const existingRecord = records.find(
      r => isSameDay(r.date, selectedDate)
    );

    if (existingRecord) {
      onDeleteRecord(existingRecord.id);
      setIsDialogOpen(false);
      setSelectedDate(null);
    }
  }, [selectedDate, records, onDeleteRecord]);

  return (
    <Box sx={{ 
      p: 2,
      '@media (max-width:370px)': { 
        p: 1 
      }
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2,
          '@media (max-width:370px)': { 
            p: 1 
          },
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        <Stack direction="row" justifyContent={{ xs: 'center', sm: 'space-between' }} alignItems="center" mb={2} mt={2} ml={{ sm: 2 }}>
          <Typography variant="h5">
            Calendario de Ingresos
          </Typography>
        </Stack>

        <Box sx={{ width: '100%' }}>
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
              '& .MuiPickersCalendarHeader-label': {
                textTransform: 'capitalize'
              }
            }}
            slots={{
              day: renderDay
            }}
            defaultValue={currentMonth}
          />
        </Box>
      </Paper>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
          },
        }}
        PaperProps={{
          sx: {
            borderTop: '4px solid',
            borderLeft: '4px solid',
            borderRight: '4px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }
        }}
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
            {selectedDate && (
              <Button
                startIcon={<EventBusyIcon />}
                onClick={handleToggleNonWorkingDay}
                variant="outlined"
                color={isNonWorkingDay(selectedDate) ? "success" : "secondary"}
              >
                {isNonWorkingDay(selectedDate) ? "Marcar como día laborable" : "Marcar como día no laborable"}
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {selectedDate && records.find(r => isSameDay(r.date, selectedDate)) && (
            <Button 
              onClick={handleDelete} 
              color="error" 
              startIcon={<DeleteIcon />}
            >
              Eliminar
            </Button>
          )}
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 