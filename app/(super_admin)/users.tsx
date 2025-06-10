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
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { UserRole } from '@/types/auth';

const roleColors = {
  salesman: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  call_operator: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  technician: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
  super_admin: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
};

export default function UsersManagementScreen() {
  const { 
    getAllUsers, 
    addUser, 
    updateUser, 
    deleteUser, 
    isLoading, 
    refreshData 
  } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'salesman' as UserRole,
  });

  const users = getAllUsers();
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleStats = () => {
    return {
      total: users.length,
      salesman: users.filter(u => u.role === 'salesman').length,
      call_operator: users.filter(u => u.role === 'call_operator').length,
      technician: users.filter(u => u.role === 'technician').length,
      super_admin: users.filter(u => u.role === 'super_admin').length,
      active: users.filter(u => u.isActive).length,
    };
  };

  const stats = getRoleStats();

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await addUser(newUser);
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'salesman',
      });
      Alert.alert('Success', 'User added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, selectedUser);
      setShowEditModal(false);
      setSelectedUser(null);
      Alert.alert('Success', 'User updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleDeleteUser = (user: any) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Success', 'User deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const toggleUserStatus = async (user: any) => {
    try {
      await updateUser(user.id, { ...user, isActive: !user.isActive });
      Alert.alert('Success', `User ${user.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const RoleBadge = ({ role }: { role: UserRole }) => {
    const colors = roleColors[role];
    return (
      <View style={[styles.roleBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[styles.roleText, { color: colors.text }]}>
          {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
        </Text>
      </View>
    );
  };

  const UserCard = ({ user }: { user: any }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <RoleBadge role={user.role} />
          </View>
        </View>
        <View style={styles.userStatus}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: user.isActive ? '#10B981' : '#EF4444' }
          ]} />
        </View>
      </View>

      <View style={styles.userContact}>
        <View style={styles.contactRow}>
          <Mail size={14} color="#64748B" />
          <Text style={styles.contactText}>{user.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Phone size={14} color="#64748B" />
          <Text style={styles.contactText}>{user.phone}</Text>
        </View>
        <View style={styles.contactRow}>
          <Calendar size={14} color="#64748B" />
          <Text style={styles.contactText}>
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleUserStatus(user)}
        >
          {user.isActive ? (
            <UserX size={16} color="#F59E0B" />
          ) : (
            <UserCheck size={16} color="#10B981" />
          )}
          <Text style={[styles.actionButtonText, { 
            color: user.isActive ? '#F59E0B' : '#10B981' 
          }]}>
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedUser(user);
            setShowEditModal(true);
          }}
        >
          <Edit size={16} color="#3B82F6" />
          <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteUser(user)}
        >
          <Trash2 size={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7C3AED', '#A855F7']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Users size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSubtitle}>{stats.total} total users</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={20} color="#7C3AED" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <UserCheck size={20} color="#10B981" />
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Phone size={20} color="#FF6B35" />
            <Text style={styles.statNumber}>{stats.salesman}</Text>
            <Text style={styles.statLabel}>Salesmen</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={20} color="#1E40AF" />
            <Text style={styles.statNumber}>{stats.call_operator}</Text>
            <Text style={styles.statLabel}>Operators</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('all')}
          >
            <Text style={[styles.filterText, selectedRole === 'all' && styles.filterTextActive]}>
              All ({stats.total})
            </Text>
          </TouchableOpacity>
          {Object.entries(roleColors).map(([role]) => {
            const count = users.filter(u => u.role === role).length;
            return (
              <TouchableOpacity
                key={role}
                style={[styles.filterButton, selectedRole === role && styles.filterButtonActive]}
                onPress={() => setSelectedRole(role as UserRole)}
              >
                <Text style={[styles.filterText, selectedRole === role && styles.filterTextActive]}>
                  {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)} ({count})
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
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Add your first user to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New User</Text>
            
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                value={newUser.name}
                onChangeText={(text) => setNewUser({...newUser, name: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email Address *"
                value={newUser.email}
                onChangeText={(text) => setNewUser({...newUser, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                value={newUser.phone}
                onChangeText={(text) => setNewUser({...newUser, phone: text})}
                keyboardType="phone-pad"
              />

              <Text style={styles.roleLabel}>Role</Text>
              <View style={styles.roleOptions}>
                {Object.keys(roleColors).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      newUser.role === role && styles.roleOptionSelected,
                    ]}
                    onPress={() => setNewUser({...newUser, role: role as UserRole})}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      newUser.role === role && styles.roleOptionTextSelected
                    ]}>
                      {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddUser}
              >
                <Text style={styles.confirmButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            
            {selectedUser && (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name *"
                  value={selectedUser.name}
                  onChangeText={(text) => setSelectedUser({...selectedUser, name: text})}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Email Address *"
                  value={selectedUser.email}
                  onChangeText={(text) => setSelectedUser({...selectedUser, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number *"
                  value={selectedUser.phone}
                  onChangeText={(text) => setSelectedUser({...selectedUser, phone: text})}
                  keyboardType="phone-pad"
                />

                <Text style={styles.roleLabel}>Role</Text>
                <View style={styles.roleOptions}>
                  {Object.keys(roleColors).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        selectedUser.role === role && styles.roleOptionSelected,
                      ]}
                      onPress={() => setSelectedUser({...selectedUser, role: role as UserRole})}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        selectedUser.role === role && styles.roleOptionTextSelected
                      ]}>
                        {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleEditUser}
              >
                <Text style={styles.confirmButtonText}>Update User</Text>
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
  headerInfo: {
    flex: 1,
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
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
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
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
  usersList: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  userStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  userContact: {
    gap: 8,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    flex: 1,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  roleOptionSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  roleOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  roleOptionTextSelected: {
    color: '#FFFFFF',
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
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});