
import { useState, useEffect } from 'react';

export function useCooldown(key: string, duration: number = 60) {
  const storageKey = `cooldown_${key}`;
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const savedEndTime = localStorage.getItem(storageKey);
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10);
      const now = Date.now();
      if (endTime > now) {
        setCooldown(Math.ceil((endTime - now) / 1000));
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const startCooldown = (customDuration?: number) => {
    const secs = customDuration || duration;
    const endTime = Date.now() + secs * 1000;
    localStorage.setItem(storageKey, endTime.toString());
    setCooldown(secs);
  };

  return { cooldown, startCooldown };
}
