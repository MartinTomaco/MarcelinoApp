import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Box, Tabs, Tab } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSwipeable } from 'react-swipeable';
import { IncomeCalendar } from '../components/IncomeCalendar';
import { WorkDaysConfig } from '../components/WorkDaysConfig';
import { IncomeStats } from '../components/IncomeStats';
import { BackupRestore } from '../components/BackupRestore';
import { DriversConfig } from '../components/DriversConfig';
import { ExpenseCategoriesConfig } from '../components/ExpenseCategoriesConfig';
import { TransactionRecord, WorkDayConfig, MonthlyStats, NonWorkingDay, Driver, ExpenseCategory } from '../types';
import {
  getIncomeRecords,
  saveIncomeRecords,
  getTransactionRecords,
  saveTransactionRecords,
  getWorkDaysConfig,
  saveWorkDaysConfig,
  getNonWorkingDays,
  saveNonWorkingDays,
  getDrivers,
  saveDrivers,
  getExpenseCategories,
  saveExpenseCategories
} from '../services/localStorage';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>
  </div>
);

export const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [records, setRecords] = useState<TransactionRecord[]>(getTransactionRecords());
  const [nonWorkingDays, setNonWorkingDays] = useState<NonWorkingDay[]>(getNonWorkingDays());
  const [workDaysConfig, setWorkDaysConfig] = useState<WorkDayConfig[]>(getWorkDaysConfig());
  const [drivers, setDrivers] = useState<Driver[]>(getDrivers());
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(getExpenseCategories());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Migración de datos antiguos (compatibilidad hacia atrás)
  useEffect(() => {
    const oldIncomeRecords = getIncomeRecords();
    if (oldIncomeRecords.length > 0 && records.length === 0) {
      // Convertir registros antiguos a nuevo formato
      const convertedRecords: TransactionRecord[] = oldIncomeRecords.map(record => ({
        id: record.id,
        driverId: record.driverId,
        date: record.date,
        amount: record.amount,
        type: 'income' as const,
        notes: record.notes,
      }));
      setRecords(convertedRecords);
      saveTransactionRecords(convertedRecords);
    }
  }, [records.length]);

  // Memoizar los cálculos de estadísticas
  const monthlyStats = useMemo(() => {
    const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    const monthlyRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === selectedMonth.getMonth() && 
             recordDate.getFullYear() === selectedMonth.getFullYear();
    });

    const incomeByDay: { [key: string]: number } = {};
    const expensesByDay: { [key: string]: number } = {};
    const incomeByDriver: { [key: string]: number } = {};
    const expensesByDriver: { [key: string]: number } = {};
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalWorkDays = 0;

    monthlyRecords.forEach(record => {
      const dateStr = format(record.date, 'yyyy-MM-dd');
      
      if (record.type === 'income') {
        incomeByDay[dateStr] = (incomeByDay[dateStr] || 0) + record.amount;
        incomeByDriver[record.driverId] = (incomeByDriver[record.driverId] || 0) + record.amount;
        totalIncome += record.amount;
      } else {
        expensesByDay[dateStr] = (expensesByDay[dateStr] || 0) + record.amount;
        expensesByDriver[record.driverId] = (expensesByDriver[record.driverId] || 0) + record.amount;
        totalExpenses += record.amount;
      }
    });

    // Contar días laborables en el mes
    for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
      const dayConfig = workDaysConfig.find(config => config.dayOfWeek === d.getDay());
      const isNonWorkingDay = nonWorkingDays.some(nwd => 
        nwd.date.getFullYear() === d.getFullYear() &&
        nwd.date.getMonth() === d.getMonth() &&
        nwd.date.getDate() === d.getDate()
      );
      
      if (dayConfig?.isWorkDay && !isNonWorkingDay) {
        totalWorkDays++;
      }
    }

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      averageDailyIncome: totalWorkDays > 0 ? totalIncome / totalWorkDays : 0,
      averageDailyExpenses: totalWorkDays > 0 ? totalExpenses / totalWorkDays : 0,
      totalWorkDays,
      incomeByDay,
      expensesByDay,
      incomeByDriver,
      expensesByDriver,
    };
  }, [records, workDaysConfig, nonWorkingDays, selectedMonth]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: (event) => {
      // Solo cambiar de pestaña si el gesto no viene del calendario y no hay modal abierto
      const target = event.event.target as HTMLElement;
      if (target && !target.closest('.MuiDateCalendar-root') && !isModalOpen) {
        if (tabValue < 3) {
          setTabValue(tabValue + 1);
        }
      }
    },
    onSwipedRight: (event) => {
      // Solo cambiar de pestaña si el gesto no viene del calendario y no hay modal abierto
      const target = event.event.target as HTMLElement;
      if (target && !target.closest('.MuiDateCalendar-root') && !isModalOpen) {
        if (tabValue > 0) {
          setTabValue(tabValue - 1);
        }
      }
    },
    trackMouse: true,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false },
    preventScrollOnSwipe: true
  });

  const handleMonthChange = useCallback((date: Date) => {
    setSelectedMonth(date);
  }, []);

  const handleAddRecord = useCallback((record: Omit<TransactionRecord, 'id'>) => {
    const newRecord: TransactionRecord = {
      ...record,
      id: Date.now().toString(),
    };
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveTransactionRecords(updatedRecords);
  }, [records]);

  const handleEditRecord = useCallback((record: TransactionRecord) => {
    const updatedRecords = records.map(r =>
      r.id === record.id ? record : r
    );
    setRecords(updatedRecords);
    saveTransactionRecords(updatedRecords);
  }, [records]);

  const handleDeleteRecord = useCallback((recordId: string) => {
    const updatedRecords = records.filter(r => r.id !== recordId);
    setRecords(updatedRecords);
    saveTransactionRecords(updatedRecords);
  }, [records]);

  const handleConfigChange = useCallback((newConfig: WorkDayConfig[]) => {
    setWorkDaysConfig(newConfig);
    saveWorkDaysConfig(newConfig);
  }, []);

  const handleDriversChange = useCallback((newDrivers: Driver[]) => {
    setDrivers(newDrivers);
    saveDrivers(newDrivers);
  }, []);

  const handleExpenseCategoriesChange = useCallback((newCategories: ExpenseCategory[]) => {
    setExpenseCategories(newCategories);
    saveExpenseCategories(newCategories);
  }, []);

  const handleAddNonWorkingDay = (date: Date) => {
    const newNonWorkingDay: NonWorkingDay = {
      id: `nwd-${date.getTime()}`,
      date: date
    };
    const updatedNonWorkingDays = [...nonWorkingDays, newNonWorkingDay];
    setNonWorkingDays(updatedNonWorkingDays);
    saveNonWorkingDays(updatedNonWorkingDays);
  };

  const handleRemoveNonWorkingDay = (date: Date) => {
    const updatedNonWorkingDays = nonWorkingDays.filter(nwd => 
      !(nwd.date.getFullYear() === date.getFullYear() &&
        nwd.date.getMonth() === date.getMonth() &&
        nwd.date.getDate() === date.getDate())
    );
    setNonWorkingDays(updatedNonWorkingDays);
    saveNonWorkingDays(updatedNonWorkingDays);
  };

  return (
    <Container maxWidth="lg" sx={{ 
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      boxSizing: 'border-box',
      display: 'block',
      paddingLeft: { xs: 0, sm: 0 },
      paddingRight: { xs: 0, sm: 0 },
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Box {...handlers} sx={{ height: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            minHeight: '40px',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'space-between',
              gap: { xs: 0, sm: 1 }
            },
            '& .MuiTab-root': {
              minHeight: '40px',
              padding: { xs: '6px 8px', sm: '12px 16px' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minWidth: { xs: 'auto', sm: 'auto' },
              flex: { xs: 1, sm: 'none' }
            },
            '& .MuiTab-root:last-child': {
              marginLeft: { xs: 0, sm: 'auto' }
            }
          }}
        >
          <Tab label="Calendario" />
          <Tab label="Estadísticas" />
          <Tab label="Conductores" />
          <Tab icon={<SettingsIcon />} />
        </Tabs>

        <Box sx={{ height: 'calc(100% - 48px)', overflow: 'auto' }}>
          <TabPanel value={tabValue} index={0}>
            <IncomeCalendar
              records={records}
              workDaysConfig={workDaysConfig}
              onAddRecord={handleAddRecord}
              onEditRecord={handleEditRecord}
              onDeleteRecord={handleDeleteRecord}
              nonWorkingDays={nonWorkingDays}
              onAddNonWorkingDay={handleAddNonWorkingDay}
              onRemoveNonWorkingDay={handleRemoveNonWorkingDay}
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              drivers={drivers}
              expenseCategories={expenseCategories}
              onModalOpenChange={setIsModalOpen}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <IncomeStats
              stats={monthlyStats}
              drivers={drivers}
              onMonthChange={handleMonthChange}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <DriversConfig
              drivers={drivers}
              onDriversChange={handleDriversChange}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <WorkDaysConfig
              config={workDaysConfig}
              onConfigChange={handleConfigChange}
            />
            <ExpenseCategoriesConfig
              categories={expenseCategories}
              onCategoriesChange={handleExpenseCategoriesChange}
            />
            <BackupRestore />
          </TabPanel>
        </Box>
      </Box>
    </Container>
  );
}; 