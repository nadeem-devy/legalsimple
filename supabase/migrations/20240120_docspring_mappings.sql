-- DocSpring Template Mappings Table
-- Stores the mapping between document types and DocSpring templates/fields

CREATE TABLE IF NOT EXISTS docspring_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL CHECK (state IN ('AZ', 'NV', 'TX')),
  practice_area TEXT NOT NULL CHECK (practice_area IN ('family_law', 'personal_injury', 'estate_planning')),
  document_type TEXT NOT NULL,
  template_id TEXT NOT NULL,
  template_name TEXT,
  field_mappings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for state + practice_area + document_type
  UNIQUE(state, practice_area, document_type)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_docspring_mappings_lookup
  ON docspring_mappings(state, practice_area, document_type);

-- Enable RLS
ALTER TABLE docspring_mappings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write mappings
CREATE POLICY "Admins can manage docspring_mappings" ON docspring_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE docspring_mappings IS 'Stores mappings between document types and DocSpring PDF templates';
