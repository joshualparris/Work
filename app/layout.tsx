import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DCS / Census / Avance Work Planner',
  description: 'Practical work transition planning for DCS, Avance, Census, bus driving and backup options.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
