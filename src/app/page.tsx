import Hero from '@/components/Hero';
import MissionStats from '@/components/MissionStats';
import Newsletter from '@/components/Newsletter';

export default function HomePage() {
  return (
    <div className="animate-fade-in-up">
      <Hero />
      <MissionStats />
      <Newsletter />
    </div>
  );
}
