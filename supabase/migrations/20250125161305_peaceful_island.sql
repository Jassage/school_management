/*
  # Academic Years Schema

  1. New Tables
    - academic_years
      - Stores academic year information
      - Includes validation for dates and automatic name generation
      - Tracks current academic year status

  2. Functions
    - generate_academic_year_name: Generates standardized year names
    - create_next_academic_year: Creates the next academic year
    - update_current_academic_year: Updates is_current flag

  3. Security
    - RLS enabled
    - Admin-only write access
    - Read access for all authenticated users
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
END;
$$ LANGUAGE plpgsql;

-- Function to update current academic year status
CREATE OR REPLACE FUNCTION update_current_academic_year()
RETURNS trigger AS $$
BEGIN
  -- Prevent recursive triggers
  IF (TG_OP = 'UPDATE' AND OLD.is_current = NEW.is_current) THEN
    RETURN NEW;
  END IF;

  -- Update is_current for all years
  UPDATE academic_years
  SET is_current = (
    CURRENT_DATE BETWEEN start_date AND end_date
  )
  WHERE id != COALESCE(NEW.id, OLD.id)
    OR (TG_OP = 'DELETE' AND id = OLD.id)
    OR (TG_OP IN ('INSERT', 'UPDATE') AND id = NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating is_current
CREATE TRIGGER update_current_academic_year_trigger
  AFTER INSERT OR UPDATE OR DELETE ON academic_years
  FOR EACH ROW
  EXECUTE FUNCTION update_current_academic_year();

-- Create initial academic year if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM academic_years) THEN
    PERFORM create_next_academic_year();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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