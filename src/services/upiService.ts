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
