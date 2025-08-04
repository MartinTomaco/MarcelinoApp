import { IncomeRecord, WorkDayConfig, NonWorkingDay, TransactionRecord, Driver, ExpenseCategory } from '../types';

const STORAGE_KEYS = {
  INCOME_RECORDS: 'income_records',
  TRANSACTION_RECORDS: 'transaction_records',
  WORK_DAYS_CONFIG: 'work_days_config',
  NON_WORKING_DAYS: 'non_working_days',
  DRIVERS: 'drivers',
  EXPENSE_CATEGORIES: 'expense_categories'
};

// Función helper para guardar datos en localStorage
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error al guardar en localStorage (${key}):`, error);
    // Si el error es por cuota excedida, intentamos limpiar datos antiguos
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        localStorage.clear();
        localStorage.setItem(key, JSON.stringify(data));
      } catch (retryError) {
        console.error('Error al intentar recuperar espacio en localStorage:', retryError);
      }
    }
  }
};

// Función helper para obtener datos del localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error(`Error al parsear datos de localStorage (${key}):`, parseError);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error al leer de localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Configuración por defecto de días laborables (solo domingo no laborable)
const defaultWorkDaysConfig: WorkDayConfig[] = Array.from({ length: 7 }, (_, i) => ({
  id: `day-${i}`,
  dayOfWeek: i,
  isWorkDay: i !== 0 // 0 es domingo
}));

// Conductor por defecto
const defaultDrivers: Driver[] = [{
  id: '1',
  name: 'Conductor Principal',
  vehicleType: 'taxi',
  vehicleColor: '#1976d2',
  active: true
}];

// Categorías de gastos por defecto
const defaultExpenseCategories: ExpenseCategory[] = [
  { id: '1', name: 'Combustible', color: '#f44336' },
  { id: '2', name: 'Mantenimiento', color: '#ff9800' },
  { id: '3', name: 'Seguro', color: '#9c27b0' },
  { id: '4', name: 'Licencias', color: '#2196f3' },
  { id: '5', name: 'Cochera', color: '#4caf50' },
  { id: '6', name: 'VTV', color: '#795548' },
  { id: '7', name: 'Otros', color: '#607d8b' }
];

// Funciones específicas para cada tipo de dato
export const saveIncomeRecords = (records: IncomeRecord[]): void => {
  saveToStorage(STORAGE_KEYS.INCOME_RECORDS, records);
};

export const getIncomeRecords = (): IncomeRecord[] => {
  try {
    const records = getFromStorage<(Omit<IncomeRecord, 'date'> & { date: string })[]>(STORAGE_KEYS.INCOME_RECORDS, []);
    return records.map(record => ({
      ...record,
      date: new Date(record.date)
    }));
  } catch (error) {
    console.error('Error al obtener registros de ingresos:', error);
    return [];
  }
};

// Nuevas funciones para transacciones
export const saveTransactionRecords = (records: TransactionRecord[]): void => {
  saveToStorage(STORAGE_KEYS.TRANSACTION_RECORDS, records);
};

export const getTransactionRecords = (): TransactionRecord[] => {
  try {
    const records = getFromStorage<(Omit<TransactionRecord, 'date'> & { date: string })[]>(STORAGE_KEYS.TRANSACTION_RECORDS, []);
    return records.map(record => ({
      ...record,
      date: new Date(record.date)
    }));
  } catch (error) {
    console.error('Error al obtener registros de transacciones:', error);
    return [];
  }
};

// Funciones para conductores
export const saveDrivers = (drivers: Driver[]): void => {
  saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
};

export const getDrivers = (): Driver[] => {
  try {
    return getFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, defaultDrivers);
  } catch (error) {
    console.error('Error al obtener conductores:', error);
    return defaultDrivers;
  }
};

// Funciones para categorías de gastos
export const saveExpenseCategories = (categories: ExpenseCategory[]): void => {
  saveToStorage(STORAGE_KEYS.EXPENSE_CATEGORIES, categories);
};

export const getExpenseCategories = (): ExpenseCategory[] => {
  try {
    return getFromStorage<ExpenseCategory[]>(STORAGE_KEYS.EXPENSE_CATEGORIES, defaultExpenseCategories);
  } catch (error) {
    console.error('Error al obtener categorías de gastos:', error);
    return defaultExpenseCategories;
  }
};

export const saveWorkDaysConfig = (config: WorkDayConfig[]): void => {
  saveToStorage(STORAGE_KEYS.WORK_DAYS_CONFIG, config);
};

export const getWorkDaysConfig = (): WorkDayConfig[] => {
  try {
    return getFromStorage<WorkDayConfig[]>(STORAGE_KEYS.WORK_DAYS_CONFIG, defaultWorkDaysConfig);
  } catch (error) {
    console.error('Error al obtener configuración de días laborables:', error);
    return [];
  }
};

export const saveNonWorkingDays = (days: NonWorkingDay[]): void => {
  saveToStorage(STORAGE_KEYS.NON_WORKING_DAYS, days);
};

export const getNonWorkingDays = (): NonWorkingDay[] => {
  try {
    const days = getFromStorage<(Omit<NonWorkingDay, 'date'> & { date: string })[]>(STORAGE_KEYS.NON_WORKING_DAYS, []);
    return days.map(day => ({
      ...day,
      date: new Date(day.date)
    }));
  } catch (error) {
    console.error('Error al obtener días no laborables:', error);
    return [];
  }
};

// Función para generar un respaldo de todos los datos
export const generateBackup = (): string => {
  const backup = {
    income_records: getIncomeRecords(),
    transaction_records: getTransactionRecords(),
    work_days_config: getWorkDaysConfig(),
    non_working_days: getNonWorkingDays(),
    drivers: getDrivers(),
    expense_categories: getExpenseCategories(),
    timestamp: new Date().toISOString()
  };
  return JSON.stringify(backup, null, 2);
};

// Función para restaurar datos desde un respaldo
export const restoreFromBackup = (backupString: string): boolean => {
  try {
    const backup = JSON.parse(backupString);
    
    // Validar que el respaldo tenga la estructura correcta
    if (!backup.income_records || !backup.work_days_config || !backup.non_working_days) {
      throw new Error('Formato de respaldo inválido');
    }

    // Restaurar los datos
    saveIncomeRecords(backup.income_records);
    if (backup.transaction_records) {
      saveTransactionRecords(backup.transaction_records);
    }
    saveWorkDaysConfig(backup.work_days_config);
    saveNonWorkingDays(backup.non_working_days);
    if (backup.drivers) {
      saveDrivers(backup.drivers);
    }
    if (backup.expense_categories) {
      saveExpenseCategories(backup.expense_categories);
    }

    return true;
  } catch (error) {
    console.error('Error al restaurar el respaldo:', error);
    return false;
  }
}; 