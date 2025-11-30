// src/components/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = {
    size?: 'small' | 'large' | number;
    color?: string;
    message?: string;
    fullScreen?: boolean;
};

const LoadingSpinner: React.FC<Props> = ({ size = 'large', color = colors.primary, message, fullScreen = false }) => {
    return (
        <View style={fullScreen ? styles.fullScreen : undefined}>
            <View style={[styles.container, fullScreen && { backgroundColor: colors.background }]}>
                <ActivityIndicator size={size} color={color} />
                {message ? <Text style={styles.message}>{message}</Text> : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
    container: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    message: { marginTop: spacing.md, fontSize: typography.sizes.md, color: colors.textSecondary, textAlign: 'center' },
});

export default LoadingSpinner;
