export const calculateTimeToTarget = (
  currentTemp: number, 
  ambientTemp: number, 
  targetTemp: number, 
  kCoefficient: number
): number | null => {
  if (currentTemp >= targetTemp) return 0;
  if (ambientTemp <= targetTemp) return null; // Will never reach target if ambient is colder

  // t = -ln((Tobjetivo - Tamb)/(T0 - Tamb)) / K
  // result in minutes
  const t = -Math.log((targetTemp - ambientTemp) / (currentTemp - ambientTemp)) / kCoefficient;
  return t;
};

export const formatDuration = (minutes: number | null): string => {
  if (minutes === null) return '--h --m';
  if (minutes <= 0) return '00h 00m';
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
};
