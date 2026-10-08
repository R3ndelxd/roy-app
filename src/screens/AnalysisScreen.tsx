import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Info } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { calculateTimeToTarget, formatDuration } from '../utils/math';

const screenWidth = Dimensions.get('window').width;

export default function AnalysisScreen() {
  const { internalTemp, ambientTemp, targetTemp, kCoefficient } = useStore();

  const autonomyMinutes = calculateTimeToTarget(internalTemp, ambientTemp, targetTemp, kCoefficient);

  // Generate chart data based on Newton's Law of Cooling
  const chartData = useMemo(() => {
    const labels = [];
    const dataset = [];
    const limitLine = [];
    
    // Plot for the next 5 hours (300 minutes), points every 60 minutes
    for (let t = 0; t <= 300; t += 60) {
      labels.push(`${t / 60}h`);
      
      // T(t) = Tamb + (T0 - Tamb) * e^(-K*t)
      const tempAtT = ambientTemp + (internalTemp - ambientTemp) * Math.exp(-kCoefficient * t);
      dataset.push(tempAtT);
      limitLine.push(targetTemp);
    }
    
    return {
      labels,
      datasets: [
        {
          data: dataset,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue line for prediction
          strokeWidth: 3
        },
        {
          data: limitLine,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red line for limit
          strokeWidth: 2,
          withDots: false,
        }
      ],
      legend: ['Predicción', 'Límite Crítico']
    };
  }, [internalTemp, ambientTemp, targetTemp, kCoefficient]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Análisis Térmico</Text>
          <Text style={styles.subtitle}>Predicción de autonomía térmica</Text>
        </View>

        <View style={styles.chartCard}>
          <LineChart
            data={chartData}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#ffffff'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.row}>
            <Info color="#3b82f6" size={24} />
            <Text style={styles.infoTitle}>Ley de Enfriamiento de Newton</Text>
          </View>
          <Text style={styles.infoText}>
            La curva predice la temperatura interna utilizando T(t) = Tamb + (T0 - Tamb) * e^(-K*t). 
            El coeficiente K se calibra experimentalmente para representar la capacidad aislante de la conservadora.
          </Text>
        </View>

        <View style={styles.paramsContainer}>
          <Text style={styles.sectionTitle}>PARÁMETROS DEL MODELO</Text>
          
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Temperatura actual (T0)</Text>
            <Text style={styles.paramValue}>{internalTemp.toFixed(1)} °C</Text>
          </View>
          
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Temperatura ambiente (Tamb)</Text>
            <Text style={styles.paramValue}>{ambientTemp.toFixed(1)} °C</Text>
          </View>
          
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Límite crítico (Tobjetivo)</Text>
            <Text style={styles.paramValue}>{targetTemp.toFixed(1)} °C</Text>
          </View>
          
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Coeficiente K</Text>
            <Text style={styles.paramValue}>{kCoefficient}</Text>
          </View>

          <View style={[styles.paramRow, styles.highlightRow]}>
            <Text style={styles.paramLabelHighlight}>Tiempo estimado hasta límite</Text>
            <Text style={styles.paramValueHighlight}>{formatDuration(autonomyMinutes)}</Text>
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
  header: {
    marginBottom: 24,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
    marginLeft: 8,
  },
  infoText: {
    color: '#1e3a8a',
    lineHeight: 22,
    fontSize: 14,
  },
  paramsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 16,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  highlightRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  paramLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  paramValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '700',
  },
  paramLabelHighlight: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '700',
  },
  paramValueHighlight: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '800',
  }
});
