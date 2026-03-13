import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    await verifyAdminToken(token);
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { email, name, subject, message } = await request.json();
  if (!email || !subject || !message) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to: email,
    subject: `Club 47 — ${subject}`,
    html: [
      '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:40px;">',
      '<h1 style="color:#c9a84c;font-size:28px;margin-bottom:8px;letter-spacing:4px;">CLUB 47</h1>',
      '<div style="height:2px;background:#c9a84c;width:60px;margin-bottom:32px;"></div>',
      '<p style="font-size:18px;color:#fff;margin-bottom:16px;">Bonjour ' + name + ',</p>',
      '<div style="color:#aaa;line-height:1.8;white-space:pre-wrap;">' + message.replace(/\n/g, '<br>') + '</div>',
      '<p style="color:#555;font-size:12px;margin-top:40px;border-top:1px solid #2a2a2a;padding-top:20px;">Club 47 — Le cercle d\'excellence Marketing & Digital</p>',
      '</div>',
    ].join(''),
  });

  return NextResponse.json({ success: true });
}
