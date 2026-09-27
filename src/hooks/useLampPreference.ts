import { useCallback, useState } from 'react';
import { LAMP_STORAGE_KEY, START_LIGHTS_OFF } from '../config';

function readSaved(): boolean {
  try {
    const v = window.localStorage.getItem(LAMP_STORAGE_KEY);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {
    /* storage blocked: fall back to the config default */
  }
  return START_LIGHTS_OFF;
}

function save(off: boolean) {
  try {
    window.localStorage.setItem(LAMP_STORAGE_KEY, off ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/**
 * Lights on/off, remembered across visits (a boolean in localStorage). A restored "off"
 * applies without the flicker; toggling off flickers.
 */
export function useLampPreference() {
  const [lightsOff, setLightsOff] = useState(readSaved);
  const [flicker, setFlicker] = useState(false);

  const toggle = useCallback(() => {
    setFlicker(true);
    setLightsOff((off) => {
      save(!off);
      return !off;
    });
  }, []);

  return { lightsOff, flicker, toggle };
}
