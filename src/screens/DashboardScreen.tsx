import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Thermometer, Battery, ThermometerSun, AlertTriangle, BatteryWarning, LockOpen, Lock } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { calculateTimeToTarget, formatDuration } from '../utils/math';

export default function DashboardScreen() {
  const { 
    internalTemp, 
    ambientTemp, 
    powerStatus, 
    lidStatus, 
    lidOpenSeconds,
    targetTemp,
    kCoefficient,
    updateTick
  } = useStore();

  useEffect(() => {
    const interval = setInterval(() => {
      updateTick(1); // 1 second real time
    }, 1000);
    return () => clearInterval(interval);
  }, [updateTick]);

  const autonomyMinutes = calculateTimeToTarget(internalTemp, ambientTemp, targetTemp, kCoefficient);
  
  // Status logic
  const isTempCritical = internalTemp >= targetTemp;
  const isPowerOutage = powerStatus === 'OUTAGE';
  
  const getAutonomyStatus = () => {
    if (autonomyMinutes === null) return 'Seguro';
    if (autonomyMinutes <= 0) return 'LÍMITE SUPERADO';
    if (autonomyMinutes < 60) return 'Crítico';
    if (autonomyMinutes < 180) return 'Advertencia';
    return 'Seguro';
  };

  const autonomyStatus = getAutonomyStatus();
  
  const getAutonomyColor = () => {
    if (autonomyStatus === 'LÍMITE SUPERADO' || autonomyStatus === 'Crítico') return '#ef4444';
    if (autonomyStatus === 'Advertencia') return '#f97316';
    return '#22c55e';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>RO'Y</Text>
          <Text style={styles.subtitle}>Monitoreo Inteligente de Cadena de Frío</Text>
        </View>

        <View style={styles.systemStatusContainer}>
          <ShieldCheck size={20} color={isTempCritical ? '#ef4444' : '#22c55e'} />
          <Text style={[styles.systemStatusText, { color: isTempCritical ? '#ef4444' : '#22c55e' }]}>
            {isTempCritical ? 'SISTEMA CRÍTICO' : 'SISTEMA OPERATIVO'}
          </Text>
        </View>

        {/* Autonomy Card - Most Important */}
        <View style={[styles.card, styles.primaryCard, { borderColor: getAutonomyColor(), borderWidth: 2 }]}>
          <Text style={styles.cardLabelDark}>AUTONOMÍA TÉRMICA</Text>
          <Text style={[styles.mainValueDark, { color: getAutonomyColor() }]}>
            {formatDuration(autonomyMinutes)}
          </Text>
          <Text style={styles.cardSubDark}>Autonomía restante estimada</Text>
          <Text style={styles.cardSubDark}>Tiempo hasta superar {targetTemp} °C</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.cardSubDark}>Temp. actual: {internalTemp.toFixed(1)} °C</Text>
            <Text style={styles.cardSubDark}>Límite: {targetTemp} °C</Text>
          </View>
        </View>

        {/* Internal Temp */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Thermometer size={24} color="#3b82f6" />
            <Text style={styles.cardLabel}>TEMPERATURA INTERNA</Text>
          </View>
          <Text style={styles.mainValue}>{internalTemp.toFixed(1)} °C</Text>
          {isTempCritical ? (
            <Text style={[styles.statusText, { color: '#ef4444' }]}>✗ Excursión térmica</Text>
          ) : (
            <Text style={[styles.statusText, { color: '#22c55e' }]}>✓ Temperatura segura</Text>
          )}
        </View>

        <View style={styles.rowContainer}>
          {/* Ambient Temp */}
          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.row}>
              <ThermometerSun size={20} color="#64748b" />
              <Text style={styles.cardLabelSmall}>AMBIENTE</Text>
            </View>
            <Text style={styles.valueSmall}>{ambientTemp.toFixed(1)} °C</Text>
          </View>

          {/* Lid Status */}
          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.row}>
              {lidStatus === 'OPEN' ? <LockOpen size={20} color="#f97316" /> : <Lock size={20} color="#22c55e" />}
              <Text style={styles.cardLabelSmall}>TAPA</Text>
            </View>
            {lidStatus === 'OPEN' ? (
              <View>
                <Text style={[styles.valueSmall, { color: '#f97316' }]}>ABIERTA</Text>
                <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>{Math.floor(lidOpenSeconds)}s</Text>
              </View>
            ) : (
              <Text style={[styles.valueSmall, { color: '#22c55e' }]}>CERRADA</Text>
            )}
          </View>
        </View>

        {/* Power Status */}
        <View style={styles.card}>
          <View style={styles.row}>
            {isPowerOutage ? <BatteryWarning size={24} color="#ef4444" /> : <Battery size={24} color="#22c55e" />}
            <Text style={styles.cardLabel}>ENERGÍA</Text>
          </View>
          <Text style={[styles.valueMedium, { color: isPowerOutage ? '#ef4444' : '#22c55e' }]}>
            {isPowerOutage ? '🔴 CORTE DETECTADO' : '🟢 RED ELÉCTRICA'}
          </Text>
          <Text style={styles.cardSub}>
            {isPowerOutage ? 'Funcionando con batería/solar' : 'Normal'}
          </Text>
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
    marginBottom: 20,
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
  systemStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  systemStatusText: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: '#1e293b',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfCard: {
    width: '47%',
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 8,
    letterSpacing: 1,
  },
  cardLabelSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  cardLabelDark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0f172a',
  },
  mainValueDark: {
    fontSize: 54,
    fontWeight: '800',
    marginBottom: 8,
  },
  valueMedium: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
  },
  valueSmall: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  cardSubDark: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
});
