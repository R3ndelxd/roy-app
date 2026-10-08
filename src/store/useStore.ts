import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlertType = 'CRITICAL' | 'WARNING' | 'INFO';
export type Alert = { id: string; type: AlertType; message: string; title: string; timestamp: number; read: boolean };
export type EventRecord = { id: string; timestamp: number; message: string; type: 'success' | 'info' | 'warning' | 'error' };

interface AppState {
  // Sensor Data
  internalTemp: number;
  ambientTemp: number;
  powerStatus: 'OK' | 'OUTAGE';
  lidStatus: 'CLOSED' | 'OPEN';
  lidOpenSeconds: number;
  
  // Math Params
  targetTemp: number;
  kCoefficient: number;
  
  // Demo Data
  simulationSpeed: number; // multiplier
  activeBatch: string;
  batchStatus: 'OK' | 'AFFECTED';
  
  // Lists
  alerts: Alert[];
  events: EventRecord[];
  
  // Actions
  setInternalTemp: (temp: number) => void;
  setAmbientTemp: (temp: number) => void;
  setPowerStatus: (status: 'OK' | 'OUTAGE') => void;
  setLidStatus: (status: 'CLOSED' | 'OPEN') => void;
  incrementLidTimer: (seconds: number) => void;
  setSimulationSpeed: (speed: number) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  addEvent: (event: Omit<EventRecord, 'id' | 'timestamp'>) => void;
  markAlertRead: (id: string) => void;
  deleteAlert: (id: string) => void;
  setBatchStatus: (status: 'OK' | 'AFFECTED') => void;
  resetToNormal: () => void;
  updateTick: (deltaTime: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  internalTemp: 4.2,
  ambientTemp: 32.0,
  powerStatus: 'OK',
  lidStatus: 'CLOSED',
  lidOpenSeconds: 0,
  
  targetTemp: 8.0,
  kCoefficient: 0.0035,
  
  simulationSpeed: 1,
  activeBatch: '2026-A1',
  batchStatus: 'OK',
  
  alerts: [],
  events: [],
  
  setInternalTemp: (temp) => set({ internalTemp: temp }),
  setAmbientTemp: (temp) => set({ ambientTemp: temp }),
  setPowerStatus: (status) => set({ powerStatus: status }),
  setLidStatus: (status) => set({ lidStatus: status, lidOpenSeconds: status === 'CLOSED' ? 0 : get().lidOpenSeconds }),
  incrementLidTimer: (seconds) => set((state) => ({ lidOpenSeconds: state.lidOpenSeconds + seconds })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  
  addAlert: (alertData) => {
    const newAlert: Alert = { ...alertData, id: Math.random().toString(), timestamp: Date.now(), read: false };
    set((state) => ({ alerts: [newAlert, ...state.alerts] }));
  },
  
  addEvent: (eventData) => {
    const newEvent: EventRecord = { ...eventData, id: Math.random().toString(), timestamp: Date.now() };
    set((state) => {
      const events = [newEvent, ...state.events];
      // AsyncStorage.setItem('roy_events', JSON.stringify(events)); // Simple persistence
      return { events };
    });
  },
  
  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a)
  })),
  
  deleteAlert: (id) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== id)
  })),
  
  setBatchStatus: (status) => set({ batchStatus: status }),
  
  resetToNormal: () => {
    get().addEvent({ message: 'Sistema restablecido a normal', type: 'success' });
    set({
      internalTemp: 4.2,
      powerStatus: 'OK',
      lidStatus: 'CLOSED',
      lidOpenSeconds: 0,
      batchStatus: 'OK',
      ambientTemp: 32.0
    });
  },
  
  updateTick: (deltaTimeSeconds) => {
    const state = get();
    const dt = deltaTimeSeconds * state.simulationSpeed; // effective time in seconds
    let newTemp = state.internalTemp;
    let newLidSeconds = state.lidOpenSeconds;
    let batchStatus = state.batchStatus;

    if (state.powerStatus === 'OUTAGE' || state.lidStatus === 'OPEN') {
      // Apply Newton's cooling
      // T(t) = Tamb + (T0 - Tamb) * e^(-K*t)
      // Since dt is small, we can approximate or use exact difference over dt
      // Convert dt to minutes for K=0.0035 (assuming K is in min^-1 based on context: 4h15m = 255 mins. t = -ln((8-32)/(4.2-32))/0.0035 = 42.5 minutes? 
      // Let's assume K is defined per minute.
      const dtMin = dt / 60;
      newTemp = state.ambientTemp + (state.internalTemp - state.ambientTemp) * Math.exp(-state.kCoefficient * dtMin);
    }
    
    if (state.powerStatus === 'OK' && state.lidStatus === 'CLOSED' && state.internalTemp > 4.2) {
      // Cool down to 4.2
      const dtMin = dt / 60;
      newTemp = 4.2 + (state.internalTemp - 4.2) * Math.exp(-0.05 * dtMin); // arbitrary cooling coefficient
    }

    if (state.lidStatus === 'OPEN') {
      newLidSeconds += dt;
      if (newLidSeconds >= 90 && state.lidOpenSeconds < 90) {
        state.addAlert({
          title: 'ADVERTENCIA',
          message: 'Tapa abierta durante 90 segundos.',
          type: 'WARNING'
        });
        state.addEvent({ message: 'Tapa abierta > 90s', type: 'warning' });
      }
    }
    
    if (newTemp >= state.targetTemp && state.internalTemp < state.targetTemp) {
      state.addAlert({
        title: 'URGENTE',
        message: 'Límite de temperatura superado (8 °C).',
        type: 'CRITICAL'
      });
      state.addEvent({ message: `Temperatura excedió ${state.targetTemp}°C`, type: 'error' });
      batchStatus = 'AFFECTED';
    }

    set({ internalTemp: newTemp, lidOpenSeconds: newLidSeconds, batchStatus });
  }
}));
