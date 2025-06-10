import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar, 
  Phone,
  Wrench,
  Headphones,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Target,
  Zap
} from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { 
    leads, 
    supportTickets, 
    getAllUsers, 
    getAnalytics, 
    isLoading, 
    refreshData 
  } = useData();
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const analytics = getAnalytics();
  const users = getAllUsers();

  const getLeadsByStatus = () => {
    return {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      transit: leads.filter(l => l.status === 'transit').length,
      completed: leads.filter(l => l.status === 'completed').length,
      declined: leads.filter(l => l.status === 'declined').length,
      hold: leads.filter(l => l.status === 'hold').length,
    };
  };

  const getTicketsByStatus = () => {
    return {
      open: supportTickets.filter(t => t.status === 'open').length,
      in_progress: supportTickets.filter(t => t.status === 'in_progress').length,
      resolved: supportTickets.filter(t => t.status === 'resolved').length,
      closed: supportTickets.filter(t => t.status === 'closed').length,
    };
  };

  const getUsersByRole = () => {
    return {
      salesman: users.filter(u => u.role === 'salesman').length,
      call_operator: users.filter(u => u.role === 'call_operator').length,
      technician: users.filter(u => u.role === 'technician').length,
      super_admin: users.filter(u => u.role === 'super_admin').length,
    };
  };

  const leadStats = getLeadsByStatus();
  const ticketStats = getTicketsByStatus();
  const userStats = getUsersByRole();

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '₹45.2L',
      change: '+12.5%',
      icon: DollarSign,
      color: '#10B981',
      bgColor: '#F0FDF4'
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.conversionRate}%`,
      change: '+2.1%',
      icon: Target,
      color: '#3B82F6',
      bgColor: '#EBF8FF'
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers.toString(),
      change: '+5',
      icon: Users,
      color: '#8B5CF6',
      bgColor: '#F3E8FF'
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: '+0.1%',
      icon: Zap,
      color: '#F59E0B',
      bgColor: '#FFFBEB'
    }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#DC2626', '#EF4444']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <BarChart3 size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Complete system overview</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
      >
        {/* KPI Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.kpiGrid}>
            {kpiCards.map((kpi, index) => (
              <View key={index} style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.bgColor }]}>
                  <kpi.icon size={20} color={kpi.color} />
                </View>
                <View style={styles.kpiContent}>
                  <Text style={styles.kpiValue}>{kpi.value}</Text>
                  <Text style={styles.kpiTitle}>{kpi.title}</Text>
                  <Text style={[styles.kpiChange, { color: kpi.color }]}>{kpi.change}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Phone size={20} color="#FF6B35" />
                <Text style={styles.statTitle}>Leads Pipeline</Text>
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statMainNumber}>{analytics.totalLeads}</Text>
                <Text style={styles.statLabel}>Total Leads</Text>
                <View style={styles.statBreakdown}>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.statItemText}>New: {leadStats.new}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.statItemText}>Contacted: {leadStats.contacted}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: '#22C55E' }]} />
                    <Text style={styles.statItemText}>Completed: {leadStats.completed}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Headphones size={20} color="#10B981" />
                <Text style={styles.statTitle}>Support Tickets</Text>
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statMainNumber}>{supportTickets.length}</Text>
                <Text style={styles.statLabel}>Total Tickets</Text>
                <View style={styles.statBreakdown}>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.statItemText}>Open: {ticketStats.open}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.statItemText}>In Progress: {ticketStats.in_progress}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: '#22C55E' }]} />
                    <Text style={styles.statItemText}>Resolved: {ticketStats.resolved}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Team Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Performance</Text>
          <View style={styles.teamGrid}>
            <View style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Users size={18} color="#FF6B35" />
                <Text style={styles.teamRole}>Salesmen</Text>
                <Text style={styles.teamCount}>{userStats.salesman}</Text>
              </View>
              <View style={styles.teamMetrics}>
                <Text style={styles.teamMetric}>Leads: {leads.length}</Text>
                <Text style={styles.teamMetric}>Conversion: {analytics.conversionRate}%</Text>
              </View>
            </View>

            <View style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Phone size={18} color="#1E40AF" />
                <Text style={styles.teamRole}>Call Operators</Text>
                <Text style={styles.teamCount}>{userStats.call_operator}</Text>
              </View>
              <View style={styles.teamMetrics}>
                <Text style={styles.teamMetric}>Processed: {leadStats.contacted + leadStats.transit}</Text>
                <Text style={styles.teamMetric}>Tickets: {supportTickets.length}</Text>
              </View>
            </View>

            <View style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Wrench size={18} color="#059669" />
                <Text style={styles.teamRole}>Technicians</Text>
                <Text style={styles.teamCount}>{userStats.technician}</Text>
              </View>
              <View style={styles.teamMetrics}>
                <Text style={styles.teamMetric}>Installations: {leadStats.completed}</Text>
                <Text style={styles.teamMetric}>Support: {ticketStats.resolved}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#F0FDF4' }]}>
                <CheckCircle size={16} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New installation completed</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#EBF8FF' }]}>
                <Phone size={16} color="#3B82F6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>5 new leads generated</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#FFFBEB' }]}>
                <AlertTriangle size={16} color="#F59E0B" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Support ticket escalated</Text>
                <Text style={styles.activityTime}>6 hours ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <View style={[styles.healthStatus, { backgroundColor: '#10B981' }]} />
                <Text style={styles.healthTitle}>Database</Text>
              </View>
              <Text style={styles.healthValue}>Operational</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <View style={[styles.healthStatus, { backgroundColor: '#10B981' }]} />
                <Text style={styles.healthTitle}>API Services</Text>
              </View>
              <Text style={styles.healthValue}>Healthy</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <View style={[styles.healthStatus, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.healthTitle}>Notifications</Text>
              </View>
              <Text style={styles.healthValue}>Degraded</Text>
            </View>
          </View>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
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
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  kpiContent: {
    flex: 1,
  },
  kpiValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  kpiTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 2,
  },
  kpiChange: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  statContent: {
    alignItems: 'center',
  },
  statMainNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 12,
  },
  statBreakdown: {
    width: '100%',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statItemText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  teamGrid: {
    gap: 12,
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  teamRole: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  teamCount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  teamMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamMetric: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  healthGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  healthCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  healthStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  healthValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
});