import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { BackHeader } from '@/components/back-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { createFamily } from '@/services/familyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateFamilyScreen() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setLoading(true);
    try {
      const result = await createFamily(familyName.trim());
      setInviteCode(result.family.invite_code);
      // Update user data with new family_id
      if (user && result.family) {
        const updatedUser = { ...user, family_id: result.family.family_id };
        setUser(updatedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      // Navigate directly to parent dashboard to avoid redirect loop
      Alert.alert('Success', 'Family created! Share the invite code with your teen.', [
        {
          text: 'OK',
          onPress: () => {
            setTimeout(() => {
              router.replace('/parent-dashboard');
            }, 100);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create family');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (inviteCode) {
      await Clipboard.setStringAsync(inviteCode);
      Alert.alert('Copied!', 'Invite code copied to clipboard');
    }
  };

  if (user?.role !== 'parent') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Only parents can create families</ThemedText>
      </ThemedView>
    );
  }

  if (inviteCode) {
    return (
      <ThemedView style={styles.container}>
        <BackHeader title="Family Created" showHome />
        <ThemedView style={styles.header}>
          <ThemedText type="title">Family Created!</ThemedText>
          <ThemedText>Share this code with your teen</ThemedText>
        </ThemedView>

        <ThemedView style={styles.codeCard}>
          <ThemedText style={styles.codeLabel}>Invite Code</ThemedText>
          <Pressable onPress={handleCopyCode}>
            <ThemedText style={styles.codeValue}>{inviteCode}</ThemedText>
          </Pressable>
          <ThemedText style={styles.codeHint}>Tap to copy</ThemedText>
        </ThemedView>

        <Pressable
          style={styles.button}
          onPress={() => router.replace('/parent-dashboard')}
        >
          <ThemedText style={styles.buttonText}>Continue</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <BackHeader title="Create Family" showHome />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Create Family</ThemedText>
        <ThemedText>Set up a family account to monitor teen driving</ThemedText>
      </ThemedView>

      <View style={styles.form}>
        <ThemedText style={styles.label}>Family Name</ThemedText>
        <TextInput
          style={styles.input}
          value={familyName}
          onChangeText={setFamilyName}
          placeholder="Smith Family"
          placeholderTextColor="#6b7280"
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.buttonText}>Create Family</ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: '#e5e5e5',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#f9fafb',
    backgroundColor: '#1f2937',
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  codeCard: {
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  codeValue: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#22c55e',
    marginBottom: 8,
  },
  codeHint: {
    fontSize: 12,
    color: '#6b7280',
  },
});

