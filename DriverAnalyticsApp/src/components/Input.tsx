// src/components/Input.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    style?: any;
    inputStyle?: any;
}

const Input: React.FC<InputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    style,
    inputStyle,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, isFocused && styles.inputFocused, error && styles.inputError, inputStyle]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize as any}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Text style={styles.eyeText}>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: spacing.md },
    label: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium as any, color: colors.textPrimary, marginBottom: spacing.xs },
    inputWrapper: { position: 'relative' },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
    },
    inputFocused: { borderColor: colors.primary, borderWidth: 2 },
    inputError: { borderColor: colors.error },
    eyeIcon: { position: 'absolute', right: spacing.md, top: 0, bottom: 0, justifyContent: 'center' },
    eyeText: { fontSize: typography.sizes.lg },
    errorText: { fontSize: typography.sizes.xs, color: colors.error, marginTop: spacing.xs, marginLeft: spacing.xs },
});

export default Input;
