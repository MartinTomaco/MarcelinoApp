export interface Driver {
  id: string;
  name: string;
  vehicleType: 'taxi' | 'remise';
  vehicleColor: string;
  active: boolean;
}

export interface TransactionRecord {
  id: string;
  driverId: string;
  date: Date;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  notes?: string;
}

// Mantener compatibilidad con el código existente
export interface IncomeRecord {
  id: string;
  driverId: string;
  date: Date;
  amount: number;
  notes?: string;
}

export interface WorkDayConfig {
  id: string;
  dayOfWeek: number; // 0-6 (Domingo-Sábado)
  isWorkDay: boolean;
}

export interface NonWorkingDay {
  id: string;
  date: Date;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  averageDailyIncome: number;
  averageDailyExpenses: number;
  totalWorkDays: number;
  incomeByDay: { [key: string]: number };
  expensesByDay: { [key: string]: number };
  incomeByDriver: { [key: string]: number };
  expensesByDriver: { [key: string]: number };
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
} 