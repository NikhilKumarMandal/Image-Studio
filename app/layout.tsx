import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Screenshot Studio',
  description: 'Beautify your screenshots with stunning backgrounds, frames, and effects',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
