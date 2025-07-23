-- Add tutorial_completed column to profiles table
-- This column tracks whether a user has completed the onboarding tutorial

ALTER TABLE profiles 
ADD COLUMN tutorial_completed BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.tutorial_completed IS 'Tracks whether the user has completed the onboarding tutorial';

-- Update existing users to have tutorial_completed as false (default behavior)
-- This ensures existing users will see the tutorial on their next visit to /create
UPDATE profiles 
SET tutorial_completed = FALSE 
WHERE tutorial_completed IS NULL;
