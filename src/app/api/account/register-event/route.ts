import { NextResponse } from 'next/server';
import { createAnonSupabase, createServerSupabase } from '@/lib/supabase-server';
import { generateICS } from '@/lib/ics';
import { sendEventRegistrationEmail } from '@/lib/email';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const anon = createAnonSupabase();
  const { data: { user } } = await anon.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { event_id } = await request.json();
  if (!event_id) return NextResponse.json({ error: 'event_id requis' }, { status: 400 });

  const supabase = createServerSupabase();

  // Récupérer le membre par email (l'email auth = email membre)
  const { data: membre } = await supabase
    .from('membres')
    .select('id, name, email')
    .eq('email', user.email)
    .single();

  if (!membre) return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });

  // Vérifier si déjà inscrit
  const { data: existing } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('membre_id', membre.id)
    .eq('event_id', event_id)
    .single();

  if (existing) return NextResponse.json({ error: 'Déjà inscrit' }, { status: 409 });

  // Récupérer l'événement
  const { data: event } = await supabase
    .from('events')
    .select('id, title, date, event_date, location, description')
    .eq('id', event_id)
    .single();

  if (!event) return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });

  // Inscrire
  const { error } = await supabase
    .from('event_registrations')
    .insert({ membre_id: membre.id, event_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Générer le .ics et envoyer l'email
  try {
    const icsContent = generateICS({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      event_date: event.event_date,
    });

    await sendEventRegistrationEmail({
      to: membre.email,
      name: membre.name,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      icsContent,
    });
  } catch (err) {
    console.error('[register-event] email error:', err);
  }

  return NextResponse.json({ success: true });
}
