// app/(tabs)/index.tsx
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../src/theme';

import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import ErrorMessage from '../../src/components/ErrorMessage';
import Input from '../../src/components/Input';
import LoadingSpinner from '../../src/components/LoadingSpinner';

export default function HomeScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Driver Analytics</Text>
                <Text style={styles.subtitle}>Component Testing</Text>

                <Card>
                    <Text style={styles.sectionTitle}>Buttons</Text>
                    <Button title="Primary Button" onPress={() => Alert.alert('Success', 'Primary pressed!')} />
                    <Button title="Secondary Button" variant="secondary" onPress={() => Alert.alert('Success', 'Secondary pressed!')} />
                    <Button title="Outline Button" variant="outline" onPress={() => Alert.alert('Success', 'Outline pressed!')} />
                    <Button title="Danger Button" variant="danger" onPress={() => Alert.alert('Warning', 'Danger pressed!')} />
                    <Button title="Loading Button" loading />
                    <Button title="Small Button" size="small" onPress={() => Alert.alert('Success', 'Small pressed!')} />
                </Card>

                <Card>
                    <Text style={styles.sectionTitle}>Inputs</Text>
                    <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                    <Input label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />
                    <Input label="Error Example" placeholder="This has an error" error="This field is required" />
                </Card>

                <Text style={styles.sectionTitle}>Card Variants</Text>
                <Card><Text style={styles.cardText}>Default Card with Shadow</Text></Card>
                <Card variant="flat"><Text style={styles.cardText}>Flat Card (No Shadow)</Text></Card>
                <Card variant="outlined"><Text style={styles.cardText}>Outlined Card</Text></Card>
                <Card onPress={() => Alert.alert('Card Pressed', 'You tapped the card!')}><Text style={styles.cardText}>Pressable Card (Tap Me!)</Text></Card>

                <Card>
                    <Text style={styles.sectionTitle}>Loading Spinner</Text>
                    <LoadingSpinner message="Loading your data..." />
                </Card>

                <ErrorMessage message="Unable to connect to the server. Please check your internet connection." onRetry={() => Alert.alert('Retrying', 'Attempting to reconnect...')} />

                <View style={styles.spacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    contentContainer: { padding: spacing.md },
    title: { fontSize: typography.sizes.xxxl, fontWeight: typography.weights.bold as any, color: colors.primary, marginBottom: spacing.xs },
    subtitle: { fontSize: typography.sizes.md, color: colors.textSecondary, marginBottom: spacing.xl },
    sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold as any, color: colors.textPrimary, marginBottom: spacing.md },
    cardText: { fontSize: typography.sizes.md, color: colors.textPrimary },
    spacer: { height: spacing.xl },
});
