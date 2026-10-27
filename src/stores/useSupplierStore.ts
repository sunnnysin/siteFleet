import { create } from 'zustand';
import {
  DEFAULT_SUPPLIER_ID_BY_GROUP,
  type SupplierGroup,
  type SupplierId,
} from '@/types/supplier';

interface SupplierState {
  selectedSupplierIds: Record<SupplierGroup, SupplierId>;
  setSelectedSupplierId: (group: SupplierGroup, supplierId: SupplierId) => void;
}

export const useSupplierStore = create<SupplierState>(set => ({
  selectedSupplierIds: DEFAULT_SUPPLIER_ID_BY_GROUP,
  setSelectedSupplierId: (group, supplierId) =>
    set(state => ({
      selectedSupplierIds: {
        ...state.selectedSupplierIds,
        [group]: supplierId,
      },
    })),
}));
