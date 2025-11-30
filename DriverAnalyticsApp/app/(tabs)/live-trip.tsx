import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { colors, spacing, typography } from '../../src/theme';

// later this will come from Jason's location tracking service / Mario's API
export default function LiveTripScreen() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // fake values for now – later connect to real GPS data
  const [speedKmh, setSpeedKmh] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isActive) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // TODO: remove this fake stuff once GPS is wired in
        setSpeedKmh((prev) => Math.max(0, prev + (Math.random() * 10 - 5)));
        setDistanceKm((prev) => prev + 0.01);
      }, 1000);
    } else if (!isActive && elapsedSeconds !== 0) {
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleStartTrip = () => {
    // TODO: call Mario's POST /api/trips/start here later
    setElapsedSeconds(0);
    setDistanceKm(0);
    setSpeedKmh(0);
    setIsActive(true);
  };

  const handleStopTrip = () => {
    Alert.alert(
      'Stop Trip',
      'Are you sure you want to stop this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setIsActive(false);
            // TODO: call POST /api/trips/:id/stop and maybe save data
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Live Trip</Text>

      <Card>
        <Text style={styles.label}>Elapsed Time</Text>
        <Text style={styles.value}>{formatTime(elapsedSeconds)}</Text>
      </Card>

      <Card>
        <Text style={styles.label}>Current Speed</Text>
        <Text style={styles.value}>{speedKmh.toFixed(1)} km/h</Text>
      </Card>

      <Card>
        <Text style={styles.label}>Distance Traveled</Text>
        <Text style={styles.value}>{distanceKm.toFixed(2)} km</Text>
      </Card>

      <View style={styles.buttonRow}>
        {!isActive ? (
          <Button
            title="Start Trip"
            variant="primary"
            size="large"
            onPress={handleStartTrip}
          />
        ) : (
          <Button
            title="Stop Trip"
            variant="danger"
            size="large"
            onPress={handleStopTrip}
          />
        )}
      </View>

      <Text style={styles.note}>
        * In Sprint 2 this UI will be wired to Jason's tracking service and Mario's trip API.
      </Text>
    </SafeAreaView>
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
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  buttonRow: {
    marginTop: spacing.xl,
  },
  note: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
