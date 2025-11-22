# Event Status Testing Guide

## What I Fixed:

### 1. **Added Manual Status Update Endpoint**
   - **Route:** `PUT /api/events/:id/status`
   - **Function:** `updateEventStatus()` in `eventRoutes.js`
   - **Purpose:** Allows admins to manually change event status via dropdown

### 2. **Added Status Dropdown to UI**
   - Each event card now has a status dropdown
   - Changes are saved immediately when you select a new status
   - Color-coded by status (draft=gray, published=green, in_progress=blue, completed=purple, cancelled=red)

### 3. **Database Triggers (Already in Your SQL)**
   Your triggers work correctly! They run in these scenarios:
   
   - **`auto_update_event_status`**: Runs BEFORE UPDATE on EventDetails
     - Auto-completes past events: If EventDate < today and status = 'in_progress', changes to 'completed'
     - Auto-publishes events: If status = 'draft' and CurrentVolunteers > 0, changes to 'published'

## How to Test:

### Test 1: Manual Status Change (Most Common)
1. Start both servers
2. Login as admin
3. Go to "Event Management"
4. Click the status dropdown on any event
5. Select a new status (e.g., change "published" to "in_progress")
6. Alert should confirm "Event status updated successfully!"
7. Page refreshes and shows new status

### Test 2: Auto-Complete Past Events
1. In MySQL, run:
```sql
-- Create a past event that's in progress
INSERT INTO EventDetails (EventName, Description, Location, Urgency, EventDate, CreatedBy, EventStatus)
VALUES ('Past Event Test', 'Testing auto-complete', '123 Main St', 'medium', '2025-01-01', 1, 'in_progress');

-- Now update it (trigger will auto-change status to 'completed')
UPDATE EventDetails SET MaxVolunteers = 50 WHERE EventName = 'Past Event Test';

-- Check the status - should be 'completed'
SELECT EventName, EventDate, EventStatus FROM EventDetails WHERE EventName = 'Past Event Test';
```

### Test 3: Auto-Publish Draft Events
1. In MySQL, run:
```sql
-- Create a draft event
INSERT INTO EventDetails (EventName, Description, Location, Urgency, EventDate, CreatedBy, EventStatus)
VALUES ('Draft Event Test', 'Testing auto-publish', '123 Main St', 'medium', '2025-12-25', 1, 'draft');

-- Get the EventID
SET @eventID = LAST_INSERT_ID();

-- Add a volunteer (this will trigger CurrentVolunteers update)
INSERT INTO VolunteerMatches (VolunteerID, EventID, MatchStatus)
VALUES (2, @eventID, 'pending');

-- Now update the event (trigger will auto-change status to 'published')
UPDATE EventDetails SET Description = 'Updated description' WHERE EventID = @eventID;

-- Check the status - should be 'published'
SELECT EventName, CurrentVolunteers, EventStatus FROM EventDetails WHERE EventID = @eventID;
```

### Test 4: Verify Triggers Exist
Run this in MySQL to check triggers are installed:
```sql
SHOW TRIGGERS FROM volunteer_management WHERE `Trigger` LIKE '%event%';
```

You should see:
- `update_current_volunteers_after_match_insert`
- `update_current_volunteers_after_match_update`
- `update_current_volunteers_after_match_delete`
- `notify_volunteer_on_match`
- `prevent_event_overbooking`
- `auto_update_event_status` ← This one controls status

### Test 5: Full Workflow Test
1. Create a new event as admin (status = 'published')
2. Change status to "In Progress" using dropdown
3. Add some volunteer matches
4. Change status to "Completed" when event is done
5. Or change to "Cancelled" if event is cancelled

## Status Flow:

```
draft → published → in_progress → completed
                  ↓
              cancelled (any time)
```

## Why Status Doesn't Change Automatically:

The trigger `auto_update_event_status` only runs when you **UPDATE** an event. It doesn't run automatically every day. So:

- **Manual changes needed:** Use the dropdown to move from published → in_progress → completed
- **Automatic changes only happen:** 
  - When you edit an event AND it's past date AND status = 'in_progress' → becomes 'completed'
  - When you edit an event AND it's draft AND has volunteers → becomes 'published'

## To Make Status Auto-Change Daily:

If you want statuses to change automatically without manual updates, you'd need:

1. **Option A: Cron Job** (External script that runs daily)
```javascript
// Run this script daily via Node.js cron
const mysql = require('mysql2/promise');
const pool = mysql.createPool({/* your config */});

async function autoUpdateEventStatuses() {
  // Auto-complete past events
  await pool.query(`
    UPDATE EventDetails 
    SET EventStatus = 'completed' 
    WHERE EventDate < CURDATE() AND EventStatus = 'in_progress'
  `);
}

// Run daily at midnight
```

2. **Option B: MySQL Event Scheduler** (Built into MySQL)
```sql
-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Create daily job
CREATE EVENT auto_complete_past_events
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  UPDATE EventDetails 
  SET EventStatus = 'completed' 
  WHERE EventDate < CURDATE() AND EventStatus = 'in_progress';
```

## Current Implementation Summary:

✅ **Manual status changes:** Working via dropdown (most common use case)
✅ **Triggers:** Working correctly (only run on UPDATE)
✅ **UI:** Color-coded status dropdown on each event
✅ **API:** PUT /api/events/:id/status endpoint added

The system is now fully functional for manual event status management!
