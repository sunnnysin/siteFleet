export type SupplierId = 'ravindra' | 'mrIndustries' | 'minni';

export type SupplierGroup = 'hilalpur' | 'goraul';

export interface SupplierProfile {
  id: SupplierId;
  label: string;
  name: string;
  summaryTitle: string;
  panNumber: string;
  accountNumber: string;
  ifscCode: string;
  aadharNumber: string;
}

export const SUPPLIER_PROFILES: Record<SupplierId, SupplierProfile> = {
  ravindra: {
    id: 'ravindra',
    label: 'Ravindra Kumar Singh',
    name: 'RAVINDRA KUMAR SINGH',
    summaryTitle: 'RAVINDRA KUMAR SINGH',
    panNumber: 'ELQPS3865C',
    accountNumber: '6016002100003104',
    ifscCode: 'PUNB0601600',
    aadharNumber: '2584 7795 3161',
  },
  mrIndustries: {
    id: 'mrIndustries',
    label: 'MR. Industries',
    name: 'MR. INDUSTRIES',
    summaryTitle: 'MR. INDUSTRIES',
    panNumber: 'NOMPS3118J',
    accountNumber: '6016002100004334',
    ifscCode: 'PUNB0601600',
    aadharNumber: '9246 1996 0950',
  },
  minni: {
    id: 'minni',
    label: 'Minni Kumari',
    name: 'MINNI KUMARI',
    summaryTitle: 'Mini TRANSPORT',
    panNumber: 'CKLPK4604F',
    accountNumber: '6016002100003089',
    ifscCode: 'PUNB0601600',
    aadharNumber: '799595576883',
  },
};

export const SUPPLIER_IDS_BY_GROUP: Record<SupplierGroup, SupplierId[]> = {
  hilalpur: ['ravindra', 'mrIndustries'],
  goraul: ['minni', 'ravindra', 'mrIndustries'],
};

export const DEFAULT_SUPPLIER_ID_BY_GROUP: Record<SupplierGroup, SupplierId> = {
  hilalpur: 'ravindra',
  goraul: 'minni',
};
