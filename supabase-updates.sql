-- SQL Updates for Kuestionnaire.ai Phase 5 & 6
-- Run this in your Supabase SQL Editor

-- 1. Add logic column to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS logic JSONB DEFAULT '[]'::jsonb;

-- 2. Add notification columns to forms table
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS notify_email TEXT,
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT false;

-- 3. Comment explaining use
COMMENT ON COLUMN public.questions.logic IS 'Array of rules: {condition: "equals", value: "x", jumpToId: "uuid"}';
COMMENT ON COLUMN public.forms.notify_email IS 'Email address to receive submission alerts';
