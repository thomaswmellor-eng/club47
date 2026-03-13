import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InviteRedirector from '@/components/InviteRedirector';

export const metadata: Metadata = {
  title: 'Club 47 | L\'Excellence Marketing & Digital',
  description: 'Le cercle exclusif de 150 Directeurs Marketing et Digital unis par l\'innovation, l\'IA et le leadership stratégique.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-black text-white selection:bg-gold-500 selection:text-black font-sans">
        <InviteRedirector />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
