import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Lock, Mail } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: string) => {
    const credentials = {
      salesman: 'john@roshni.com',
      call_operator: 'sarah@roshni.com',
      technician: 'mike@roshni.com',
      super_admin: 'admin@roshni.com'
    };
    setEmail(credentials[role as keyof typeof credentials]);
    setPassword('password123');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FF6B35', '#F97316']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Sun size={48} color="#FF6B35" />
            </View>
            <Text style={styles.title}>Roshni Solar</Text>
            <Text style={styles.subtitle}>Solar Solutions Management</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#64748B"
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => setShowDemoCredentials(!showDemoCredentials)}
            >
              <Text style={styles.demoButtonText}>
                {showDemoCredentials ? 'Hide Demo Accounts' : 'Show Demo Accounts'}
              </Text>
            </TouchableOpacity>

            {showDemoCredentials && (
              <View style={styles.demoContainer}>
                <Text style={styles.demoTitle}>Demo Accounts (Password: password123)</Text>
                
                <TouchableOpacity 
                  style={styles.demoOption}
                  onPress={() => fillDemoCredentials('salesman')}
                >
                  <Text style={styles.demoOptionText}>👤 Salesman - john@roshni.com</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.demoOption}
                  onPress={() => fillDemoCredentials('call_operator')}
                >
                  <Text style={styles.demoOptionText}>📞 Call Operator - sarah@roshni.com</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.demoOption}
                  onPress={() => fillDemoCredentials('technician')}
                >
                  <Text style={styles.demoOptionText}>🔧 Technician - mike@roshni.com</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.demoOption}
                  onPress={() => fillDemoCredentials('super_admin')}
                >
                  <Text style={styles.demoOptionText}>⚙️ Super Admin - admin@roshni.com</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  demoButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  demoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoOptionText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#475569',
  },
});