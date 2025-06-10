import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Phone, Mail, LogOut, Clock, TrendingUp, Calendar, Target } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function CallOperatorProfileScreen() {
  const { user, logout } = useAuth();
  const { getUserLeads, getUserTickets } = useData();

  if (!user) return null;

  const myLeads = getUserLeads(user.id);
  const myTickets = getUserTickets(user.id);
  
  const todayLeads = myLeads.filter(lead => {
    const today = new Date().toDateString();
    const leadDate = new Date(lead.updatedAt).toDateString();
    return today === leadDate && lead.callOperatorId === user.id;
  });

  const completedLeads = myLeads.filter(l => l.status === 'completed' && l.callOperatorId === user.id);
  const resolvedTickets = myTickets.filter(t => t.status === 'resolved');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>Call Operator</Text>
            <Text style={styles.userShift}>{(user as any).shift || 'Day Shift'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={20} color="#1E40AF" />
              </View>
              <Text style={styles.statNumber}>{todayLeads.length}</Text>
              <Text style={styles.statLabel}>Leads Today</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={20} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>{myLeads.filter(l => l.callOperatorId === user.id).length}</Text>
              <Text style={styles.statLabel}>Total Leads</Text>
            </View>
          </View>
        </View>

        <View style={styles.performanceContainer}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Target size={20} color="#1E40AF" />
              <Text style={styles.metricTitle}>Lead Conversion</Text>
            </View>
            <View style={styles.metricStats}>
              <View style={styles.metricStat}>
                <Text style={styles.metricNumber}>{myLeads.filter(l => l.callOperatorId === user.id).length}</Text>
                <Text style={styles.metricLabel}>Processed</Text>
              </View>
              <View style={styles.metricStat}>
                <Text style={styles.metricNumber}>{completedLeads.length}</Text>
                <Text style={styles.metricLabel}>Completed</Text>
              </View>
              <View style={styles.metricStat}>
                <Text style={[styles.metricNumber, { color: '#10B981' }]}>
                  {myLeads.filter(l => l.callOperatorId === user.id).length > 0 
                    ? ((completedLeads.length / myLeads.filter(l => l.callOperatorId === user.id).length) * 100).toFixed(1)
                    : '0'}%
                </Text>
                <Text style={styles.metricLabel}>Success Rate</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Clock size={20} color="#10B981" />
              <Text style={styles.metricTitle}>Support Tickets</Text>
            </View>
            <View style={styles.metricStats}>
              <View style={styles.metricStat}>
                <Text style={styles.metricNumber}>{myTickets.length}</Text>
                <Text style={styles.metricLabel}>Total</Text>
              </View>
              <View style={styles.metricStat}>
                <Text style={styles.metricNumber}>{resolvedTickets.length}</Text>
                <Text style={styles.metricLabel}>Resolved</Text>
              </View>
              <View style={styles.metricStat}>
                <Text style={[styles.metricNumber, { color: '#10B981' }]}>
                  {myTickets.length > 0 
                    ? ((resolvedTickets.length / myTickets.length) * 100).toFixed(1)
                    : '0'}%
                </Text>
                <Text style={styles.metricLabel}>Resolution Rate</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Mail size={20} color="#64748B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Phone size={20} color="#64748B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Clock size={20} color="#64748B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  userShift: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  statsContainer: {
    margin: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  performanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  metricTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  metricStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricStat: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    height: 52,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});