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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Chip
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { format, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { TransactionRecord, WorkDayConfig, NonWorkingDay, Driver, ExpenseCategory } from '../types';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DeleteIcon from '@mui/icons-material/Delete';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

interface IncomeCalendarProps {
  records: TransactionRecord[];
  workDaysConfig: WorkDayConfig[];
  nonWorkingDays: NonWorkingDay[];
  drivers: Driver[];
  expenseCategories: ExpenseCategory[];
  onAddRecord: (record: Omit<TransactionRecord, 'id'>) => void;
  onEditRecord: (record: TransactionRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onAddNonWorkingDay: (date: Date) => void;
  onRemoveNonWorkingDay: (date: Date) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  onModalOpenChange?: (isOpen: boolean) => void;
}

export const IncomeCalendar: React.FC<IncomeCalendarProps> = ({
  records,
  workDaysConfig,
  nonWorkingDays,
  drivers,
  expenseCategories,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onAddNonWorkingDay,
  onRemoveNonWorkingDay,
  selectedMonth,
  onMonthChange,
  onModalOpenChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');

  const getDayTransactions = useCallback((date: Date) => {
    return records.filter(r => isSameDay(r.date, date));
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
    const dayTransactions = getDayTransactions(day);
    const nonWorking = isNonWorkingDay(day);
    const hasNotes = dayTransactions.some(t => t.notes && t.notes.trim().length > 0);
    
    const totalIncome = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = totalIncome - totalExpenses;
    
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
              top: 1,
              left: 1,
              zIndex: 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
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
        {dayTransactions.length > 0 && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              color: netAmount >= 0 ? 'success.main' : 'error.main',
              fontWeight: 'bold',
              fontSize: '0.7rem',
              zIndex: 1,
            }}
          >
            ${Math.abs(netAmount)}
          </Typography>
        )}
        {dayTransactions.length > 0 && (
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: netAmount >= 0 ? 'success.main' : 'error.main',
              position: 'absolute',
              bottom: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
            }}
            aria-hidden="true"
          />
        )}
        {/* Indicadores de múltiples conductores */}
        {dayTransactions.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 1,
              right: 1,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 0.25,
              maxWidth: 'calc(100% - 8px)',
              justifyContent: 'flex-end',
            }}
          >
            {dayTransactions.slice(0, 4).map((transaction, index) => {
              const driver = drivers.find(d => d.id === transaction.driverId);
              return (
                <Box
                  key={`${transaction.id}-${index}`}
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: driver?.vehicleColor || 'grey.500',
                    border: 1,
                    borderColor: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }}
                />
              );
            })}
            {dayTransactions.length > 4 && (
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: 'grey.400',
                  border: 1,
                  borderColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.5rem',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                +
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }, [getDayTransactions, isNonWorkingDay, records, drivers]);

  const handleDateSelect = useCallback((date: Date | null) => {
    setSelectedDate(date);
    const existingTransactions = records.filter(
      record => isSameDay(record.date, date!)
    );
    
    if (existingTransactions.length > 0) {
      // Si hay múltiples transacciones, mostrar la primera
      const firstTransaction = existingTransactions[0];
      setAmount(firstTransaction.amount.toString());
      setNotes(firstTransaction.notes || '');
      setTransactionType(firstTransaction.type);
      setSelectedDriver(firstTransaction.driverId);
      setSelectedCategory(firstTransaction.category || '');
      setSelectedTransactionId(firstTransaction.id);
    } else {
      setAmount('');
      setNotes('');
      setTransactionType('income');
      setSelectedDriver(drivers.length > 0 ? drivers[0].id : '');
      setSelectedCategory('');
      setSelectedTransactionId('');
    }
    setIsDialogOpen(true);
    onModalOpenChange?.(true);
  }, [records, drivers, onModalOpenChange]);

  const handleSave = useCallback(() => {
    if (!selectedDate || !amount || !selectedDriver) return;

    const record: Omit<TransactionRecord, 'id'> = {
      date: selectedDate,
      amount: parseFloat(amount),
      type: transactionType,
      driverId: selectedDriver,
      category: transactionType === 'expense' ? selectedCategory : undefined,
      notes,
    };

    // Buscar transacción existente del mismo tipo, conductor y fecha
    const existingTransaction = records.find(
      r => isSameDay(r.date, selectedDate) && 
           r.driverId === selectedDriver && 
           r.type === transactionType
    );

    if (existingTransaction) {
      // Editar transacción existente
      onEditRecord({ ...record, id: existingTransaction.id });
    } else {
      // Agregar nueva transacción
      onAddRecord(record);
    }

    setIsDialogOpen(false);
    setSelectedDate(null);
    onModalOpenChange?.(false);
  }, [selectedDate, amount, notes, transactionType, selectedDriver, selectedCategory, records, onEditRecord, onAddRecord, onModalOpenChange]);

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
      onModalOpenChange?.(false);
    }
  }, [selectedDate, nonWorkingDays, onAddNonWorkingDay, onRemoveNonWorkingDay, onModalOpenChange]);

  const handleDelete = useCallback(() => {
    if (!selectedDate || !selectedDriver) return;
    
    // Buscar transacción existente del mismo tipo, conductor y fecha
    const existingTransaction = records.find(
      r => isSameDay(r.date, selectedDate) && 
           r.driverId === selectedDriver && 
           r.type === transactionType
    );

    if (existingTransaction) {
      onDeleteRecord(existingTransaction.id);
      setIsDialogOpen(false);
      setSelectedDate(null);
      onModalOpenChange?.(false);
    }
  }, [selectedDate, selectedDriver, transactionType, records, onDeleteRecord, onModalOpenChange]);

  const activeDrivers = drivers.filter(d => d.active);

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2 },
      '@media (max-width:370px)': { 
        p: 0.5 
      }
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 1, sm: 2 },
          '@media (max-width:370px)': { 
            p: 0.5 
          },
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        <Stack direction="row" justifyContent={{ xs: 'center', sm: 'space-between' }} alignItems="center" mb={2} mt={2} ml={{ sm: 2 }}>
          <Typography variant="h5">
            Calendario de Transacciones
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
            defaultValue={selectedMonth}
            onMonthChange={onMonthChange}
          />
        </Box>
      </Paper>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false);
          onModalOpenChange?.(false);
        }}
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
          <Stack spacing={1}>
            <Typography variant="h6">
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: es }) : ''}
            </Typography>
            {selectedDate && getDayTransactions(selectedDate).length > 1 && (
              <FormControl fullWidth size="small">
                <InputLabel>Seleccionar Transacción</InputLabel>
                <Select
                  value={selectedTransactionId}
                  label="Seleccionar Transacción"
                  onChange={(e) => {
                    const transactionId = e.target.value;
                    setSelectedTransactionId(transactionId);
                    const transaction = records.find(t => t.id === transactionId);
                    if (transaction) {
                      setAmount(transaction.amount.toString());
                      setNotes(transaction.notes || '');
                      setTransactionType(transaction.type);
                      setSelectedDriver(transaction.driverId);
                      setSelectedCategory(transaction.category || '');
                    }
                  }}
                >
                  {getDayTransactions(selectedDate).map((transaction) => {
                    const driver = drivers.find(d => d.id === transaction.driverId);
                    const category = transaction.type === 'expense' ? 
                      expenseCategories.find(c => c.id === transaction.category) : null;
                    return (
                      <MenuItem key={transaction.id} value={transaction.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: driver?.vehicleColor || 'grey.500',
                              border: 1,
                              borderColor: 'divider',
                            }}
                          />
                          <Typography variant="body2">
                            {driver?.name} - {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                            {category && ` (${category.name})`}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ${transaction.amount}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <ToggleButtonGroup
              value={transactionType}
              exclusive
              onChange={(e, value) => value && setTransactionType(value)}
              fullWidth
            >
              <ToggleButton value="income" color="success">
                Ingreso
              </ToggleButton>
              <ToggleButton value="expense" color="error">
                Gasto
              </ToggleButton>
            </ToggleButtonGroup>

            <FormControl fullWidth>
              <InputLabel>Conductor</InputLabel>
              <Select
                value={selectedDriver}
                label="Conductor"
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                {activeDrivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: driver.vehicleColor,
                          border: 1,
                          borderColor: 'divider',
                        }}
                      />
                      <Typography>{driver.name}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {transactionType === 'expense' && (
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Categoría"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {expenseCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: category.color,
                            border: 1,
                            borderColor: 'divider',
                          }}
                        />
                        <Typography>{category.name}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
          {selectedDate && selectedDriver && records.find(r => isSameDay(r.date, selectedDate) && r.driverId === selectedDriver && r.type === transactionType) && (
            <Button 
              onClick={handleDelete} 
              color="error" 
              startIcon={<DeleteIcon />}
            >
              Eliminar
            </Button>
          )}
          <Button onClick={() => {
            setIsDialogOpen(false);
            onModalOpenChange?.(false);
          }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 