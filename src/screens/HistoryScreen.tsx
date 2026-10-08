import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert as RNAlert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, CheckCircle2, AlertTriangle, Clock } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { formatDuration, calculateTimeToTarget } from '../utils/math';

export default function HistoryScreen() {
  const { events, activeBatch, batchStatus, internalTemp, ambientTemp, targetTemp, kCoefficient } = useStore();

  const generatePDF = async () => {
    const autonomy = calculateTimeToTarget(internalTemp, ambientTemp, targetTemp, kCoefficient);
    
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            h1 { color: #1e293b; font-size: 28px; }
            h2 { color: #475569; font-size: 18px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding: 12px 0; }
            .label { font-weight: bold; color: #64748b; }
            .value { font-weight: bold; color: #0f172a; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
            .status-ok { color: #22c55e; }
            .status-error { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>RO'Y</h1>
          <h2>Sistema Inteligente de Monitoreo de Cadena de Frío</h2>
          
          <div class="section">
            <div class="row"><span class="label">Establecimiento</span><span class="value">CAPS El Portón</span></div>
            <div class="row"><span class="label">Lote Monitorizado</span><span class="value">${activeBatch}</span></div>
            <div class="row"><span class="label">Fecha de Reporte</span><span class="value">${format(new Date(), 'dd/MM/yyyy HH:mm')}</span></div>
            <div class="row">
              <span class="label">Estado Final del Lote</span>
              <span class="value ${batchStatus === 'OK' ? 'status-ok' : 'status-error'}">${batchStatus === 'OK' ? '✓ SEGURO' : '⚠ AFECTADO (EXCURSIÓN)'}</span>
            </div>
          </div>

          <div class="section">
            <h3>Parámetros Térmicos Actuales</h3>
            <div class="row"><span class="label">Temperatura Interna</span><span class="value">${internalTemp.toFixed(1)} °C</span></div>
            <div class="row"><span class="label">Temperatura Ambiente</span><span class="value">${ambientTemp.toFixed(1)} °C</span></div>
            <div class="row"><span class="label">Límite Crítico</span><span class="value">${targetTemp.toFixed(1)} °C</span></div>
            <div class="row"><span class="label">Autonomía Estimada</span><span class="value">${formatDuration(autonomy)}</span></div>
            <div class="row"><span class="label">Coeficiente K</span><span class="value">${kCoefficient}</span></div>
          </div>

          <div class="section">
            <h3>Registro de Eventos (${events.length})</h3>
            ${events.map(e => `
              <div class="row" style="padding: 8px 0; font-size: 14px;">
                <span>${format(new Date(e.timestamp), 'HH:mm:ss')}</span>
                <span style="color: ${e.type === 'error' ? '#ef4444' : e.type === 'warning' ? '#f97316' : '#333'}">${e.message}</span>
              </div>
            `).join('')}
            ${events.length === 0 ? '<p>No se registraron eventos anómalos.</p>' : ''}
          </div>

          <div class="footer">
            Generado automáticamente por RO'Y App - ${format(new Date(), 'yyyy')}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      RNAlert.alert('Error', 'No se pudo generar el reporte PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.subtitle}>Lotes y eventos registrados</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <FileText color="#ffffff" size={24} />
          <Text style={styles.pdfButtonText}>GENERAR REPORTE PDF</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>LOTE ACTUAL</Text>
        <View style={styles.batchCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.batchId}>{activeBatch}</Text>
            {batchStatus === 'OK' ? (
              <View style={styles.statusBadgeOk}>
                <CheckCircle2 color="#15803d" size={16} />
                <Text style={styles.statusTextOk}>SEGURO</Text>
              </View>
            ) : (
              <View style={styles.statusBadgeError}>
                <AlertTriangle color="#b91c1c" size={16} />
                <Text style={styles.statusTextError}>AFECTADO</Text>
              </View>
            )}
          </View>
          <View style={styles.divider} />
          <Text style={styles.batchDetail}>Temp. máxima registrada: {internalTemp > 8.0 ? internalTemp.toFixed(1) : 5.8} °C</Text>
        </View>

        <Text style={styles.sectionTitle}>REGISTRO DE EVENTOS</Text>
        <View style={styles.timeline}>
          {events.length === 0 ? (
            <Text style={styles.emptyTimeline}>No hay eventos registrados en la sesión actual.</Text>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{format(new Date(event.timestamp), 'HH:mm')}</Text>
                </View>
                <View style={styles.lineCol}>
                  <View style={[
                    styles.dot,
                    event.type === 'error' ? { backgroundColor: '#ef4444' } :
                    event.type === 'warning' ? { backgroundColor: '#f97316' } :
                    event.type === 'success' ? { backgroundColor: '#22c55e' } : { backgroundColor: '#3b82f6' }
                  ]} />
                  <View style={styles.line} />
                </View>
                <View style={styles.contentCol}>
                  <Text style={[
                    styles.eventMessage,
                    event.type === 'error' && { color: '#ef4444', fontWeight: '700' }
                  ]}>
                    {event.message}
                  </Text>
                </View>
              </View>
            ))
          )}
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
    padding: 20,
    paddingBottom: 10,
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
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 12,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 16,
  },
  batchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batchId: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadgeOk: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTextOk: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadgeError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTextError: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  batchDetail: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  timeline: {
    paddingLeft: 8,
  },
  emptyTimeline: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timeCol: {
    width: 50,
    paddingTop: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  lineCol: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 4,
  },
  contentCol: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 24,
  },
  eventMessage: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  }
});
