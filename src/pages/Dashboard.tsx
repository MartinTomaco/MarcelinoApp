import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Box, Tabs, Tab } from '@mui/material';
import { IncomeCalendar } from '../components/IncomeCalendar';
import { WorkDaysConfig } from '../components/WorkDaysConfig';
import { IncomeStats } from '../components/IncomeStats';
import { IncomeRecord, WorkDayConfig, MonthlyStats, NonWorkingDay } from '../types';
import {
  getIncomeRecords,
  saveIncomeRecords,
  getWorkDaysConfig,
  saveWorkDaysConfig,
  getNonWorkingDays,
  saveNonWorkingDays
} from '../services/localStorage';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

export const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [records, setRecords] = useState<IncomeRecord[]>(getIncomeRecords());
  const [nonWorkingDays, setNonWorkingDays] = useState<NonWorkingDay[]>(getNonWorkingDays());
  const [workDaysConfig, setWorkDaysConfig] = useState<WorkDayConfig[]>(getWorkDaysConfig());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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
    let totalIncome = 0;
    let totalWorkDays = 0;

    monthlyRecords.forEach(record => {
      const dateStr = format(record.date, 'yyyy-MM-dd');
      incomeByDay[dateStr] = (incomeByDay[dateStr] || 0) + record.amount;
      totalIncome += record.amount;
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
      averageDailyIncome: totalWorkDays > 0 ? totalIncome / totalWorkDays : 0,
      totalWorkDays,
      incomeByDay,
    };
  }, [records, workDaysConfig, nonWorkingDays, selectedMonth]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleMonthChange = useCallback((date: Date) => {
    setSelectedMonth(date);
  }, []);

  const handleAddRecord = useCallback((record: Omit<IncomeRecord, 'id'>) => {
    const newRecord: IncomeRecord = {
      ...record,
      id: Date.now().toString(),
    };
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveIncomeRecords(updatedRecords);
  }, [records]);

  const handleEditRecord = useCallback((record: IncomeRecord) => {
    const updatedRecords = records.map(r =>
      r.id === record.id ? record : r
    );
    setRecords(updatedRecords);
    saveIncomeRecords(updatedRecords);
  }, [records]);

  const handleConfigChange = useCallback((newConfig: WorkDayConfig[]) => {
    setWorkDaysConfig(newConfig);
    saveWorkDaysConfig(newConfig);
  }, []);

  const handleAddNonWorkingDay = useCallback((date: Date) => {
    const newNonWorkingDay: NonWorkingDay = {
      id: Date.now().toString(),
      date: date
    };
    const updatedNonWorkingDays = [...nonWorkingDays, newNonWorkingDay];
    setNonWorkingDays(updatedNonWorkingDays);
    saveNonWorkingDays(updatedNonWorkingDays);
  }, [nonWorkingDays]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Calendario" />
          <Tab label="Estadísticas" />
          <Tab label="Configuración" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <IncomeCalendar
            records={records}
            workDaysConfig={workDaysConfig}
            nonWorkingDays={nonWorkingDays}
            onAddRecord={handleAddRecord}
            onEditRecord={handleEditRecord}
            onAddNonWorkingDay={handleAddNonWorkingDay}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <IncomeStats stats={monthlyStats} onMonthChange={handleMonthChange} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <WorkDaysConfig
            config={workDaysConfig}
            onConfigChange={handleConfigChange}
          />
        </TabPanel>
      </Box>
    </Container>
  );
}; 