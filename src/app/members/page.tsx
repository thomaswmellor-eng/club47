import MemberList from '@/components/MemberList';
import Newsletter from '@/components/Newsletter';

export default function MembersPage() {
  return (
    <div className="animate-fade-in-up">
      <MemberList />
      <Newsletter />
    </div>
  );
}
