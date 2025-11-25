# Automatic Event Status Update System

## Overview
An intelligent system that automatically updates event statuses based on date, time, and admin actions without manual intervention.

## Event Status Lifecycle

```
draft → published → in_progress → completed
                         ↓
                    cancelled (admin action)
```

### Status Definitions

| Status | Description | How It Gets Set |
|--------|-------------|-----------------|
| **draft** | Event is being created but not visible to volunteers | Manual (admin creates but doesn't publish) |
| **published** | Event is active and volunteers can request to join | Manual (admin publishes) or Auto (on creation) |
| **in_progress** | Event is currently happening (during event time) | **Automatic** (when current time is between start/end) |
| **completed** | Event has finished successfully | **Automatic** (after event date/time passes) OR Manual (admin) |
| **cancelled** | Event was cancelled by admin | Manual only (admin cancels) |

## Automatic Status Updates

### 🤖 Algorithm Logic

The system runs **every 5 minutes** and checks:

#### Rule 1: Past Events → Completed
```javascript
IF EventDate < Today AND Status != 'cancelled'
THEN Status = 'completed'
```
**Example**: Event was on Nov 20, today is Nov 24 → Auto-complete

#### Rule 2: Today's Events (with time) → In Progress
```javascript
IF EventDate == Today AND CurrentTime >= StartTime AND CurrentTime <= EndTime
THEN Status = 'in_progress'
```
**Example**: Event today 2:00 PM - 5:00 PM, current time is 3:30 PM → Auto set to in_progress

#### Rule 3: Today's Events Ended → Completed
```javascript
IF EventDate == Today AND CurrentTime > EndTime
THEN Status = 'completed'
```
**Example**: Event today 2:00 PM - 5:00 PM, current time is 6:00 PM → Auto-complete

#### Rule 4: Today's Events (no time specified) → In Progress
```javascript
IF EventDate == Today AND StartTime == NULL AND Status == 'published'
THEN Status = 'in_progress'
```
**Example**: Event today with no specific time → Assume it's happening now

## Implementation Details

### Backend Automatic Updates

**File**: `server/routes/eventRoutes.js`

#### Function: `autoUpdateEventStatuses()`
```javascript
// Runs automatically every 5 minutes via setInterval
autoUpdateEventStatuses(null, null);

// Updates:
// 1. Past events → completed
// 2. Current events → in_progress
// 3. Ended events today → completed
// 4. Sends notifications to volunteers
```

**Startup Configuration**: `server/server.js`
```javascript
// Run immediately on server start
eventRoutes.autoUpdateEventStatuses(null, null);

// Then run every 5 minutes
setInterval(() => {
  eventRoutes.autoUpdateEventStatuses(null, null);
}, 5 * 60 * 1000);
```

### When Events Are Fetched

**Every time events are retrieved**, the system:
1. First runs `autoUpdateEventStatuses()` 
2. Waits 300ms for updates to complete
3. Then returns the events with updated statuses

**Route**: `GET /api/events` → Uses `getAllEventsWithAutoUpdate()`

### Manual Status Updates

Admins can still manually change status:
- **POST** `/api/events/:eventId/status`
- Can set to any valid status: `draft`, `published`, `in_progress`, `completed`, `cancelled`
- Manual status changes always override automatic updates

## Status Update Triggers

### Automatic Triggers
1. ⏰ **Every 5 minutes** - Background timer checks all events
2. 📋 **On event list fetch** - Before returning events to frontend
3. 🚀 **On server startup** - Immediate check when server starts

### Manual Triggers
1. 👨‍💼 **Admin cancels event** - Sets to `cancelled`, sends notifications
2. 👨‍💼 **Admin completes event** - Sets to `completed`, sends notifications
3. 🔄 **Admin changes status** - Any status transition, conditional notifications

## Notifications

### Automatic Completion Notification
When event is auto-completed:
```javascript
Subject: "Event Completed"
Message: "The event [Event Name] has been marked as completed. Thank you for your participation!"
Type: 'update'
Sent to: All volunteers with 'pending' or 'confirmed' matches
```

### Manual Status Change Notifications
When admin manually sets to `completed` or `cancelled`:
```javascript
// Cancelled:
Subject: "Event Cancelled"
Message: "The event [Event Name] has been cancelled. We apologize for any inconvenience."
Type: 'cancellation'

// Completed:
Subject: "Event Completed"
Message: "The event [Event Name] has been marked as completed. Thank you for your participation!"
Type: 'update'

Sent to: All assigned volunteers
```

## API Endpoints

### Get Events (with Auto-Update)
```
GET /api/events
```
- Automatically updates statuses before returning
- Returns all events with current statuses

### Manual Status Update
```
PUT /api/events/:eventId/status
Body: { EventID: 123, EventStatus: 'completed' }
```
- Allows admin to manually change status
- Sends notifications if status is `cancelled` or `completed`

### Force Status Update
```
POST /api/events/auto-update
```
- Manually trigger status update algorithm
- Returns list of updated events
- Useful for testing or immediate update needs

## Database Impact

### Status Update Query
```sql
UPDATE EventDetails 
SET EventStatus = ? 
WHERE EventID = ?
```

### Events Checked
```sql
SELECT EventID, EventName, EventStatus, EventDate, StartTime, EndTime
FROM EventDetails
WHERE EventStatus IN ('published', 'in_progress')
  AND EventDate <= CURDATE()
```
Only checks events that:
- Are published or in_progress (not draft/cancelled/already completed)
- Have event date today or in the past

## Example Scenarios

### Scenario 1: Food Bank Event
```
Created: Nov 20, 2025 (Status: published)
Event Date: Nov 24, 2025
Start Time: 10:00 AM
End Time: 3:00 PM

Timeline:
Nov 20-23: Status = published (volunteers can join)
Nov 24 9:00 AM: Status = published (not started yet)
Nov 24 10:30 AM: Status = in_progress (auto-updated, event is happening)
Nov 24 3:30 PM: Status = completed (auto-updated, event ended)
```

### Scenario 2: Event Cancelled by Admin
```
Created: Nov 20, 2025 (Status: published)
Event Date: Nov 28, 2025

Timeline:
Nov 20-23: Status = published
Nov 24 2:00 PM: Admin cancels → Status = cancelled
Nov 28: Status remains cancelled (auto-update skips cancelled events)
```

### Scenario 3: Multi-Day Event (No Time)
```
Created: Nov 20, 2025 (Status: published)
Event Date: Nov 24, 2025
Start Time: null
End Time: null

Timeline:
Nov 20-23: Status = published
Nov 24 12:00 AM: Status = in_progress (auto-updated, event day started)
Nov 25 12:00 AM: Status = completed (auto-updated, event day passed)
```

### Scenario 4: Urgent Event
```
Created: Nov 24, 2025 10:00 AM (Status: published)
Event Date: Nov 24, 2025
Start Time: 2:00 PM
End Time: 4:00 PM

Timeline:
10:00 AM: Status = published (just created)
10:05 AM: Auto-update runs → Status = published (event not started)
2:05 PM: Auto-update runs → Status = in_progress (event started)
4:05 PM: Auto-update runs → Status = completed (event ended)
```

## Benefits

### For Volunteers
- ✅ See accurate event status in real-time
- ✅ Know if event is currently happening
- ✅ Automatic notifications when events complete
- ✅ Can't request to join completed events

### For Admins
- ✅ No manual status management needed
- ✅ Automatic cleanup of past events
- ✅ Accurate reporting on event lifecycle
- ✅ Can still manually override when needed

### For System
- ✅ Always accurate event status
- ✅ Better data integrity
- ✅ Automated workflow
- ✅ Reduced admin workload

## Testing the Auto-Update

### Test 1: Check Auto-Update Function
```bash
# Create event for yesterday
# Wait 5 minutes
# Check if status changed to 'completed'
```

### Test 2: Check In-Progress Detection
```bash
# Create event for today with current time in range
# Call GET /api/events
# Verify status is 'in_progress'
```

### Test 3: Manual Override
```bash
# Auto-update sets status to 'completed'
# Admin manually sets to 'in_progress'
# Status should stay 'in_progress' until next auto-update
```

### Test 4: Notification Delivery
```bash
# Create event for yesterday with volunteers assigned
# Wait for auto-update
# Check volunteers received 'Event Completed' notification
```

## Configuration

### Update Interval
Change in `server/server.js`:
```javascript
// Every 5 minutes (default)
setInterval(() => {
  eventRoutes.autoUpdateEventStatuses(null, null);
}, 5 * 60 * 1000);

// Change to every 1 minute for testing
setInterval(() => {
  eventRoutes.autoUpdateEventStatuses(null, null);
}, 1 * 60 * 1000);
```

### Disable Auto-Update
Comment out in `server/server.js`:
```javascript
// Don't run automatically
// eventRoutes.autoUpdateEventStatuses(null, null);
// setInterval(() => {
//   eventRoutes.autoUpdateEventStatuses(null, null);
// }, 5 * 60 * 1000);
```

### Manual Trigger Only
```javascript
// Only update when GET /api/events is called
// Remove setInterval, keep only in getAllEventsWithAutoUpdate
```

## Monitoring

### Server Logs
```
[Auto-Update] Updated 3 event status(es) at 2025-11-24T10:05:00.000Z
[Auto-Update] Updated 0 event status(es) at 2025-11-24T10:10:00.000Z
```

### Database Queries
```sql
-- Check recent status changes
SELECT EventID, EventName, EventStatus, EventDate, StartTime, EndTime
FROM EventDetails
WHERE EventStatus IN ('in_progress', 'completed')
  AND EventDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
ORDER BY EventDate DESC;

-- Count events by status
SELECT EventStatus, COUNT(*) as Count
FROM EventDetails
GROUP BY EventStatus;
```

## Future Enhancements

### Phase 2
- 📧 Email notifications for status changes
- 📊 Status change audit log
- ⚙️ Configurable update intervals per event
- 🔔 Admin alerts for failed auto-updates
- 📅 Scheduled status changes (set completion date in advance)

### Phase 3
- 🤖 ML-based completion prediction
- 📈 Event duration analytics
- 🔄 Rollback capability for wrong auto-updates
- 📱 Push notifications for mobile apps

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0  
**Last Updated**: November 24, 2025
