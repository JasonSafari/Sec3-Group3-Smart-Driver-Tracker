# Scoring Algorithm Documentation

This document describes the driving safety scoring algorithm used in the Driver Analytics system.

## Overview

The scoring system calculates three scores:
1. **Speed Score**: Based on speeding violations
2. **Brake Score**: Based on harsh braking events
3. **Overall Score**: Average of speed and brake scores

## Algorithm Details

### Speed Score

- **Starting Score**: 100 points
- **Speed Limit**: 65 mph (104.6 km/h)
- **Unit Detection**: Automatically detects if speed is in mph or km/h
  - If speed > 50, assumes km/h and converts to mph
  - Otherwise, assumes already in mph

**Penalties**:
- 1-5 mph over limit: -2 points per violation
- 6-10 mph over limit: -5 points per violation
- 11+ mph over limit: -10 points per violation

**Minimum Score**: 0 (cannot go negative)

### Brake Score

- **Starting Score**: 100 points
- **Harsh Braking Threshold**: Acceleration < -3 m/s²

**Penalties**:
- -3 to -5 m/s²: -3 points (moderate braking)
- -5 to -8 m/s²: -7 points (harsh braking, counted as event)
- -8 m/s² or worse: -15 points (severe harsh braking, counted as event)

**Minimum Score**: 0 (cannot go negative)

### Overall Score

- **Calculation**: `(Speed Score + Brake Score) / 2`
- **Range**: 0-100
- **Precision**: Rounded to 2 decimal places

## Implementation

The algorithm is implemented in `backend/services/scoringService.js`:

```javascript
const { calculateScore } = require('./services/scoringService');

const score = calculateScore(datapoints);
// Returns: {
//   overall_score: number,
//   speed_score: number,
//   brake_score: number,
//   speeding_events: number,
//   harsh_brakes: number
// }
```

## Consistency

The algorithm is consistent across all scoring operations:
- Same thresholds and penalties everywhere
- Same unit conversion logic
- Same minimum score enforcement
- Same rounding precision

## Example Calculation

**Scenario**: Trip with 3 speeding events (2-3 mph over) and 1 harsh brake (-6 m/s²)

1. **Speed Score**: 100 - (2 + 2 + 2) = 94
2. **Brake Score**: 100 - 7 = 93
3. **Overall Score**: (94 + 93) / 2 = 93.5

## Future Enhancements

Potential improvements:
- Configurable speed limits per region
- Weighted scoring (speed vs brake importance)
- Time-of-day factors
- Weather condition adjustments
- Road type considerations

