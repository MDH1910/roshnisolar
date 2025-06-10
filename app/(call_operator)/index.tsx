import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Phone, 
  List, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Filter,
  PhoneCall,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  ArrowRight
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

export default function CallOperatorDashboard() {
  const { user } = useAuth();
  const { getUserLeads, updateLeadStatus, assignLeadToTechnician, getTechnicians, isLoading, refreshData } = useData();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('new');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [newStatus, setNewStatus] = useState<LeadStatus>('contacted');
  
  const myLeads = user ? getUserLeads(user.id) : [];
  const filteredLeads = selectedStatus === 'all' 
    ? myLeads 
    : myLeads.filter(lead => lead.status === selectedStatus);

  const technicians = getTechnicians();

  const getStatusCounts = () => {
    const counts = {
      total: myLeads.length,
      new: myLeads.filter(l => l.status === 'new').length,
      contacted: myLeads.filter(l => l.status === 'contacted').length,
      transit: myLeads.filter(l => l.status === 'transit').length,
      hold: myLeads.filter(l => l.status === 'hold').length,
    };
    return counts;
  };

  const counts = getStatusCounts();

  const handleCall = (phoneNumber: string) => {
    if (Platform.OS === 'web') {
      Alert.alert('Call Feature', `Would call: ${phoneNumber}\n\nNote: Calling is not available in web preview.`);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedLead) return;

    try {
      await updateLeadStatus(selectedLead.id, newStatus, callNotes);
      setShowStatusModal(false);
      setCallNotes('');
      setSelectedLead(null);
      Alert.alert('Success', 'Lead status updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update lead status');
    }
  };

  const handleAssignTechnician = async (technicianId: string) => {
    if (!selectedLead) return;

    try {
      await assignLeadToTechnician(selectedLead.id, technicianId);
      setShowTechnicianModal(false);
      setSelectedLead(null);
      Alert.alert('Success', 'Lead assigned to technician successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to assign technician');
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
          <Phone size={16} color="#64748B" />
          <Text style={styles.infoText}>{lead.phoneNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={2}>{lead.address}</Text>
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

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(lead.phoneNumber)}
        >
          <PhoneCall size={16} color="#FFFFFF" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>

        {lead.status === 'new' && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => {
              setSelectedLead(lead);
              setShowStatusModal(true);
            }}
          >
            <MessageSquare size={16} color="#1E40AF" />
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        )}

        {lead.status === 'contacted' && (
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() => {
              setSelectedLead(lead);
              setShowTechnicianModal(true);
            }}
          >
            <ArrowRight size={16} color="#10B981" />
            <Text style={styles.assignButtonText}>Assign</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Phone size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Lead Management</Text>
            <Text style={styles.headerSubtitle}>{counts.total} leads to process</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#1E40AF" />
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
            <View style={[styles.statDot, { backgroundColor: statusColors.transit.border }]} />
            <Text style={styles.statNumber}>{counts.transit}</Text>
            <Text style={styles.statLabel}>Transit</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'new' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('new')}
          >
            <Text style={[styles.filterText, selectedStatus === 'new' && styles.filterTextActive]}>
              New ({counts.new})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'contacted' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('contacted')}
          >
            <Text style={[styles.filterText, selectedStatus === 'contacted' && styles.filterTextActive]}>
              Contacted ({counts.contacted})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedStatus === 'hold' && styles.filterButtonActive]}
            onPress={() => setSelectedStatus('hold')}
          >
            <Text style={[styles.filterText, selectedStatus === 'hold' && styles.filterTextActive]}>
              Hold ({counts.hold})
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
            <List size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No leads found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedStatus === 'all' 
                ? "No leads assigned to you yet" 
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

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Lead Status</Text>
            
            <View style={styles.statusOptions}>
              <TouchableOpacity
                style={[styles.statusOption, newStatus === 'contacted' && styles.statusOptionSelected]}
                onPress={() => setNewStatus('contacted')}
              >
                <CheckCircle size={20} color={newStatus === 'contacted' ? '#FFFFFF' : '#10B981'} />
                <Text style={[styles.statusOptionText, newStatus === 'contacted' && styles.statusOptionTextSelected]}>
                  Contacted
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusOption, newStatus === 'hold' && styles.statusOptionSelected]}
                onPress={() => setNewStatus('hold')}
              >
                <Pause size={20} color={newStatus === 'hold' ? '#FFFFFF' : '#F59E0B'} />
                <Text style={[styles.statusOptionText, newStatus === 'hold' && styles.statusOptionTextSelected]}>
                  Hold
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusOption, newStatus === 'declined' && styles.statusOptionSelected]}
                onPress={() => setNewStatus('declined')}
              >
                <XCircle size={20} color={newStatus === 'declined' ? '#FFFFFF' : '#EF4444'} />
                <Text style={[styles.statusOptionText, newStatus === 'declined' && styles.statusOptionTextSelected]}>
                  Declined
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add call notes..."
              value={callNotes}
              onChangeText={setCallNotes}
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

      {/* Technician Assignment Modal */}
      <Modal
        visible={showTechnicianModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTechnicianModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Technician</Text>
            
            <ScrollView style={styles.technicianList}>
              {technicians.map((tech) => (
                <TouchableOpacity
                  key={tech.id}
                  style={styles.technicianOption}
                  onPress={() => handleAssignTechnician(tech.id)}
                >
                  <View style={styles.technicianInfo}>
                    <Text style={styles.technicianName}>{tech.name}</Text>
                    <Text style={styles.technicianDetails}>{tech.phone}</Text>
                    <Text style={styles.technicianSpecialization}>{tech.specialization}</Text>
                  </View>
                  <ArrowRight size={20} color="#64748B" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTechnicianModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
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
    borderLeftColor: '#1E40AF',
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
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  callButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    borderColor: '#1E40AF',
    gap: 6,
  },
  updateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
  },
  assignButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    gap: 6,
  },
  assignButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
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
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  statusOptionSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  statusOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
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
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  technicianList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  technicianOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  technicianInfo: {
    flex: 1,
  },
  technicianName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  technicianDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 2,
  },
  technicianSpecialization: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
});