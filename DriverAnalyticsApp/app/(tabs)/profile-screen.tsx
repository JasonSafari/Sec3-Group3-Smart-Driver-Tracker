import { StyleSheet, Text, View } from "react-native";
import Button from "../../src/components/Button";
import Card from "../../src/components/Card";
import { colors, spacing, typography } from "../../src/theme";

export default function ProfileScreen() {
    const user = { name: "Maxwell Omorodion", email: "maxwell@example.com" };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profile</Text>

            <Card>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{user.name}</Text>

                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
            </Card>

            <Button title="Edit Profile" onPress={() => {}} />
            <Button title="Logout" variant="danger" onPress={() => {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
    header: { fontSize: typography.sizes.xxl, fontWeight: "bold" },
    label: { marginTop: spacing.sm, fontWeight: "600" },
    value: { fontSize: typography.sizes.md, marginBottom: spacing.sm }
});
