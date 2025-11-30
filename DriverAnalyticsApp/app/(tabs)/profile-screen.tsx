import { StyleSheet, Text, View } from 'react-native';
import Card from '../../src/components/Card';
import { colors, spacing, typography } from '../../src/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Card>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>Coming Soon</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>Coming Soon</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
