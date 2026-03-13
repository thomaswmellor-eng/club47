import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from('events')
    .select('id, title, date, event_date, location, description, image_url, category')
    .order('event_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = (data ?? []).map((e) => ({
    id: String(e.id),
    title: e.title,
    date: e.date,
    location: e.location,
    description: e.description,
    image: e.image_url,
    isUpcoming: new Date(e.event_date) >= today,
    category: e.category,
  }));

  return NextResponse.json(events);
}
