import { IncomeRecord, WorkDayConfig, NonWorkingDay } from '../types';

const STORAGE_KEYS = {
  INCOME_RECORDS: 'income_records',
  WORK_DAYS_CONFIG: 'work_days_config',
  NON_WORKING_DAYS: 'non_working_days'
};

// Función helper para guardar datos en localStorage
const saveToStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Función helper para obtener datos del localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Configuración por defecto de días laborables (solo domingo no laborable)
const defaultWorkDaysConfig: WorkDayConfig[] = Array.from({ length: 7 }, (_, i) => ({
  id: `day-${i}`,
  dayOfWeek: i,
  isWorkDay: i !== 0 // 0 es domingo
}));

// Funciones específicas para cada tipo de dato
export const saveIncomeRecords = (records: IncomeRecord[]): void => {
  saveToStorage(STORAGE_KEYS.INCOME_RECORDS, records);
};

export const getIncomeRecords = (): IncomeRecord[] => {
  return getFromStorage(STORAGE_KEYS.INCOME_RECORDS, []);
};

export const saveWorkDaysConfig = (config: WorkDayConfig[]): void => {
  saveToStorage(STORAGE_KEYS.WORK_DAYS_CONFIG, config);
};

export const getWorkDaysConfig = (): WorkDayConfig[] => {
  return getFromStorage(STORAGE_KEYS.WORK_DAYS_CONFIG, defaultWorkDaysConfig);
};

export const saveNonWorkingDays = (days: NonWorkingDay[]): void => {
  saveToStorage(STORAGE_KEYS.NON_WORKING_DAYS, days);
};

export const getNonWorkingDays = (): NonWorkingDay[] => {
  return getFromStorage(STORAGE_KEYS.NON_WORKING_DAYS, []);
}; 