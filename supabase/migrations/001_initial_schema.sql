-- LegalSimple.ai Database Schema
-- Initial migration for Arizona, Nevada, Texas
-- Practice Areas: Family Law, Personal Injury, Estate Planning

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'lawyer', 'admin')),
  state TEXT CHECK (state IN ('AZ', 'NV', 'TX')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LAWYER PROFILES
CREATE TABLE lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bar_number TEXT NOT NULL,
  bar_state TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  practice_areas TEXT[] NOT NULL,
  states_licensed TEXT[] NOT NULL,
  hourly_rate DECIMAL(10,2),
  bio TEXT,
  years_experience INTEGER,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  rating DECIMAL(3,2) DEFAULT 0,
  total_cases INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. CASES
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES profiles(id),
  lawyer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'intake' CHECK (status IN (
    'intake', 'pending_review', 'lawyer_requested',
    'lawyer_assigned', 'in_progress', 'document_ready',
    'filed', 'closed', 'escalated'
  )),
  case_type TEXT NOT NULL CHECK (case_type IN (
    'family_law', 'personal_injury', 'estate_planning'
  )),
  sub_type TEXT,
  state TEXT NOT NULL CHECK (state IN ('AZ', 'NV', 'TX')),
  county TEXT,
  city TEXT,

  -- Parties
  plaintiff_name TEXT,
  plaintiff_address TEXT,
  defendant_name TEXT,
  defendant_address TEXT,
  defendant_type TEXT CHECK (defendant_type IN ('individual', 'business')),

  -- Case Details
  incident_date DATE,
  incident_description TEXT,
  damages_amount DECIMAL(12,2),
  damages_description TEXT,
  desired_outcome TEXT,

  -- AI Assessment
  complexity_score INTEGER CHECK (complexity_score BETWEEN 1 AND 10),
  lawyer_recommended BOOLEAN DEFAULT FALSE,
  ai_summary TEXT,

  -- Metadata
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHAT MESSAGES
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'lawyer')),
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'filed')),
  version INTEGER DEFAULT 1,
  generated_by TEXT CHECK (generated_by IN ('ai', 'lawyer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVIDENCE/FILES
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LAWYER CASE REQUESTS
CREATE TABLE lawyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  client_message TEXT,
  lawyer_response TEXT,
  quoted_fee DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- 8. PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  client_id UUID REFERENCES profiles(id),
  lawyer_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  payment_type TEXT CHECK (payment_type IN ('document_fee', 'lawyer_fee', 'filing_fee')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INTAKE SESSIONS
CREATE TABLE intake_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL,
  collected_data JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id)
);

-- INDEXES
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_state ON profiles(state);
CREATE INDEX idx_lawyer_profiles_verified ON lawyer_profiles(verified);
CREATE INDEX idx_lawyer_profiles_states ON lawyer_profiles USING GIN(states_licensed);
CREATE INDEX idx_lawyer_profiles_areas ON lawyer_profiles USING GIN(practice_areas);
CREATE INDEX idx_cases_client ON cases(client_id);
CREATE INDEX idx_cases_lawyer ON cases(lawyer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_state ON cases(state);
CREATE INDEX idx_cases_type ON cases(case_type);
CREATE INDEX idx_chat_messages_case ON chat_messages(case_id);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_lawyer_requests_case ON lawyer_requests(case_id);
CREATE INDEX idx_lawyer_requests_lawyer ON lawyer_requests(lawyer_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_case ON payments(case_id);

-- FUNCTIONS

-- Auto-generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.case_number := 'LS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number
  BEFORE INSERT ON cases
  FOR EACH ROW
  WHEN (NEW.case_number IS NULL OR NEW.case_number = '')
  EXECUTE FUNCTION generate_case_number();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_intake_sessions_updated_at
  BEFORE UPDATE ON intake_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Lawyers can view client profiles for their cases"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.lawyer_id = auth.uid()
      AND cases.client_id = profiles.id
    )
  );

-- Lawyer profiles policies
CREATE POLICY "Anyone can view verified lawyer profiles"
  ON lawyer_profiles FOR SELECT
  USING (verified = true);

CREATE POLICY "Lawyers can manage their own profile"
  ON lawyer_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all lawyer profiles"
  ON lawyer_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cases policies
CREATE POLICY "Clients can view their own cases"
  ON cases FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can create cases"
  ON cases FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their own cases"
  ON cases FOR UPDATE
  USING (client_id = auth.uid());

CREATE POLICY "Lawyers can view assigned cases"
  ON cases FOR SELECT
  USING (lawyer_id = auth.uid());

CREATE POLICY "Lawyers can view marketplace cases"
  ON cases FOR SELECT
  USING (
    status IN ('lawyer_requested', 'pending_review')
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer'
    )
  );

CREATE POLICY "Lawyers can update assigned cases"
  ON cases FOR UPDATE
  USING (lawyer_id = auth.uid());

CREATE POLICY "Admins can manage all cases"
  ON cases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chat messages policies
CREATE POLICY "Case participants can view messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = chat_messages.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Case participants can insert messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = chat_messages.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

-- Documents policies
CREATE POLICY "Case participants can view documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = documents.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Case participants can manage documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = documents.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

-- Evidence policies
CREATE POLICY "Case participants can view evidence"
  ON evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = evidence.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Case participants can upload evidence"
  ON evidence FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = evidence.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

-- Lawyer requests policies
CREATE POLICY "Clients can view their case requests"
  ON lawyer_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = lawyer_requests.case_id
      AND cases.client_id = auth.uid()
    )
  );

CREATE POLICY "Lawyers can view requests for them"
  ON lawyer_requests FOR SELECT
  USING (lawyer_id = auth.uid());

CREATE POLICY "Lawyers can respond to requests"
  ON lawyer_requests FOR UPDATE
  USING (lawyer_id = auth.uid());

-- Payments policies
CREATE POLICY "Clients can view their payments"
  ON payments FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Lawyers can view payments for their cases"
  ON payments FOR SELECT
  USING (lawyer_id = auth.uid());

-- Intake sessions policies
CREATE POLICY "Case owner can manage intake session"
  ON intake_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = intake_sessions.case_id
      AND cases.client_id = auth.uid()
    )
  );

-- FUNCTION: Handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
