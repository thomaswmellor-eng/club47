import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  secure: Number(process.env.SMTP_PORT) === 465, // true pour le port 465 (SSL), false pour 587 (TLS)
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});


export async function sendPasswordResetEmail({
  to,
  name,
  resetLink,
}: {
  to: string;
  name: string;
  resetLink: string;
}) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: 'Club 47 — Réinitialisation de votre mot de passe',
    html: [
      '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:40px;">',
      '<h1 style="color:#c9a84c;font-size:28px;margin-bottom:8px;letter-spacing:4px;">CLUB 47</h1>',
      '<div style="height:2px;background:#c9a84c;width:60px;margin-bottom:32px;"></div>',
      '<p style="font-size:18px;color:#fff;margin-bottom:16px;">Bonjour ' + name + ',</p>',
      '<p style="color:#aaa;line-height:1.8;margin-bottom:32px;">Vous avez demandé la réinitialisation de votre mot de passe.<br>Cliquez sur le bouton ci-dessous pour en définir un nouveau.</p>',
      '<a href="' + resetLink + '" style="display:inline-block;background:#c9a84c;color:#000;font-weight:bold;padding:16px 40px;text-decoration:none;font-size:13px;letter-spacing:3px;">RÉINITIALISER MON MOT DE PASSE</a>',
      '<p style="color:#555;font-size:12px;margin-top:40px;border-top:1px solid #2a2a2a;padding-top:20px;line-height:1.6;">Ce lien est valable 1 heure.<br>Si vous n\'avez pas fait cette demande, ignorez simplement cet e-mail.</p>',
      '</div>',
    ].join(''),
  });
}

export async function sendEventRegistrationEmail({
  to,
  name,
  eventTitle,
  eventDate,
  eventLocation,
  icsContent,
}: {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  icsContent: string;
}) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: `Club 47 — Inscription confirmée : ${eventTitle}`,
    html: [
      '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:40px;">',
      '<h1 style="color:#c9a84c;font-size:28px;margin-bottom:8px;letter-spacing:4px;">CLUB 47</h1>',
      '<div style="height:2px;background:#c9a84c;width:60px;margin-bottom:32px;"></div>',
      '<p style="font-size:18px;color:#fff;margin-bottom:16px;">Bonjour ' + name + ',</p>',
      '<p style="color:#aaa;line-height:1.8;margin-bottom:8px;">Votre inscription est confirmée pour :</p>',
      '<div style="background:#2a2a2a;border-left:3px solid #c9a84c;padding:16px 20px;margin-bottom:32px;">',
      '<p style="color:#c9a84c;font-weight:bold;font-size:16px;margin:0 0 8px;">' + eventTitle + '</p>',
      '<p style="color:#aaa;margin:0 0 4px;font-size:14px;">📅 ' + eventDate + '</p>',
      '<p style="color:#aaa;margin:0;font-size:14px;">📍 ' + eventLocation + '</p>',
      '</div>',
      '<p style="color:#aaa;line-height:1.8;margin-bottom:24px;">Le fichier .ics ci-joint vous permet d\'ajouter cet événement directement à votre calendrier (Google Calendar, Outlook, Apple Calendar...).</p>',
      '<p style="color:#555;font-size:12px;margin-top:40px;border-top:1px solid #2a2a2a;padding-top:20px;">Club 47 — Le cercle d\'excellence Marketing & Digital</p>',
      '</div>',
    ].join(''),
    attachments: [
      {
        filename: 'event-club47.ics',
        content: icsContent,
        contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
      },
    ],
  });
}

export async function sendNewsletterConfirmationEmail({ to }: { to: string }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: 'Club 47 — Votre inscription à la newsletter est confirmée',
    html: [
      '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:40px;">',
      '<h1 style="color:#c9a84c;font-size:28px;margin-bottom:8px;letter-spacing:4px;">CLUB 47</h1>',
      '<div style="height:2px;background:#c9a84c;width:60px;margin-bottom:32px;"></div>',
      '<p style="font-size:18px;color:#fff;margin-bottom:16px;">Bienvenue,</p>',
      '<p style="color:#aaa;line-height:1.8;margin-bottom:32px;">Vous êtes désormais abonné à la newsletter du <strong style="color:#c9a84c;">Club 47</strong>.<br>Vous recevrez en avant-première nos insights exclusifs, les actualités de nos conférences et les temps forts de la communauté.</p>',
      '<div style="background:#2a2a2a;border-left:3px solid #c9a84c;padding:16px 20px;margin-bottom:32px;">',
      '<p style="color:#c9a84c;font-weight:bold;margin:0 0 4px;font-size:13px;letter-spacing:2px;">LE CERCLE D\'EXCELLENCE</p>',
      '<p style="color:#aaa;margin:0;font-size:13px;">Marketing & Digital — Les profils les plus influents.</p>',
      '</div>',
      '<p style="color:#555;font-size:12px;margin-top:40px;border-top:1px solid #2a2a2a;padding-top:20px;line-height:1.6;">Si vous n\'avez pas effectué cette inscription, ignorez simplement cet e-mail.</p>',
      '</div>',
    ].join(''),
  });
}

export async function sendNewsletterCampaign({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const htmlBody = body
    .split('\n\n')
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="color:#aaa;line-height:1.8;margin-bottom:20px;">${p.replace(/\n/g, '<br>')}</p>`
    )
    .join('');

  return transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:40px;">
        <h1 style="color:#c9a84c;font-size:28px;margin-bottom:8px;letter-spacing:4px;">CLUB 47</h1>
        <div style="height:2px;background:#c9a84c;width:60px;margin-bottom:32px;"></div>
        ${htmlBody}
        <p style="color:#555;font-size:12px;margin-top:40px;border-top:1px solid #2a2a2a;padding-top:20px;line-height:1.6;">
          Club 47 — Le cercle d'excellence Marketing &amp; Digital<br>
          <span style="color:#3a3a3a;">Pour vous désabonner, répondez à cet e-mail.</span>
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
  inviteLink,
}: {
  to: string;
  name: string;
  inviteLink: string;
}) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: 'Bienvenue au Club 47 — Créez votre mot de passe',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:40px;">
        <h1 style="color:#c9a84c;font-size:28px;margin-bottom:8px;letter-spacing:4px;">CLUB 47</h1>
        <div style="height:2px;background:#c9a84c;width:60px;margin-bottom:32px;"></div>

        <p style="font-size:18px;color:#fff;margin-bottom:16px;">Bonjour ${name},</p>

        <p style="color:#aaa;line-height:1.8;margin-bottom:24px;">
          Vous avez été proposé(e) et accepté(e) comme membre du
          <strong style="color:#c9a84c;">Club 47</strong>,
          une communauté d'excellence réunissant les profils les plus influents.
        </p>

        <p style="color:#aaa;line-height:1.8;margin-bottom:32px;">
          Cliquez sur le bouton ci-dessous pour créer votre mot de passe
          et rejoindre officiellement la communauté.
        </p>

        <a href="${inviteLink}"
           style="display:inline-block;background:#c9a84c;color:#000;font-weight:bold;
                  padding:16px 40px;text-decoration:none;font-size:13px;letter-spacing:3px;">
          CRÉER MON MOT DE PASSE
        </a>

        <p style="color:#555;font-size:12px;margin-top:40px;border-top:1px solid #2a2a2a;padding-top:20px;line-height:1.6;">
          Ce lien est valable 24 heures.<br>
          Si vous n'avez pas demandé cet accès, ignorez simplement cet e-mail.
        </p>
      </div>
    `,
  });
}
