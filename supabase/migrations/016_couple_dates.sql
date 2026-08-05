-- Add meet_date and relationship_start_date to couples table
ALTER TABLE couples
ADD COLUMN meet_date DATE,
ADD COLUMN relationship_start_date DATE;
