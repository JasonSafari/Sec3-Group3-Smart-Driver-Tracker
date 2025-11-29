# Foreign Key Constraints

This document outlines recommended foreign key constraints for data integrity.

## Current Status

Sequelize associations are defined in `models/index.js`, but database-level foreign key constraints may not be enforced. This document provides SQL to add proper foreign key constraints.

## Recommended Foreign Key Constraints

### Users Table
```sql
-- Link users to family_accounts
ALTER TABLE users
ADD CONSTRAINT fk_users_family_id
FOREIGN KEY (family_id) REFERENCES family_accounts(family_id)
ON DELETE SET NULL
ON UPDATE CASCADE;
```

### Trips Table
```sql
-- Link trips to users
ALTER TABLE trips
ADD CONSTRAINT fk_trips_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Link trips to scores
ALTER TABLE trips
ADD CONSTRAINT fk_trips_score_id
FOREIGN KEY (score_id) REFERENCES scores(score_id)
ON DELETE SET NULL
ON UPDATE CASCADE;
```

### DataPoints Table
```sql
-- Link datapoints to trips
ALTER TABLE datapoints
ADD CONSTRAINT fk_datapoints_trip_id
FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```

## Implementation

**⚠️ WARNING:** Adding foreign keys to existing tables with data requires:
1. Ensuring all existing data satisfies the constraints
2. Backing up your database first
3. Running during maintenance window

### Step 1: Check Existing Data
```sql
-- Check for orphaned records
SELECT * FROM trips WHERE user_id NOT IN (SELECT user_id FROM users);
SELECT * FROM trips WHERE score_id IS NOT NULL AND score_id NOT IN (SELECT score_id FROM scores);
SELECT * FROM datapoints WHERE trip_id NOT IN (SELECT trip_id FROM trips);
SELECT * FROM users WHERE family_id IS NOT NULL AND family_id NOT IN (SELECT family_id FROM family_accounts);
```

### Step 2: Clean Up Orphaned Records (if any)
```sql
-- Remove orphaned trips
DELETE FROM trips WHERE user_id NOT IN (SELECT user_id FROM users);

-- Remove orphaned datapoints
DELETE FROM datapoints WHERE trip_id NOT IN (SELECT trip_id FROM trips);

-- Remove orphaned user-family links
UPDATE users SET family_id = NULL WHERE family_id IS NOT NULL AND family_id NOT IN (SELECT family_id FROM family_accounts);
```

### Step 3: Add Foreign Keys
```sql
-- Users foreign keys
ALTER TABLE users
ADD CONSTRAINT fk_users_family_id
FOREIGN KEY (family_id) REFERENCES family_accounts(family_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Trips foreign keys
ALTER TABLE trips
ADD CONSTRAINT fk_trips_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE trips
ADD CONSTRAINT fk_trips_score_id
FOREIGN KEY (score_id) REFERENCES scores(score_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- DataPoints foreign keys
ALTER TABLE datapoints
ADD CONSTRAINT fk_datapoints_trip_id
FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```

## Benefits

Foreign key constraints ensure:
- **Data Integrity**: Prevents orphaned records
- **Referential Integrity**: Ensures relationships are valid
- **Cascade Deletes**: Automatically removes related records when parent is deleted
- **Cascade Updates**: Updates foreign keys when primary keys change

## Verification

Check foreign keys are active:
```sql
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'your_database_name'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

