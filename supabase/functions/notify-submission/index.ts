// Supabase Edge Function: notify-submission
// Deploy using: supabase functions deploy notify-submission
// Set your API Key: supabase secrets set RESEND_API_KEY=re_your_key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Get the submission data from the trigger
        const { record } = await req.json()
        const responseId = record.id
        const formId = record.form_id

        // 2. Fetch Form Info (to see if notifications are enabled and where to send)
        const { data: form, error: formError } = await supabase
            .from('forms')
            .select('title, notify_email, email_notifications_enabled')
            .eq('id', formId)
            .single()

        if (formError || !form?.email_notifications_enabled || !form?.notify_email) {
            return new Response(JSON.stringify({ message: "Notifications disabled or no email set." }), { status: 200 })
        }

        // 3. Fetch Answer Details for the email body
        const { data: answers, error: answersError } = await supabase
            .from('answers')
            .select('question_id, answer_text, answer_value, questions(label)')
            .eq('response_id', responseId)

        if (answersError) throw answersError

        // 4. Construct Email Body
        const summary = answers.map(a => {
            const label = a.questions?.label || "Unknown Question"
            const value = a.answer_text || JSON.stringify(a.answer_value)
            return `<b>${label}</b>: ${value}`
        }).join('<br>')

        // 5. Send via Resend
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Kuestionnaire.ai <onboarding@resend.dev>',
                to: [form.notify_email],
                subject: `New Submission: ${form.title}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #06b6d4;">New Submission Received!</h2>
            <p>Your Kuestionnaire <b>"${form.title}"</b> has a new response.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <div style="background: #f9fafb; padding: 20px; rounded: 8px;">
              ${summary}
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 40px;">
              View full analytics at <a href="https://kuestionnaire.ai">Kuestionnaire.ai</a>
            </p>
          </div>
        `,
            }),
        })

        const resData = await res.json()
        return new Response(JSON.stringify(resData), { status: 200 })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
