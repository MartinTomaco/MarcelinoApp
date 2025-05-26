export interface Driver {
  id: string;
  name: string;
  vehicleType: 'taxi' | 'remise';
  active: boolean;
}

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
  averageDailyIncome: number;
  totalWorkDays: number;
  incomeByDay: { [key: string]: number };
} 