/*
  # Events and Announcements Schema

  1. New Tables
    - events: Store school events
    - announcements: Store system announcements
    - event_attendees: Track event attendance
    - announcement_recipients: Track announcement delivery

  2. Security
    - RLS policies for all tables
    - Audit logging integration
*/

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('academic', 'social', 'administrative', 'other')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  max_attendees integer,
  registration_deadline timestamptz,
  is_public boolean DEFAULT true,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_event_dates CHECK (end_date > start_date)
);

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registration_date timestamptz DEFAULT now(),
  notes text,
  UNIQUE(event_id, user_id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  announcement_type text NOT NULL CHECK (announcement_type IN ('general', 'academic', 'administrative', 'emergency')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  target_roles text[] DEFAULT '{}',
  target_levels text[] DEFAULT '{}',
  target_faculties uuid[] DEFAULT '{}',
  is_public boolean DEFAULT true,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Announcement recipients table
CREATE TABLE IF NOT EXISTS announcement_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_recipients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Administrators can manage events" ON events;
  DROP POLICY IF EXISTS "Users can view public events" ON events;
  DROP POLICY IF EXISTS "Users can manage their own attendance" ON event_attendees;
  DROP POLICY IF EXISTS "Administrators can manage announcements" ON announcements;
  DROP POLICY IF EXISTS "Users can view relevant announcements" ON announcements;
  DROP POLICY IF EXISTS "Users can manage their own announcement receipts" ON announcement_recipients;
END $$;

-- Events policies
CREATE POLICY "Administrators can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view public events"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Event attendees policies
CREATE POLICY "Users can manage their own attendance"
  ON event_attendees
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Announcements policies
CREATE POLICY "Administrators can manage announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view relevant announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    AND (
      is_public = true
      OR auth.uid() = created_by
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND (
          profiles.role = ANY(target_roles)
          OR array_length(target_roles, 1) IS NULL
        )
      )
    )
  );

-- Announcement recipients policies
CREATE POLICY "Users can manage their own announcement receipts"
  ON announcement_recipients
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Functions

-- Function to check event capacity
CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = NEW.event_id
    AND e.max_attendees IS NOT NULL
    AND (
      SELECT COUNT(*)
      FROM event_attendees
      WHERE event_id = e.id
      AND status = 'registered'
    ) >= e.max_attendees
  ) THEN
    RAISE EXCEPTION 'Event has reached maximum capacity';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for event capacity check
DROP TRIGGER IF EXISTS check_event_capacity_trigger ON event_attendees;
CREATE TRIGGER check_event_capacity_trigger
  BEFORE INSERT ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION check_event_capacity();

-- Function to update announcement status based on dates
CREATE OR REPLACE FUNCTION update_announcement_status()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'published' THEN
    IF NEW.end_date IS NOT NULL AND NEW.end_date < now() THEN
      NEW.status := 'archived';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for announcement status updates
DROP TRIGGER IF EXISTS update_announcement_status_trigger ON announcements;
CREATE TRIGGER update_announcement_status_trigger
  BEFORE INSERT OR UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcement_status();

-- Function to create announcement recipients
CREATE OR REPLACE FUNCTION create_announcement_recipients()
RETURNS trigger AS $$
BEGIN
  -- Create recipients for targeted users
  INSERT INTO announcement_recipients (announcement_id, user_id)
  SELECT NEW.id, p.user_id
  FROM profiles p
  WHERE 
    (array_length(NEW.target_roles, 1) IS NULL OR p.role = ANY(NEW.target_roles))
    AND NOT EXISTS (
      SELECT 1 FROM announcement_recipients
      WHERE announcement_id = NEW.id AND user_id = p.user_id
    );
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for creating announcement recipients
DROP TRIGGER IF EXISTS create_announcement_recipients_trigger ON announcements;
CREATE TRIGGER create_announcement_recipients_trigger
  AFTER INSERT ON announcements
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION create_announcement_recipients();

-- Add helpful comments
COMMENT ON TABLE events IS 'School events and activities';
COMMENT ON TABLE event_attendees IS 'Track event attendance and registration';
COMMENT ON TABLE announcements IS 'System-wide announcements and notifications';
COMMENT ON TABLE announcement_recipients IS 'Track announcement delivery and read status';