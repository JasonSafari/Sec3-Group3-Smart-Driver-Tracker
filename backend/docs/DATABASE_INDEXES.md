# Database Indexing Recommendations

This document outlines recommended database indexes for optimal query performance.

## Required Indexes

### Users Table
```sql
-- Primary key index (already exists)
-- user_id (PRIMARY KEY)

-- Email lookup (frequent in auth)
CREATE INDEX idx_users_email ON users(email);

-- Family lookup (for family member queries)
CREATE INDEX idx_users_family_id ON users(family_id);

-- Role-based queries
CREATE INDEX idx_users_role ON users(role);
```

### Trips Table
```sql
-- Primary key index (already exists)
-- trip_id (PRIMARY KEY)

-- User trips lookup (most common query)
CREATE INDEX idx_trips_user_id ON trips(user_id);

-- Date range queries
CREATE INDEX idx_trips_start_time ON trips(start_time);
CREATE INDEX idx_trips_end_time ON trips(end_time);

-- Score lookup
CREATE INDEX idx_trips_score_id ON trips(score_id);

-- Composite index for user + date queries
CREATE INDEX idx_trips_user_start_time ON trips(user_id, start_time);
```

### DataPoints Table
```sql
-- Primary key index (already exists)
-- datapoint_id (PRIMARY KEY)

-- Trip datapoints lookup
CREATE INDEX idx_datapoints_trip_id ON datapoints(trip_id);

-- Timestamp queries
CREATE INDEX idx_datapoints_timestamp ON datapoints(timestamp);

-- Composite index for trip + timestamp
CREATE INDEX idx_datapoints_trip_timestamp ON datapoints(trip_id, timestamp);
```

### Scores Table
```sql
-- Primary key index (already exists)
-- score_id (PRIMARY KEY)

-- Score range queries
CREATE INDEX idx_scores_overall_score ON scores(overall_score);
```

### Family_Accounts Table
```sql
-- Primary key index (already exists)
-- family_id (PRIMARY KEY)

-- Invite code lookup (unique constraint already creates index)
-- invite_code (UNIQUE)
```

## Implementation

Run these SQL commands in your MySQL database:

```sql
-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Trips indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_start_time ON trips(start_time);
CREATE INDEX IF NOT EXISTS idx_trips_end_time ON trips(end_time);
CREATE INDEX IF NOT EXISTS idx_trips_score_id ON trips(score_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_start_time ON trips(user_id, start_time);

-- DataPoints indexes
CREATE INDEX IF NOT EXISTS idx_datapoints_trip_id ON datapoints(trip_id);
CREATE INDEX IF NOT EXISTS idx_datapoints_timestamp ON datapoints(timestamp);
CREATE INDEX IF NOT EXISTS idx_datapoints_trip_timestamp ON datapoints(trip_id, timestamp);

-- Scores indexes
CREATE INDEX IF NOT EXISTS idx_scores_overall_score ON scores(overall_score);
```

## Performance Impact

These indexes will significantly improve:
- User authentication queries (email lookup)
- Trip listing by user and date range
- Family member queries
- Data point retrieval for trip analysis
- Score-based filtering and sorting

## Monitoring

Check index usage:
```sql
SHOW INDEX FROM users;
SHOW INDEX FROM trips;
SHOW INDEX FROM datapoints;
SHOW INDEX FROM scores;
```

