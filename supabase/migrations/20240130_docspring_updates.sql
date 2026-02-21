-- DocSpring Integration Updates
-- Additional tables and updates for DocSpring PDF generation

-- Add trigger for auto-updating updated_at on docspring_mappings
CREATE TRIGGER update_docspring_mappings_updated_at
  BEFORE UPDATE ON docspring_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Document Generation History Table
-- Tracks all PDF generation attempts for auditing and debugging
CREATE TABLE IF NOT EXISTS document_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  mapping_id UUID REFERENCES docspring_mappings(id) ON DELETE SET NULL,
  template_id TEXT NOT NULL,
  submission_id TEXT, -- DocSpring submission ID
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_data JSONB, -- The data sent to DocSpring
  output_data JSONB, -- Response from DocSpring
  error_message TEXT,
  download_url TEXT,
  permanent_download_url TEXT,
  generated_by UUID REFERENCES profiles(id),
  is_test BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for document_generations
CREATE INDEX idx_document_generations_case ON document_generations(case_id);
CREATE INDEX idx_document_generations_document ON document_generations(document_id);
CREATE INDEX idx_document_generations_status ON document_generations(status);
CREATE INDEX idx_document_generations_template ON document_generations(template_id);
CREATE INDEX idx_document_generations_submission ON document_generations(submission_id);

-- Enable RLS
ALTER TABLE document_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_generations
CREATE POLICY "Case participants can view their generation history"
  ON document_generations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = document_generations.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all generation history"
  ON document_generations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert generation records"
  ON document_generations FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can manage generation records"
  ON document_generations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE document_generations IS 'Tracks all DocSpring PDF generation attempts for auditing';

-- Intake Data Storage Table
-- Stores structured intake questionnaire data for each case
CREATE TABLE IF NOT EXISTS intake_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  practice_area TEXT NOT NULL CHECK (practice_area IN ('family_law', 'personal_injury', 'estate_planning')),
  data_type TEXT NOT NULL, -- e.g., 'divorce', 'custody', 'injury_claim'

  -- Personal Info (Petitioner/Plaintiff)
  petitioner_full_name TEXT,
  petitioner_dob DATE,
  petitioner_address TEXT,
  petitioner_city TEXT,
  petitioner_state TEXT,
  petitioner_zip TEXT,
  petitioner_county TEXT,
  petitioner_phone TEXT,
  petitioner_email TEXT,
  petitioner_employer TEXT,
  petitioner_occupation TEXT,

  -- Respondent/Defendant Info
  respondent_full_name TEXT,
  respondent_dob DATE,
  respondent_address TEXT,
  respondent_city TEXT,
  respondent_state TEXT,
  respondent_zip TEXT,
  respondent_county TEXT,
  respondent_phone TEXT,
  respondent_email TEXT,
  respondent_employer TEXT,
  respondent_occupation TEXT,

  -- Marriage Info (Family Law)
  date_of_marriage DATE,
  place_of_marriage TEXT,
  date_of_separation DATE,

  -- Children Info
  has_children BOOLEAN DEFAULT FALSE,
  children_data JSONB, -- Array of child objects

  -- Property Info
  has_real_estate BOOLEAN DEFAULT FALSE,
  real_estate_data JSONB, -- Array of property objects

  has_vehicles BOOLEAN DEFAULT FALSE,
  vehicles_data JSONB, -- Array of vehicle objects

  has_bank_accounts BOOLEAN DEFAULT FALSE,
  bank_accounts_data JSONB, -- Array of account objects

  has_retirement_accounts BOOLEAN DEFAULT FALSE,
  retirement_accounts_data JSONB, -- Array of retirement account objects

  has_debts BOOLEAN DEFAULT FALSE,
  debts_data JSONB, -- Array of debt objects

  -- Furniture/Personal Property
  has_furniture BOOLEAN DEFAULT FALSE,
  furniture_data JSONB,

  -- Separate Property
  has_separate_property BOOLEAN DEFAULT FALSE,
  separate_property_data JSONB,

  -- Spousal Maintenance
  spousal_maintenance_data JSONB,

  -- Tax Filing Preferences
  tax_filing_data JSONB,

  -- Full JSON blob for any additional fields
  additional_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One intake record per case
  UNIQUE(case_id)
);

-- Indexes for intake_data
CREATE INDEX idx_intake_data_case ON intake_data(case_id);
CREATE INDEX idx_intake_data_practice_area ON intake_data(practice_area);

-- Enable RLS
ALTER TABLE intake_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intake_data
CREATE POLICY "Case owner can manage intake data"
  ON intake_data FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = intake_data.case_id
      AND cases.client_id = auth.uid()
    )
  );

CREATE POLICY "Assigned lawyer can view intake data"
  ON intake_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = intake_data.case_id
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all intake data"
  ON intake_data FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Auto-update updated_at for intake_data
CREATE TRIGGER update_intake_data_updated_at
  BEFORE UPDATE ON intake_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comments
COMMENT ON TABLE intake_data IS 'Structured storage for intake questionnaire data per case';

-- Add service role policy for server-side operations
-- This allows the service role to bypass RLS
CREATE POLICY "Service role has full access to docspring_mappings"
  ON docspring_mappings FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to document_generations"
  ON document_generations FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to intake_data"
  ON intake_data FOR ALL
  USING (auth.role() = 'service_role');
