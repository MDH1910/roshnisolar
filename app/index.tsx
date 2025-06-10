import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect to appropriate role-based layout
        switch (user.role) {
          case 'salesman':
            router.replace('/(salesman)');
            break;
          case 'call_operator':
            router.replace('/(call_operator)');
            break;
          case 'technician':
            router.replace('/(technician)');
            break;
          case 'super_admin':
            router.replace('/(super_admin)');
            break;
          default:
            router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Roshni Solar</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Roshni Solar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
  },
  loadingText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
});