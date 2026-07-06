import { createMMKV } from 'react-native-mmkv';

const authStorage = createMMKV({ id: 'auth-persistence' });

export const mmkvStorageAdapter = {
  setItem: (key: string, value: string): Promise<void> => {
    authStorage.set(key, value);
    return Promise.resolve();
  },
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve(authStorage.getString(key) ?? null);
  },
  removeItem: (key: string): Promise<void> => {
    authStorage.remove(key);
    return Promise.resolve();
  },
};
