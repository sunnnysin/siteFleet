import { SelectField } from '@/components/SelectField';
import { useSupplierStore } from '@/stores/useSupplierStore';
import {
  SUPPLIER_IDS_BY_GROUP,
  SUPPLIER_PROFILES,
  type SupplierGroup,
  type SupplierId,
} from '@/types/supplier';

interface SupplierSelectorProps {
  group: SupplierGroup;
}

export function SupplierSelector({ group }: SupplierSelectorProps) {
  const selectedSupplierId = useSupplierStore(
    state => state.selectedSupplierIds[group],
  );
  const setSelectedSupplierId = useSupplierStore(
    state => state.setSelectedSupplierId,
  );
  const supplierIds = SUPPLIER_IDS_BY_GROUP[group];

  function handleChange(value: string): void {
    const matchedId = supplierIds.find(
      (supplierId: SupplierId) => supplierId === value,
    );
    if (matchedId !== undefined) {
      setSelectedSupplierId(group, matchedId);
    }
  }

  return (
    <SelectField
      label="Supplier"
      options={supplierIds.map(supplierId => ({
        label: SUPPLIER_PROFILES[supplierId].label,
        value: supplierId,
      }))}
      value={selectedSupplierId}
      onChange={handleChange}
    />
  );
}
