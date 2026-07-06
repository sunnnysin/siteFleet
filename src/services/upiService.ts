import { Linking } from 'react-native';
import { DEFAULT_CURRENCY } from '@/theme/colors';

export function buildUpiDeepLink(
  upiId: string,
  driverName: string,
  amount: number,
): string {
  const params: Record<string, string> = {
    pa: upiId,
    pn: driverName,
    am: amount.toFixed(2),
    cu: DEFAULT_CURRENCY,
  };
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `upi://pay?${queryString}`;
}

export async function openUpiPayment(
  upiId: string,
  driverName: string,
  amount: number,
): Promise<void> {
  const deepLink = buildUpiDeepLink(upiId, driverName, amount);
  const canOpen = await Linking.canOpenURL(deepLink);
  if (!canOpen) {
    throw new Error('No UPI app is available to handle this payment');
  }
  await Linking.openURL(deepLink);
}

export interface UpiApp {
  id: string;
  label: string;
  scheme: string;
}

// Schemes as documented/observed for each app's own UPI deep link intent.
// CRED's scheme is not officially published the way GPay/PhonePe/Paytm's are,
// so it's best-effort — verify on a real device before relying on it.
export const UPI_APPS: UpiApp[] = [
  { id: 'gpay', label: 'Google Pay', scheme: 'gpay' },
  { id: 'phonepe', label: 'PhonePe', scheme: 'phonepe' },
  { id: 'paytm', label: 'Paytm', scheme: 'paytmmp' },
  { id: 'cred', label: 'CRED', scheme: 'credpay' },
];

function buildUpiAppDeepLink(
  app: UpiApp,
  upiId: string,
  payeeName: string,
  amount: number,
  note: string,
): string {
  const params: Record<string, string> = {
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: DEFAULT_CURRENCY,
    tn: note,
  };
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `${app.scheme}://upi/pay?${queryString}`;
}

export interface UpiAppOption {
  app: UpiApp;
  url: string;
}

export async function fetchAvailableUpiApps(
  upiId: string,
  payeeName: string,
  amount: number,
  note: string,
): Promise<UpiAppOption[]> {
  const options = await Promise.all(
    UPI_APPS.map(async app => {
      const url = buildUpiAppDeepLink(app, upiId, payeeName, amount, note);
      const canOpen = await Linking.canOpenURL(url);
      return canOpen ? { app, url } : null;
    }),
  );
  return options.filter((option): option is UpiAppOption => option !== null);
}

export async function openUpiAppDeepLink(url: string): Promise<void> {
  await Linking.openURL(url);
}
