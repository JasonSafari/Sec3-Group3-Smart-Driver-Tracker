import { StyleSheet, Text, View } from 'react-native';
import Card from '../../src/components/Card';
import { colors, spacing, typography } from '../../src/theme';

export default function ParentDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Dashboard</Text>

      <Card>
        <Text style={styles.placeholder}>Teen Driving Data Coming Soon...</Text>
      </Card>

      <Card>
        <Text style={styles.placeholder}>Notifications Coming Soon...</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.lg,
    color: colors.primary,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});
