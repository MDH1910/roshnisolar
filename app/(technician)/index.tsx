import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  TrendingUp, 
  Filter,
  CheckCircle,
  XCircle,
  Pause,
  User,
  Building,
  Zap
} from 'lucide-react-native';
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

export default function TechnicianVisitsScreen() {
  const { user } = useAuth();
  const { getUserLeads, updateLeadStatus, isLoading, refreshData } = useData();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('transit');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [visitNotes, setVisitNotes] = useState('');
  const [newStatus, setNewStatus] = useState<LeadStatus>('completed');
  
  const myLeads = user ? getUserLeads(user.id) : [];
  const filteredLeads = selectedStatus === 'all' 
    ? myLeads 
    : myLeads.filter(lead => lead.status === selectedStatus);

  const getStatusCounts = () => {
    const counts = {
      total: myLeads.length,
      transit: myLeads.filter(l => l.status === 'transit').length,
      completed: myLeads.filter(l => l.status === 'completed').length,
      hold: myLeads.filter(l => l.status === 'hold').length,
    };
    return counts;
  };

  const counts = getStatusCounts();

  const handleStatusUpdate = async () => {
    if (!selectedLead) return;

    try {
      await updateLeadStatus(selectedLead.id, newStatus, visitNotes);
      setShowStatusModal(false);
      setVisitNotes('');
      setSelectedLead(null);
      Alert.alert('Success', 'Visit status updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update visit status');
    }
  };

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
          <User size={16} color="#64748B" />
          <Text style={styles.infoText}>{lead.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={16} color="#64748B" />
          <Text style={styles.infoText}>{lead.phoneNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={2}>{lead.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Building size={16} color="#64748B" />
          <Text style={styles.infoText}>
            {lead.propertyType.charAt(0).toUpperCase() + lead.propertyType.slice(1)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#64748B" />
          <Text style={styles.infoText}>
            Assigned: {new Date(lead.updatedAt).toLocaleDateString()}
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

      {lead.status === 'transit' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => {
              setSelectedLead(lead);
              setShowStatusModal(true);
            }}
          >
            <CheckCircle size={16} color="#059669" />
            <Text style={styles.updateButtonText}>Update Visit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Calendar size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>My Visits</Text>
            <Text style={styles.headerSubtitle}>{counts.total} assigned visits</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#059669" />
            <Text style={styles.statNumber}>{counts.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: statusColors.transit.border }]} />
            <Text style={styles.statNumber}>{counts.transit}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: statusColors.completed.border }]} />
            <Text style={styles.statNumber}>{counts.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: statusColors.hold.border }]} />
            <Text style={styles.statNumber}>{counts.hold}</Text>
            <Text style={styles.statLabel}>On Hold</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal show sHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'transit' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('transit')}
          >
            <Text style={[styles.filterText, selectedStatus === 'transit' && styles.filterTextActive]}>
              Pending ({counts.transit})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'completed' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('completed')}
          >
            <Text style={[styles.filterText, selectedStatus === 'completed' && styles.filterTextActive]}>
              Completed ({counts.completed})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'hold' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('hold')}
          >
            <Text style={[styles.filterText, selectedStatus === 'hold' && styles.filterTextActive]}>
              On Hold ({counts.hold})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterText, selectedStatus === 'all' && styles.filterTextActive]}>
              All ({counts.total})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
      >
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No visits found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedStatus === 'all' 
                ? "No visits assigned to you yet" 
                : `No ${selectedStatus} visits found`}
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

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Visit Status</Text>
            
            <View style={styles.statusOptions}>
              <TouchableOpacity
                style={[styles.statusOption, newStatus === 'completed' && styles.statusOptionSelected]}
                onPress={() => setNewStatus('completed')}
              >
                <CheckCircle size={20} color={newStatus === 'completed' ? '#FFFFFF' : '#22C55E'} />
                <View style={styles.statusOptionContent}>
                  <Text style={[styles.statusOptionText, newStatus === 'completed' && styles.statusOptionTextSelected]}>
                    Installation Completed
                  </Text>
                  <Text style={[styles.statusOptionSubtext, newStatus === 'completed' && styles.statusOptionTextSelected]}>
                    Solar system successfully installed
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusOption, newStatus === 'hold' && styles.statusOptionSelected]}
                onPress={() => setNewStatus('hold')}
              >
                <Pause size={20} color={newStatus === 'hold' ? '#FFFFFF' : '#F59E0B'} />
                <View style={styles.statusOptionContent}>
                  <Text style={[styles.statusOptionText, newStatus === 'hold' && styles.statusOptionTextSelected]}>
                    Put on Hold
                  </Text>
                  <Text style={[styles.statusOptionSubtext, newStatus === 'hold' && styles.statusOptionTextSelected]}>
                    Customer needs more time to decide
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusOption, newStatus === 'declined' && styles.statusOptionSelected]}
                onPress={() => setNewStatus('declined')}
              >
                <XCircle size={20} color={newStatus === 'declined' ? '#FFFFFF' : '#EF4444'} />
                <View style={styles.statusOptionContent}>
                  <Text style={[styles.statusOptionText, newStatus === 'declined' && styles.statusOptionTextSelected]}>
                    Customer Declined
                  </Text>
                  <Text style={[styles.statusOptionSubtext, newStatus === 'declined' && styles.statusOptionTextSelected]}>
                    Customer decided not to proceed
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add visit notes..."
              value={visitNotes}
              onChangeText={setVisitNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleStatusUpdate}
              >
                <Text style={styles.confirmButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#059669',
    borderColor: '#059669',
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
    marginBottom: 12,
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
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#059669',
    gap: 6,
  },
  updateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusOptions: {
    gap: 12,
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  statusOptionSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  statusOptionContent: {
    flex: 1,
  },
  statusOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  statusOptionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusOptionTextSelected: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#059669',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});