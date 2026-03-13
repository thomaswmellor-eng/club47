import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import MemberProfile from '@/components/MemberProfile';

interface Props {
  params: Promise<{ memberId: string }>;
}

export default async function MemberProfilePage({ params }: Props) {
  const { memberId } = await params;

  const supabase = createServerSupabase();
  const { data: member } = await supabase
    .from('membres')
    .select('*')
    .eq('id', memberId)
    .eq('is_active', true)
    .single();

  if (!member) notFound();

  return <MemberProfile member={member} />;
}
