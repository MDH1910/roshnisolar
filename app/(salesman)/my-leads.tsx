import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, List, Phone, MapPin, Calendar, TrendingUp, Filter } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Lead, LeadStatus } from '@/types/leads';

const statusColors = {
  new: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  contacted: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  hold: { bg: '#E5E7EB', text: '#374151', border: '#6B7280' },
  transit: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
  declined: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
  completed: { bg: '#DCFCE7', text: '#166534', border: '#22C55E' },
};

const likelihoodColors = {
  hot: '#EF4444',
  warm: '#F97316',
  cold: '#64748B',
};

export default function MyLeadsScreen() {
  const { user } = useAuth();
  const { getUserLeads, isLoading, refreshData } = useData();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  
  const myLeads = user ? getUserLeads(user.id) : [];
  const filteredLeads = selectedStatus === 'all' 
    ? myLeads 
    : myLeads.filter(lead => lead.status === selectedStatus);

  const getStatusCounts = () => {
    const counts = {
      total: myLeads.length,
      new: myLeads.filter(l => l.status === 'new').length,
      contacted: myLeads.filter(l => l.status === 'contacted').length,
      transit: myLeads.filter(l => l.status === 'transit').length,
      completed: myLeads.filter(l => l.status === 'completed').length,
    };
    return counts;
  };

  const counts = getStatusCounts();

  const StatusBadge = ({ status }: { status: LeadStatus }) => {
    const colors = statusColors[status];
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <View style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <View style={styles.leadTitle}>
          <Text style={styles.customerName}>{lead.customerName}</Text>
          <View style={[styles.likelihoodDot, { backgroundColor: likelihoodColors[lead.likelihood] }]} />
        </View>
        <StatusBadge status={lead.status} />
      </View>
      
      <View style={styles.leadInfo}>
        <View style={styles.infoRow}>
          <Phone size={16} color="#64748B" />
          <Text style={styles.infoText}>{lead.phoneNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={1}>{lead.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#64748B" />
          <Text style={styles.infoText}>
            {new Date(lead.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {lead.callNotes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Call Notes:</Text>
          <Text style={styles.notesText}>{lead.callNotes}</Text>
        </View>
      )}

      {lead.visitNotes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Visit Notes:</Text>
          <Text style={styles.notesText}>{lead.visitNotes}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F97316']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <List size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>My Leads</Text>
            <Text style={styles.headerSubtitle}>{counts.total} leads submitted</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#FF6B35" />
            <Text style={styles.statNumber}>{counts.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: statusColors.new.border }]} />
            <Text style={styles.statNumber}>{counts.new}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: statusColors.contacted.border }]} />
            <Text style={styles.statNumber}>{counts.contacted}</Text>
            <Text style={styles.statLabel}>Contacted</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: statusColors.completed.border }]} />
            <Text style={styles.statNumber}>{counts.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterText, selectedStatus === 'all' && styles.filterTextActive]}>
              All ({counts.total})
            </Text>
          </TouchableOpacity>
          {Object.entries(statusColors).map(([status]) => {
            const count = myLeads.filter(l => l.status === status).length;
            return (
              <TouchableOpacity
                key={status}
                style={[styles.filterButton, selectedStatus === status && styles.filterButtonActive]}
                onPress={() => setSelectedStatus(status as LeadStatus)}
              >
                <Text style={[styles.filterText, selectedStatus === status && styles.filterTextActive]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
      >
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyState}>
            <List size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No leads found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedStatus === 'all' 
                ? "You haven't submitted any leads yet" 
                : `No ${selectedStatus} leads found`}
            </Text>
          </View>
        ) : (
          <View style={styles.leadsList}>
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </View>
        )}
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
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  leadsList: {
    padding: 20,
    paddingTop: 0,
  },
  leadCard: {
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
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leadTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  likelihoodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  leadInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    flex: 1,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  notesLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});