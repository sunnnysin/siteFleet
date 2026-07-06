import { create } from 'zustand';
import { currentMonthKey, todayKey } from '@/utils/dateUtils';

export type BusinessModule = 'transport';

interface TransportState {
  activeModule: BusinessModule;
  selectedDate: string;
  selectedMonth: string;
  setSelectedDate: (selectedDate: string) => void;
  setSelectedMonth: (selectedMonth: string) => void;
}

export const useTransportStore = create<TransportState>(set => ({
  activeModule: 'transport',
  selectedDate: todayKey(),
  selectedMonth: currentMonthKey(),
  setSelectedDate: selectedDate => set({ selectedDate }),
  setSelectedMonth: selectedMonth => set({ selectedMonth }),
}));
