/**
 * PIN Management for Finance Portal Access
 */

const PIN_STORAGE_KEY = 'reimburse_finance_pin';
const PIN_SESSION_KEY = 'reimburse_finance_unlocked';
const DEFAULT_PIN = '1234';

export const getStoredPin = (): string => {
  try {
    const pin = localStorage.getItem(PIN_STORAGE_KEY);
    return pin && pin.length >= 4 ? pin : DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
};

export const setStoredPin = (newPin: string): boolean => {
  if (newPin && newPin.length >= 4 && /^\d+$/.test(newPin)) {
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    return true;
  }
  return false;
};

export const isFinanceUnlocked = (): boolean => {
  try {
    return sessionStorage.getItem(PIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const unlockFinanceSession = (): void => {
  try {
    sessionStorage.setItem(PIN_SESSION_KEY, 'true');
  } catch {
    // Ignore error
  }
};

export const lockFinanceSession = (): void => {
  try {
    sessionStorage.removeItem(PIN_SESSION_KEY);
  } catch {
    // Ignore error
  }
};
