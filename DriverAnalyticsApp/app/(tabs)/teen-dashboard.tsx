import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../src/theme";

export default function TeenDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teen Dashboard</Text>
      <Text style={styles.placeholder}>Trip Data Coming Soon...</Text>
      <Text style={styles.placeholder}>Score Coming Soon...</Text>
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
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
