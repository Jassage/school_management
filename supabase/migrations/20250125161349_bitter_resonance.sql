/*
  # Grades Schema

  1. New Tables
    - grade_thresholds: Stores grade ranges and their corresponding letter grades
    - faculty_subjects: Links subjects to faculties and teachers
    - grade_calculations: Stores grade calculation rules per subject
    - student_grades: Stores individual student grades
    - report_card_templates: Stores report card layout templates
    - report_cards: Stores generated report cards

  2. Functions
    - calculate_final_grade: Calculates final grade from components
    - get_letter_grade: Determines letter grade from numeric grade
    - calculate_gpa: Calculates GPA for a student

  3. Security
    - RLS enabled on all tables
    - Admin full access
    - Teachers access to their subjects' grades
    - Students access to their own grades
*/

-- Faculty subjects table (must be created first as it's referenced by other tables)
CREATE TABLE IF NOT EXISTS faculty_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  teacher_id uuid REFERENCES auth.users NOT NULL,
  level text NOT NULL CHECK (level IN ('L1', 'L2', 'L3', 'M1', 'M2')),
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  academic_year_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Grade thresholds table
CREATE TABLE IF NOT EXISTS grade_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_score numeric NOT NULL,
  max_score numeric NOT NULL,
  letter_grade text NOT NULL,
  grade_point numeric NOT NULL,
  description text,
  is_passing boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_score_range CHECK (min_score >= 0 AND max_score <= 100 AND max_score > min_score)
);

-- Grade calculations table
CREATE TABLE IF NOT EXISTS grade_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_subject_id uuid REFERENCES faculty_subjects NOT NULL,
  academic_year_id uuid NOT NULL,
  cc_weight numeric DEFAULT 0.4,
  exam_weight numeric DEFAULT 0.6,
  passing_grade numeric DEFAULT 70,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_weights CHECK (cc_weight + exam_weight = 1.0),
  CONSTRAINT valid_passing_grade CHECK (passing_grade >= 0 AND passing_grade <= 100)
);

-- Report card templates table
CREATE TABLE IF NOT EXISTS report_card_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  header_content jsonb,
  footer_content jsonb,
  layout_config jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student grades table
CREATE TABLE IF NOT EXISTS student_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users NOT NULL,
  faculty_subject_id uuid REFERENCES faculty_subjects NOT NULL,
  academic_year_id uuid NOT NULL,
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  cc_grade numeric,
  exam_grade numeric,
  final_grade numeric,
  letter_grade text,
  grade_point numeric,
  is_passing boolean,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  CONSTRAINT valid_grades CHECK (
    (cc_grade IS NULL OR (cc_grade >= 0 AND cc_grade <= 100)) AND
    (exam_grade IS NULL OR (exam_grade >= 0 AND exam_grade <= 100)) AND
    (final_grade IS NULL OR (final_grade >= 0 AND final_grade <= 100))
  )
);

-- Report cards table
CREATE TABLE IF NOT EXISTS report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users NOT NULL,
  academic_year_id uuid NOT NULL,
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  template_id uuid REFERENCES report_card_templates NOT NULL,
  grade_data jsonb NOT NULL,
  gpa numeric,
  total_credits numeric,
  status text CHECK (status IN ('draft', 'final', 'archived')),
  generated_at timestamptz DEFAULT now(),
  generated_by uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE faculty_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- Policies for faculty_subjects
CREATE POLICY "Admins can manage faculty subjects"
  ON faculty_subjects
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

CREATE POLICY "Teachers can view their faculty subjects"
  ON faculty_subjects
  FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for grade_thresholds
CREATE POLICY "Admins can manage grade thresholds"
  ON grade_thresholds
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

CREATE POLICY "Everyone can view grade thresholds"
  ON grade_thresholds
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for grade_calculations
CREATE POLICY "Admins can manage grade calculations"
  ON grade_calculations
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

CREATE POLICY "Teachers can view grade calculations"
  ON grade_calculations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM faculty_subjects fs
      WHERE fs.id = grade_calculations.faculty_subject_id
      AND fs.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for report_card_templates
CREATE POLICY "Admins can manage report card templates"
  ON report_card_templates
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

CREATE POLICY "Everyone can view report card templates"
  ON report_card_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for student_grades
CREATE POLICY "Teachers can manage grades for their subjects"
  ON student_grades
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM faculty_subjects fs
      WHERE fs.id = student_grades.faculty_subject_id
      AND fs.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM faculty_subjects fs
      WHERE fs.id = student_grades.faculty_subject_id
      AND fs.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can view their own grades"
  ON student_grades
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

