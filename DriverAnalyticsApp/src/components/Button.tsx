// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';
type Size = 'small' | 'medium' | 'large';

type Props = {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
};

const Button: React.FC<Props> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
}) => {
    const base: any[] = [styles.button];
    if (size === 'small') base.push(styles.buttonSmall);
    if (size === 'large') base.push(styles.buttonLarge);
    if (variant === 'primary') base.push(styles.buttonPrimary);
    if (variant === 'secondary') base.push(styles.buttonSecondary);
    if (variant === 'outline') base.push(styles.buttonOutline);
    if (variant === 'danger') base.push(styles.buttonDanger);
    if (disabled || loading) base.push(styles.buttonDisabled);

    const textBase: any[] = [styles.buttonText];
    if (size === 'small') textBase.push(styles.buttonTextSmall);
    if (size === 'large') textBase.push(styles.buttonTextLarge);
    if (variant === 'outline') textBase.push(styles.buttonTextOutline);

    return (
        <TouchableOpacity style={[...base, style]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}>
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.textInverse} />
            ) : (
                <Text style={[...textBase, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    buttonSmall: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    buttonLarge: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
    buttonPrimary: { backgroundColor: colors.primary },
    buttonSecondary: { backgroundColor: colors.secondary },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
    buttonDanger: { backgroundColor: colors.danger },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: colors.textInverse, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
    buttonTextSmall: { fontSize: typography.sizes.sm },
    buttonTextLarge: { fontSize: typography.sizes.lg },
    buttonTextOutline: { color: colors.primary },
});

export default Button;
