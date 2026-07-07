import { Keyboard } from 'react-native';

export async function dismissKeyboardAndWait(): Promise<void> {
  Keyboard.dismiss();
  await new Promise<void>(resolve => setTimeout(resolve, 150));
}
