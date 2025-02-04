/*
  # Security Schema Setup

  1. New Tables
    - audit_logs: Track all important system actions
    - login_attempts: Track failed login attempts
    - security_settings: Store global security configuration
    - user_sessions: Track active user sessions

  2. Security
    - RLS policies for all tables
    - Audit logging functions
    - Security validation functions
*/

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Login attempts tracking
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  success boolean NOT NULL,
  attempt_time timestamptz DEFAULT now()
);

-- Security settings
CREATE TABLE IF NOT EXISTS security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  token text NOT NULL,
  ip_address text,
  user_agent text,
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Administrators can view audit logs" ON audit_logs;
  DROP POLICY IF EXISTS "Administrators can view login attempts" ON login_attempts;
  DROP POLICY IF EXISTS "Administrators can manage security settings" ON security_settings;
  DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
  DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
END $$;

-- RLS Policies

-- Audit logs policies
CREATE POLICY "Administrators can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Login attempts policies
CREATE POLICY "Administrators can view login attempts"
  ON login_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Security settings policies
CREATE POLICY "Administrators can manage security settings"
  ON security_settings
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

-- User sessions policies
CREATE POLICY "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can manage their own sessions"
  ON user_sessions
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

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_data,
    p_new_data,
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check login attempts
CREATE OR REPLACE FUNCTION check_login_attempts(
  p_email text,
  p_ip_address text
)
RETURNS boolean AS $$
DECLARE
  v_recent_attempts integer;
  v_max_attempts integer := 5;
  v_lockout_minutes integer := 15;
BEGIN
  -- Count recent failed attempts
  SELECT COUNT(*)
  INTO v_recent_attempts
  FROM login_attempts
  WHERE email = p_email
    AND ip_address = p_ip_address
    AND success = false
    AND attempt_time > now() - interval '15 minutes';

  -- Return false if too many attempts
  RETURN v_recent_attempts < v_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate password strength
CREATE OR REPLACE FUNCTION validate_password(password text)
RETURNS boolean AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;

  -- Check for uppercase
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;

  -- Check for lowercase
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;

  -- Check for numbers
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;

  -- Check for special characters
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false
  WHERE expires_at < now()
    OR last_activity < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Insert default security settings
INSERT INTO security_settings (setting_key, setting_value, description)
VALUES
  ('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_number": true, "require_special": true}', 'Password requirements'),
  ('session_timeout', '{"timeout_minutes": 30, "max_sessions": 5}', 'Session timeout settings'),
  ('login_security', '{"max_attempts": 5, "lockout_minutes": 15}', 'Login attempt limits'),
  ('api_security', '{"rate_limit_per_minute": 60, "key_rotation_days": 90}', 'API security settings')
ON CONFLICT (setting_key) DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE audit_logs IS 'Tracks all important actions in the system';
COMMENT ON TABLE login_attempts IS 'Tracks failed login attempts for rate limiting';
COMMENT ON TABLE security_settings IS 'Stores global security configuration';
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions';