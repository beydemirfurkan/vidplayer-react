import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'vidplayer-react Next.js Example',
  description: 'Example of using vidplayer-react with Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
