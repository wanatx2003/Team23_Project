CREATE DATABASE IF NOT EXISTS volunteer_management;
USE volunteer_management;

DROP TABLE IF EXISTS States;
CREATE TABLE States (
  StateID INT NOT NULL AUTO_INCREMENT,
  StateCode CHAR(2) NOT NULL,
  StateName VARCHAR(50) NOT NULL,
  PRIMARY KEY (StateID),
  UNIQUE KEY (StateCode),
  UNIQUE KEY (StateName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert all 50 US states after table creation
INSERT IGNORE INTO States (StateCode, StateName) VALUES
('AL', 'Alabama'),
('AK', 'Alaska'),
('AZ', 'Arizona'),
('AR', 'Arkansas'),
('CA', 'California'),
('CO', 'Colorado'),
('CT', 'Connecticut'),
('DE', 'Delaware'),
('FL', 'Florida'),
('GA', 'Georgia'),
('HI', 'Hawaii'),
('ID', 'Idaho'),
('IL', 'Illinois'),
('IN', 'Indiana'),
('IA', 'Iowa'),
('KS', 'Kansas'),
('KY', 'Kentucky'),
('LA', 'Louisiana'),
('ME', 'Maine'),
('MD', 'Maryland'),
('MA', 'Massachusetts'),
('MI', 'Michigan'),
('MN', 'Minnesota'),
('MS', 'Mississippi'),
('MO', 'Missouri'),
('MT', 'Montana'),
('NE', 'Nebraska'),
('NV', 'Nevada'),
('NH', 'New Hampshire'),
('NJ', 'New Jersey'),
('NM', 'New Mexico'),
('NY', 'New York'),
('NC', 'North Carolina'),
('ND', 'North Dakota'),
('OH', 'Ohio'),
('OK', 'Oklahoma'),
('OR', 'Oregon'),
('PA', 'Pennsylvania'),
('RI', 'Rhode Island'),
('SC', 'South Carolina'),
('SD', 'South Dakota'),
('TN', 'Tennessee'),
('TX', 'Texas'),
('UT', 'Utah'),
('VT', 'Vermont'),
('VA', 'Virginia'),
('WA', 'Washington'),
('WV', 'West Virginia'),
('WI', 'Wisconsin'),
('WY', 'Wyoming');

DROP TABLE IF EXISTS UserCredentials;
CREATE TABLE UserCredentials (
  UserID INT NOT NULL AUTO_INCREMENT,
  Username VARCHAR(50) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Email VARCHAR(100) NOT NULL,
  PhoneNumber BIGINT DEFAULT NULL,
  Role ENUM('volunteer','admin') NOT NULL DEFAULT 'volunteer',
  AccountCreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  AccountStatus ENUM('Active','Suspended') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (UserID),
  UNIQUE KEY (Username),
  UNIQUE KEY (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS UserProfile;
CREATE TABLE UserProfile (
  ProfileID INT NOT NULL AUTO_INCREMENT,
  UserID INT NOT NULL,
  FullName VARCHAR(100) NOT NULL,
  Address1 VARCHAR(100) NOT NULL,
  Address2 VARCHAR(100) DEFAULT NULL,
  City VARCHAR(100) NOT NULL,
  StateCode CHAR(2) NOT NULL,
  Zipcode VARCHAR(9) NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ProfileID),
  UNIQUE KEY (UserID),
  KEY (City),
  KEY (StateCode),
  CONSTRAINT fk_userprofile_user FOREIGN KEY (UserID) REFERENCES UserCredentials(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_userprofile_state FOREIGN KEY (StateCode) REFERENCES States(StateCode) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS UserSkill;
CREATE TABLE UserSkill (
  UserSkillID INT NOT NULL AUTO_INCREMENT,
  UserID INT NOT NULL,
  SkillName VARCHAR(100) NOT NULL,
  PRIMARY KEY (UserSkillID),
  KEY (UserID),
  KEY (SkillName),
  CONSTRAINT fk_userskill_user FOREIGN KEY (UserID) REFERENCES UserCredentials(UserID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS UserPreference;
CREATE TABLE UserPreference (
  UserPreferenceID INT NOT NULL AUTO_INCREMENT,
  UserID INT NOT NULL,
  PreferenceText VARCHAR(255) NOT NULL,
  PRIMARY KEY (UserPreferenceID),
  KEY (UserID),
  CONSTRAINT fk_userpref_user FOREIGN KEY (UserID) REFERENCES UserCredentials(UserID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS UserAvailability;
CREATE TABLE UserAvailability (
  AvailabilityID INT NOT NULL AUTO_INCREMENT,
  UserID INT NOT NULL,
  DayOfWeek ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  StartTime TIME NOT NULL,
  EndTime TIME NOT NULL,
  PRIMARY KEY (AvailabilityID),
  KEY (UserID),
  KEY (DayOfWeek),
  CONSTRAINT fk_useravailability_user FOREIGN KEY (UserID) REFERENCES UserCredentials(UserID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS EventDetails;
CREATE TABLE EventDetails (
  EventID INT NOT NULL AUTO_INCREMENT,
  EventName VARCHAR(100) NOT NULL,
  Description TEXT NOT NULL,
  Location TEXT NOT NULL,
  Urgency ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  EventDate DATE NOT NULL,
  StartTime TIME DEFAULT NULL,
  EndTime TIME DEFAULT NULL,
  CreatedBy INT NOT NULL,
  MaxVolunteers INT DEFAULT NULL,
  CurrentVolunteers INT NOT NULL DEFAULT 0,
  EventStatus ENUM('draft','published','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (EventID),
  KEY (EventDate),
  KEY (Urgency),
  CONSTRAINT fk_eventdetails_user FOREIGN KEY (CreatedBy) REFERENCES UserCredentials(UserID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS EventRequiredSkill;
CREATE TABLE EventRequiredSkill (
  EventRequiredSkillID INT NOT NULL AUTO_INCREMENT,
  EventID INT NOT NULL,
  SkillName VARCHAR(100) NOT NULL,
  PRIMARY KEY (EventRequiredSkillID),
  KEY (EventID),
  KEY (SkillName),
  CONSTRAINT fk_eventskill_event FOREIGN KEY (EventID) REFERENCES EventDetails(EventID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS VolunteerMatches;
CREATE TABLE VolunteerMatches (
  MatchID INT NOT NULL AUTO_INCREMENT,
  VolunteerID INT NOT NULL,
  EventID INT NOT NULL,
  MatchStatus ENUM('pending','confirmed','declined','completed') NOT NULL DEFAULT 'pending',
  RequestedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (MatchID),
  UNIQUE KEY uq_volunteer_event (VolunteerID, EventID),
  KEY (MatchStatus),
  CONSTRAINT fk_volmatch_user FOREIGN KEY (VolunteerID) REFERENCES UserCredentials(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_volmatch_event FOREIGN KEY (EventID) REFERENCES EventDetails(EventID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS VolunteerHistory;
CREATE TABLE VolunteerHistory (
  HistoryID INT NOT NULL AUTO_INCREMENT,
  VolunteerID INT NOT NULL,
  EventID INT NOT NULL,
  ParticipationStatus ENUM('registered','attended','no_show','cancelled') NOT NULL,
  HoursVolunteered DECIMAL(5,2) DEFAULT NULL,
  ParticipationDate DATE NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (HistoryID),
  KEY (VolunteerID),
  KEY (EventID),
  KEY (ParticipationDate),
  CONSTRAINT fk_volhistory_user FOREIGN KEY (VolunteerID) REFERENCES UserCredentials(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_volhistory_event FOREIGN KEY (EventID) REFERENCES EventDetails(EventID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS Notifications;
CREATE TABLE Notifications (
  NotificationID INT NOT NULL AUTO_INCREMENT,
  UserID INT NOT NULL,
  Subject VARCHAR(255) NOT NULL,
  Message TEXT NOT NULL,
  NotificationType ENUM('assignment','reminder','update','cancellation','attendance') NOT NULL,
  IsRead TINYINT(1) NOT NULL DEFAULT 0,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (NotificationID),
  KEY idx_user_read (UserID, IsRead),
  CONSTRAINT fk_notifications_user FOREIGN KEY (UserID) REFERENCES UserCredentials(UserID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TRIGGERS FOR DATA INTEGRITY AND AUTOMATION
-- ============================================

-- ----------------------------------------------------------------
-- TRIGGER 1: Auto-update CurrentVolunteers count when VolunteerMatches changes
-- This ensures EventDetails.CurrentVolunteers stays synchronized with actual matches
-- ----------------------------------------------------------------

DELIMITER $$

DROP TRIGGER IF EXISTS update_current_volunteers_after_match_insert$$
CREATE TRIGGER update_current_volunteers_after_match_insert
AFTER INSERT ON VolunteerMatches
FOR EACH ROW
BEGIN
  -- Update the CurrentVolunteers count for the event
  UPDATE EventDetails
  SET CurrentVolunteers = (
    SELECT COUNT(DISTINCT VolunteerID)
    FROM VolunteerMatches
    WHERE EventID = NEW.EventID 
      AND MatchStatus IN ('pending', 'confirmed')
  )
  WHERE EventID = NEW.EventID;
END$$

DROP TRIGGER IF EXISTS update_current_volunteers_after_match_update$$
CREATE TRIGGER update_current_volunteers_after_match_update
AFTER UPDATE ON VolunteerMatches
FOR EACH ROW
BEGIN
  -- Update count when match status changes
  UPDATE EventDetails
  SET CurrentVolunteers = (
    SELECT COUNT(DISTINCT VolunteerID)
    FROM VolunteerMatches
    WHERE EventID = NEW.EventID 
      AND MatchStatus IN ('pending', 'confirmed')
  )
  WHERE EventID = NEW.EventID;
  
  -- Also update old event if EventID changed (rare but possible)
  IF OLD.EventID != NEW.EventID THEN
    UPDATE EventDetails
    SET CurrentVolunteers = (
      SELECT COUNT(DISTINCT VolunteerID)
      FROM VolunteerMatches
      WHERE EventID = OLD.EventID 
        AND MatchStatus IN ('pending', 'confirmed')
    )
    WHERE EventID = OLD.EventID;
  END IF;
END$$

DROP TRIGGER IF EXISTS update_current_volunteers_after_match_delete$$
CREATE TRIGGER update_current_volunteers_after_match_delete
AFTER DELETE ON VolunteerMatches
FOR EACH ROW
BEGIN
  -- Update count when match is deleted
  UPDATE EventDetails
  SET CurrentVolunteers = (
    SELECT COUNT(DISTINCT VolunteerID)
    FROM VolunteerMatches
    WHERE EventID = OLD.EventID 
      AND MatchStatus IN ('pending', 'confirmed')
  )
  WHERE EventID = OLD.EventID;
END$$

-- ----------------------------------------------------------------
-- TRIGGER 2: Auto-create notification when volunteer is matched to event
-- This ensures volunteers are immediately notified of new assignments
-- ----------------------------------------------------------------

DROP TRIGGER IF EXISTS notify_volunteer_on_match$$
CREATE TRIGGER notify_volunteer_on_match
AFTER INSERT ON VolunteerMatches
FOR EACH ROW
BEGIN
  DECLARE event_name VARCHAR(100);
  DECLARE event_date DATE;
  DECLARE notification_message TEXT;
  
  -- Get event details
  SELECT EventName, EventDate INTO event_name, event_date
  FROM EventDetails
  WHERE EventID = NEW.EventID;
  
  -- Create notification message
  SET notification_message = CONCAT(
    'You have been matched to the event "', event_name, 
    '" scheduled for ', DATE_FORMAT(event_date, '%M %d, %Y'),
    '. Please check your dashboard for more details and confirm your participation.'
  );
  
  -- Insert notification for the volunteer
  INSERT INTO Notifications (UserID, Subject, Message, NotificationType, IsRead, CreatedAt)
  VALUES (
    NEW.VolunteerID,
    'New Event Assignment',
    notification_message,
    'assignment',
    0,
    NOW()
  );
END$$

-- ----------------------------------------------------------------
-- TRIGGER 3 (BONUS): Prevent overbooking - Check MaxVolunteers limit
-- This ensures events don't exceed their volunteer capacity
-- ----------------------------------------------------------------

DROP TRIGGER IF EXISTS prevent_event_overbooking$$
CREATE TRIGGER prevent_event_overbooking
BEFORE INSERT ON VolunteerMatches
FOR EACH ROW
BEGIN
  DECLARE max_vol INT;
  DECLARE current_vol INT;
  DECLARE event_name VARCHAR(100);
  
  -- Get event capacity
  SELECT MaxVolunteers, CurrentVolunteers, EventName 
  INTO max_vol, current_vol, event_name
  FROM EventDetails
  WHERE EventID = NEW.EventID;
  
  -- Check if event has capacity limit and if it's reached
  IF max_vol IS NOT NULL AND current_vol >= max_vol THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Cannot match volunteer: Event has reached maximum capacity';
  END IF;
END$$

-- ----------------------------------------------------------------
-- TRIGGER 4 (BONUS): Auto-update EventStatus based on date and volunteers
-- This automatically manages event lifecycle
-- ----------------------------------------------------------------

DROP TRIGGER IF EXISTS auto_update_event_status$$
CREATE TRIGGER auto_update_event_status
BEFORE UPDATE ON EventDetails
FOR EACH ROW
BEGIN
  -- Auto-complete past events that are still in progress
  IF NEW.EventDate < CURDATE() AND NEW.EventStatus = 'in_progress' THEN
    SET NEW.EventStatus = 'completed';
  END IF;
  
  -- Auto-publish events with volunteers that are in draft
  IF NEW.EventStatus = 'draft' AND NEW.CurrentVolunteers > 0 THEN
    SET NEW.EventStatus = 'published';
  END IF;
END$$

DELIMITER ;

-- ============================================
-- END OF TRIGGERS
-- ============================================
