import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Plus, MapPin, Phone, User, Building } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { NewLeadData, PropertyType, LeadLikelihood } from '@/types/leads';

export default function NewLeadScreen() {
  const [formData, setFormData] = useState<NewLeadData>({
    customerName: '',
    phoneNumber: '',
    address: '',
    propertyType: 'residential',
    likelihood: 'warm',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { addLead } = useData();

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.phoneNumber || !formData.address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLead(formData);
      Alert.alert(
        'Success',
        'Lead submitted successfully!',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({
                customerName: '',
                phoneNumber: '',
                address: '',
                propertyType: 'residential',
                likelihood: 'warm',
              });
            },
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#FF6B35', '#F97316']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Sun size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>New Lead</Text>
            <Text style={styles.headerSubtitle}>Collect customer information</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Information</Text>
            
            <View style={styles.inputContainer}>
              <User size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Customer Name *"
                value={formData.customerName}
                onChangeText={(text) => setFormData({ ...formData, customerName: text })}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputContainer}>
              <MapPin size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Complete Address *"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.pickerGroup}>
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.pickerContainer}>
              {[
                { value: 'residential', label: 'Residential', icon: '🏠' },
                { value: 'commercial', label: 'Commercial', icon: '🏢' },
                { value: 'industrial', label: 'Industrial', icon: '🏭' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pickerOption,
                    formData.propertyType === option.value && styles.pickerOptionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, propertyType: option.value as PropertyType })
                  }
                >
                  <Text style={styles.pickerEmoji}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.pickerText,
                      formData.propertyType === option.value && styles.pickerTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.pickerGroup}>
            <Text style={styles.label}>Likelihood of Installation</Text>
            <View style={styles.pickerContainer}>
              {[
                { value: 'hot', label: 'Hot', color: '#EF4444' },
                { value: 'warm', label: 'Warm', color: '#F97316' },
                { value: 'cold', label: 'Cold', color: '#64748B' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.likelihoodOption,
                    formData.likelihood === option.value && {
                      backgroundColor: option.color,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, likelihood: option.value as LeadLikelihood })
                  }
                >
                  <View
                    style={[
                      styles.likelihoodDot,
                      { backgroundColor: option.color },
                      formData.likelihood === option.value && { backgroundColor: '#FFFFFF' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.likelihoodText,
                      formData.likelihood === option.value && styles.likelihoodTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Plus size={20} color="#FFFFFF" style={styles.submitIcon} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Lead'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#F8FAFC',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  textArea: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  pickerGroup: {
    marginBottom: 24,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  pickerOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF7ED',
  },
  pickerEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  pickerTextSelected: {
    color: '#FF6B35',
  },
  likelihoodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  likelihoodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  likelihoodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  likelihoodTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    height: 56,
    marginTop: 16,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});