import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PowerOff, LockOpen, Flame, Zap, FastForward, Settings } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { calculateTimeToTarget, formatDuration } from '../utils/math';

export default function DemoScreen() {
  const { 
    setPowerStatus, 
    setLidStatus,
    setInternalTemp,
    addAlert,
    addEvent,
    resetToNormal,
    simulationSpeed,
    setSimulationSpeed,
    internalTemp,
    ambientTemp,
    targetTemp,
    kCoefficient
  } = useStore();

  const handleSimulateOutage = () => {
    setPowerStatus('OUTAGE');
    const autonomy = calculateTimeToTarget(internalTemp, ambientTemp, targetTemp, kCoefficient);
    addAlert({
      type: 'INFO',
      title: 'Corte de luz detectado',
      message: `Autonomía inicial estimada: ${formatDuration(autonomy)}.`
    });
    addEvent({ message: 'Corte eléctrico simulado', type: 'error' });
  };

  const handleSimulateLid = () => {
    setLidStatus('OPEN');
    addEvent({ message: 'Apertura de tapa simulada', type: 'warning' });
  };

  const handleSimulateExcursion = () => {
    setInternalTemp(8.2);
    addEvent({ message: 'Excursión térmica forzada', type: 'error' });
  };

  const speeds = [1, 10, 60, 300];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>MODO DEMO</Text>
          <Text style={styles.subtitle}>Panel de control para presentación</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SIMULACIÓN DE EVENTOS</Text>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1e293b' }]} onPress={handleSimulateOutage}>
            <PowerOff color="#fff" size={24} />
            <Text style={styles.actionBtnText}>SIMULAR CORTE DE LUZ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f97316' }]} onPress={handleSimulateLid}>
            <LockOpen color="#fff" size={24} />
            <Text style={styles.actionBtnText}>SIMULAR TAPA ABIERTA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={handleSimulateExcursion}>
            <Flame color="#fff" size={24} />
            <Text style={styles.actionBtnText}>SIMULAR EXCURSIÓN TÉRMICA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#22c55e' }]} onPress={resetToNormal}>
            <Zap color="#fff" size={24} />
            <Text style={styles.actionBtnText}>RESTABLECER RED NORMAL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <FastForward color="#64748b" size={20} />
            <Text style={styles.sectionTitle}>VELOCIDAD DE SIMULACIÓN</Text>
          </View>
          
          <View style={styles.speedContainer}>
            {speeds.map(s => (
              <TouchableOpacity 
                key={s} 
                style={[styles.speedBtn, simulationSpeed === s && styles.speedBtnActive]}
                onPress={() => setSimulationSpeed(s)}
              >
                <Text style={[styles.speedText, simulationSpeed === s && styles.speedTextActive]}>×{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>Actual: SIMULACIÓN ×{simulationSpeed}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Settings color="#64748b" size={20} />
            <Text style={styles.sectionTitle}>PARÁMETROS TÉCNICOS</Text>
          </View>
          <View style={styles.paramCard}>
            <Text style={styles.paramText}>Temp. Inicial: {internalTemp.toFixed(1)} °C</Text>
            <Text style={styles.paramText}>Temp. Ambiente: {ambientTemp.toFixed(1)} °C</Text>
            <Text style={styles.paramText}>Temp. Objetivo: {targetTemp.toFixed(1)} °C</Text>
            <Text style={styles.paramText}>Coeficiente K: {kCoefficient}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  speedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speedBtn: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  speedBtnActive: {
    backgroundColor: '#2563eb',
  },
  speedText: {
    fontWeight: '700',
    color: '#475569',
  },
  speedTextActive: {
    color: '#ffffff',
  },
  helpText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  paramCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paramText: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 8,
    fontWeight: '500',
  }
});
