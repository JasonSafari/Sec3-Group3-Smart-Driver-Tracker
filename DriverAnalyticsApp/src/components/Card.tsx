// src/components/Card.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

type Props = {
    children?: React.ReactNode;
    onPress?: () => void;
    style?: any;
    variant?: 'default' | 'flat' | 'outlined';
};

const Card: React.FC<Props> = ({ children, onPress, style, variant = 'default' }) => {
    const Container: any = onPress ? TouchableOpacity : View;

    const base: any[] = [styles.card];
    if (variant === 'flat') base.push(styles.cardFlat);
    if (variant === 'outlined') base.push(styles.cardOutlined);

    return (
        <Container style={[...base, style]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    cardFlat: { shadowOpacity: 0, elevation: 0, backgroundColor: colors.surfaceAlt },
    cardOutlined: { shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: colors.border },
});

export default Card;