-- Policies for report_cards
CREATE POLICY "Admins and teachers can manage report cards"
  ON report_cards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can view their own report cards"
  ON report_cards
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

-- Functions for grade calculations
CREATE OR REPLACE FUNCTION calculate_final_grade(
  p_cc_grade numeric,
  p_exam_grade numeric,
  p_cc_weight numeric,
  p_exam_weight numeric
)
RETURNS numeric AS $$
BEGIN
  IF p_cc_grade IS NULL OR p_exam_grade IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN ROUND((p_cc_grade * p_cc_weight + p_exam_grade * p_exam_weight)::numeric, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to determine letter grade
CREATE OR REPLACE FUNCTION get_letter_grade(p_final_grade numeric)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT letter_grade
    FROM grade_thresholds
    WHERE p_final_grade BETWEEN min_score AND max_score
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate GPA
CREATE OR REPLACE FUNCTION calculate_gpa(p_student_id uuid, p_academic_year_id uuid, p_semester integer)
RETURNS numeric AS $$
DECLARE
  v_total_points numeric := 0;
  v_total_credits numeric := 0;
  v_gpa numeric;
BEGIN
  SELECT 
    SUM(sg.grade_point * fs.credits),
    SUM(fs.credits)
  INTO v_total_points, v_total_credits
  FROM student_grades sg
  JOIN faculty_subjects fs ON sg.faculty_subject_id = fs.id
  WHERE sg.student_id = p_student_id
  AND sg.academic_year_id = p_academic_year_id
  AND sg.semester = p_semester;

  IF v_total_credits > 0 THEN
    v_gpa := ROUND((v_total_points / v_total_credits)::numeric, 2);
  END IF;

  RETURN v_gpa;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update grades automatically
CREATE OR REPLACE FUNCTION update_student_grade()
RETURNS TRIGGER AS $$
DECLARE
  v_calculation grade_calculations%ROWTYPE;
  v_final_grade numeric;
  v_letter_grade text;
  v_grade_point numeric;
  v_is_passing boolean;
BEGIN
  -- Get grade calculation rules
  SELECT * INTO v_calculation
  FROM grade_calculations
  WHERE faculty_subject_id = NEW.faculty_subject_id
  AND academic_year_id = NEW.academic_year_id;

  -- Calculate final grade
  IF NEW.cc_grade IS NOT NULL AND NEW.exam_grade IS NOT NULL THEN
    v_final_grade := calculate_final_grade(
      NEW.cc_grade,
      NEW.exam_grade,
      v_calculation.cc_weight,
      v_calculation.exam_weight
    );
    
    -- Get letter grade
    v_letter_grade := get_letter_grade(v_final_grade);
    
    -- Get grade point and passing status
    SELECT grade_point, is_passing 
    INTO v_grade_point, v_is_passing
    FROM grade_thresholds
    WHERE letter_grade = v_letter_grade;

    -- Update the grade record
    NEW.final_grade := v_final_grade;
    NEW.letter_grade := v_letter_grade;
    NEW.grade_point := v_grade_point;
    NEW.is_passing := v_is_passing;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_grade_trigger
  BEFORE INSERT OR UPDATE ON student_grades
  FOR EACH ROW
  EXECUTE FUNCTION update_student_grade();

-- Insert default grade thresholds
INSERT INTO grade_thresholds (min_score, max_score, letter_grade, grade_point, description, is_passing)
VALUES
  (90, 100, 'A+', 4.0, 'Excellent', true),
  (85, 89.99, 'A', 4.0, 'Excellent', true),
  (80, 84.99, 'A-', 3.7, 'Very Good', true),
  (75, 79.99, 'B+', 3.3, 'Good', true),
  (70, 74.99, 'B', 3.0, 'Good', true),
  (65, 69.99, 'C+', 2.3, 'Average', false),
  (60, 64.99, 'C', 2.0, 'Average', false),
  (55, 59.99, 'D+', 1.3, 'Below Average', false),
  (50, 54.99, 'D', 1.0, 'Poor', false),
  (0, 49.99, 'F', 0.0, 'Fail', false)
ON CONFLICT DO NOTHING;

-- Insert default report card template
INSERT INTO report_card_templates (
  name,
  header_content,
  footer_content,
  layout_config,
  is_default
)
VALUES (
  'Default Template',
  '{"title": "Bulletin de Notes", "logo": true, "school_info": true}',
  '{"signatures": true, "notes": true, "date": true}',
  '{"orientation": "portrait", "page_size": "A4", "margins": {"top": 25, "bottom": 25, "left": 25, "right": 25}}',
  true
)
ON CONFLICT DO NOTHING;