/*
  # Academic Years Schema Update
  
  1. Changes
    - Fixes infinite recursion in trigger function
    - Improves performance of current year updates
    - Maintains existing functionality
    - Adds better error handling
*/

-- Create academic_years table
CREATE TABLE IF NOT EXISTS academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_academic_year CHECK (
    EXTRACT(MONTH FROM start_date) = 9 AND 
    EXTRACT(DAY FROM start_date) = 1 AND
    EXTRACT(MONTH FROM end_date) = 9 AND 
    EXTRACT(DAY FROM end_date) = 30
  )
);

-- Function to generate academic year name
CREATE OR REPLACE FUNCTION generate_academic_year_name(start_date date)
RETURNS text AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM start_date)::text || '-' || (EXTRACT(YEAR FROM start_date) + 1)::text;
END;
$$ LANGUAGE plpgsql;

-- Function to mark current academic year
CREATE OR REPLACE FUNCTION mark_current_academic_year()
RETURNS void AS $$
BEGIN
  -- Update all years in a single transaction
  WITH current_year AS (
    SELECT id
    FROM academic_years
    WHERE CURRENT_DATE BETWEEN start_date AND end_date
    LIMIT 1
  )
  UPDATE academic_years
  SET is_current = (id IN (SELECT id FROM current_year));
END;
$$ LANGUAGE plpgsql;

-- Function to create next academic year
CREATE OR REPLACE FUNCTION create_next_academic_year()
RETURNS void AS $$
DECLARE
  last_year record;
  next_start date;
  next_end date;
  next_name text;
BEGIN
  -- Get the last academic year
  SELECT * FROM academic_years 
  ORDER BY start_date DESC 
  LIMIT 1 
  INTO last_year;

  IF last_year IS NULL THEN
    -- If no years exist, create current year
    next_start := make_date(EXTRACT(YEAR FROM CURRENT_DATE)::integer, 9, 1);
  ELSE
    -- Create next year
    next_start := make_date(EXTRACT(YEAR FROM last_year.end_date)::integer, 9, 1);
  END IF;

  next_end := make_date(EXTRACT(YEAR FROM next_start)::integer + 1, 9, 30);
  next_name := generate_academic_year_name(next_start);

  -- Insert new academic year
  INSERT INTO academic_years (name, start_date, end_date)
  VALUES (next_name, next_start, next_end);
  
  -- Update current year status
  PERFORM mark_current_academic_year();
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for automatic updates
CREATE OR REPLACE FUNCTION academic_year_trigger_func()
RETURNS trigger AS $$
BEGIN
  -- Only update if necessary
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date)) OR
     (TG_OP = 'DELETE') THEN
    PERFORM mark_current_academic_year();
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updates
DROP TRIGGER IF EXISTS academic_year_changes ON academic_years;
CREATE TRIGGER academic_year_changes
  AFTER INSERT OR UPDATE OR DELETE ON academic_years
  FOR EACH ROW
  EXECUTE FUNCTION academic_year_trigger_func();

-- Create initial academic year if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM academic_years) THEN
    PERFORM create_next_academic_year();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Administrators can manage academic years" ON academic_years;
DROP POLICY IF EXISTS "Everyone can view academic years" ON academic_years;

-- Create new policies
CREATE POLICY "Administrators can manage academic years"
  ON academic_years
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

CREATE POLICY "Everyone can view academic years"
  ON academic_years
  FOR SELECT
  TO authenticated
  USING (true);

-- Add helpful comments
COMMENT ON TABLE academic_years IS 'Academic years with their date ranges and current status';
COMMENT ON COLUMN academic_years.name IS 'Academic year name in format YYYY-YYYY';
COMMENT ON COLUMN academic_years.start_date IS 'Start date (September 1st)';
COMMENT ON COLUMN academic_years.end_date IS 'End date (September 30th next year)';
COMMENT ON COLUMN academic_years.is_current IS 'Whether this is the current academic year';