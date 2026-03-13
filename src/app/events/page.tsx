import EventList from '@/components/EventList';
import Newsletter from '@/components/Newsletter';

export default function EventsPage() {
  return (
    <div className="animate-fade-in-up">
      <EventList />
      <Newsletter />
    </div>
  );
}
