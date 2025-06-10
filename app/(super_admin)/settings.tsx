import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Download,
  Upload,
  
  Trash2,
  RefreshCw,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Eye,
  HardDrive
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [dataRetention, setDataRetention] = useState(true);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all system data to a CSV file. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => Alert.alert('Success', 'Data export initiated. You will receive an email when ready.')
        }
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'This will import data from a CSV file. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          style: 'destructive',
          onPress: () => Alert.alert('Import', 'Data import functionality would be available here.')
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. The app may run slower until the cache is rebuilt. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => Alert.alert('Success', 'Cache cleared successfully.')
        }
      ]
    );
  };

  const handleResetSystem = () => {
    Alert.alert(
      'Reset System',
      'This will reset all system settings to default values. User data will not be affected. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'System settings reset to defaults.')
        }
      ]
    );
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: { 
    icon: any; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon size={20} color="#64748B" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const ToggleItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    value, 
    onValueChange 
  }: { 
    icon: any; 
    title: string; 
    subtitle?: string; 
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Icon size={20} color="#64748B" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: '#DC2626' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#DC2626', '#EF4444']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Settings size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>System Settings</Text>
            <Text style={styles.headerSubtitle}>Configure application preferences</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SettingSection title="Notifications">
          <ToggleItem
            icon={Bell}
            title="Push Notifications"
            subtitle="Receive notifications for important events"
            value={notifications}
            onValueChange={setNotifications}
          />
          <ToggleItem
            icon={Mail}
            title="Email Alerts"
            subtitle="Send email notifications for critical updates"
            value={emailAlerts}
            onValueChange={setEmailAlerts}
          />
          <ToggleItem
            icon={Smartphone}
            title="SMS Alerts"
            subtitle="Send SMS for urgent notifications"
            value={smsAlerts}
            onValueChange={setSmsAlerts}
          />
        </SettingSection>

        <SettingSection title="Appearance">
          <ToggleItem
            icon={darkMode ? Moon : Sun}
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <SettingItem
            icon={Globe}
            title="Language"
            subtitle="English (US)"
            onPress={() => Alert.alert('Language', 'Language selection would be available here.')}
          />
        </SettingSection>

        <SettingSection title="Security">
          <SettingItem
            icon={Lock}
            title="Change Password"
            subtitle="Update your admin password"
            onPress={() => Alert.alert('Security', 'Password change functionality would be available here.')}
          />
          <SettingItem
            icon={Shield}
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            onPress={() => Alert.alert('Security', '2FA setup would be available here.')}
          />
          <SettingItem
            icon={Eye}
            title="Privacy Settings"
            subtitle="Manage data privacy and permissions"
            onPress={() => Alert.alert('Privacy', 'Privacy settings would be available here.')}
          />
        </SettingSection>

        <SettingSection title="Data Management">
          <ToggleItem
            icon={Database}
            title="Auto Backup"
            subtitle="Automatically backup data daily"
            value={autoBackup}
            onValueChange={setAutoBackup}
          />
          <ToggleItem
            icon={HardDrive}
            title="Data Retention"
            subtitle="Keep deleted records for 30 days"
            value={dataRetention}
            onValueChange={setDataRetention}
          />
          <SettingItem
            icon={Download}
            title="Export Data"
            subtitle="Download all system data as CSV"
            onPress={handleExportData}
          />
          <SettingItem
            icon={Upload}
            title="Import Data"
            subtitle="Upload data from CSV file"
            onPress={handleImportData}
          />
        </SettingSection>

        <SettingSection title="System Maintenance">
          <SettingItem
            icon={RefreshCw}
            title="Clear Cache"
            subtitle="Clear temporary files and cached data"
            onPress={handleClearCache}
          />
          <SettingItem
            icon={Trash2}
            title="Reset Settings"
            subtitle="Reset all settings to default values"
            onPress={handleResetSystem}
          />
        </SettingSection>

        <View style={styles.versionInfo}>
          <Text style={styles.versionTitle}>Roshni Solar CRM</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionText}>Build 2024.01.15</Text>
          <Text style={styles.versionText}>© 2024 Roshni Solar Solutions</Text>
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
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  versionInfo: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: 60,
  },
  versionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
});