// src/components/ErrorMessage.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

type Props = {
    message?: string | null;
    onRetry?: () => void;
    style?: any;
};

const ErrorMessage: React.FC<Props> = ({ message, onRetry, style }) => {
    if (!message) return null;
    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>⚠️</Text>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>Oops! Something went wrong</Text>
                <Text style={styles.message}>{message}</Text>

                {onRetry && (
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
        padding: spacing.md,
        marginVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: { marginRight: spacing.md },
    icon: { fontSize: typography.sizes.xl },
    contentContainer: { flex: 1 },
    title: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any, color: colors.textPrimary, marginBottom: spacing.xs },
    message: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: Math.round(typography.sizes.sm * typography.lineHeights.normal) },
    retryButton: { marginTop: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.primary, borderRadius: borderRadius.sm, alignSelf: 'flex-start' },
    retryText: { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold as any },
});

export default ErrorMessage;
