-- Supabase Database Schema for Kuestionnaire.ai
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forms table
CREATE TABLE public.forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT DEFAULT 'nebula',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  question_type TEXT NOT NULL, -- short_text, long_text, dropdown, checkbox, rating, date, etc.
  label TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  options JSONB, -- For dropdown/checkbox options: [{id, label}, ...]
  max_rating INTEGER, -- For rating questions
  include_time BOOLEAN DEFAULT false, -- For date questions
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses table
CREATE TABLE public.responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  respondent_email TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Answers table
CREATE TABLE public.answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT,
  answer_value JSONB, -- For storing complex answer types
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_questions_form_id ON public.questions(form_id);
CREATE INDEX idx_responses_form_id ON public.responses(form_id);
CREATE INDEX idx_answers_response_id ON public.answers(response_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Forms policies
CREATE POLICY "Users can view own forms"
  ON public.forms FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms"
  ON public.forms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms"
  ON public.forms FOR DELETE
  USING (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Users can view questions from accessible forms"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND (forms.user_id = auth.uid() OR forms.is_public = true)
    )
  );

CREATE POLICY "Users can insert questions to own forms"
  ON public.questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions in own forms"
  ON public.questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions from own forms"
  ON public.questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Responses policies
CREATE POLICY "Users can view responses from own forms"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = responses.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit responses to public forms"
  ON public.responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = responses.form_id
      AND (forms.user_id = auth.uid() OR forms.is_public = true)
    )
  );

-- Answers policies
CREATE POLICY "Users can view answers from own forms"
  ON public.answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.responses
      JOIN public.forms ON forms.id = responses.form_id
      WHERE responses.id = answers.response_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert answers to public forms"
  ON public.answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.responses
      JOIN public.forms ON forms.id = responses.form_id
      WHERE responses.id = answers.response_id
      AND (forms.user_id = auth.uid() OR forms.is_public = true)
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert a default profile for the first user (optional)
-- This will be auto-created when a user signs up via Google
