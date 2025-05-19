// pages/api/send-email.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail'; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Videatly <info@videatly.ai>', 
      to: [to],
      subject: 'Welcome to Videatly!',
      react: WelcomeEmail() as React.ReactElement,

    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email sent successfully!', data }, { status: 200 });
  } catch (e: any) {
    console.error("Catch error API Route:", e);
    // Check if the error is due to malformed JSON in the request
    if (e instanceof SyntaxError && e.message.includes('JSON')) {
        return NextResponse.json({ error: 'Malformed JSON in request' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}