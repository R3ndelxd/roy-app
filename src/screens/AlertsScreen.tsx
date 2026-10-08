import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Trash2 } from 'lucide-react-native';
import { useStore, AlertType } from '../store/useStore';
import { format } from 'date-fns';

export default function AlertsScreen() {
  const { alerts, markAlertRead, deleteAlert } = useStore();

  const getIcon = (type: AlertType) => {
    switch(type) {
      case 'CRITICAL': return <AlertCircle color="#ef4444" size={24} />;
      case 'WARNING': return <AlertTriangle color="#f97316" size={24} />;
      case 'INFO': return <Info color="#3b82f6" size={24} />;
    }
  };

  const getColor = (type: AlertType) => {
    switch(type) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f97316';
      case 'INFO': return '#3b82f6';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alertas</Text>
        <Text style={styles.subtitle}>{alerts.length} notificaciones del sistema</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle2 color="#22c55e" size={48} />
            <Text style={styles.emptyText}>No hay alertas activas</Text>
            <Text style={styles.emptySub}>El sistema funciona con normalidad</Text>
          </View>
        ) : (
          alerts.map(alert => (
            <View key={alert.id} style={[styles.card, !alert.read && styles.unreadCard, { borderLeftColor: getColor(alert.type) }]}>
              <View style={styles.cardHeader}>
                <View style={styles.row}>
                  {getIcon(alert.type)}
                  <Text style={[styles.alertTitle, { color: getColor(alert.type) }]}>
                    {alert.title}
                  </Text>
                </View>
                <Text style={styles.timeText}>
                  {format(new Date(alert.timestamp), 'HH:mm')}
                </Text>
              </View>
              
              <Text style={styles.message}>{alert.message}</Text>
              
              <View style={styles.actions}>
                {!alert.read && (
                  <TouchableOpacity onPress={() => markAlertRead(alert.id)}>
                    <Text style={styles.actionText}>Marcar leída</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteAlert(alert.id)}>
                  <Trash2 color="#94a3b8" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  actionText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 16,
  }
});
