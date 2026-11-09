import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: { default: 'ProcessLink Ghana', template: '%s | ProcessLink Ghana' }, description: 'A prototype platform connecting equipment investors, operators and agricultural processors in Ghana.', applicationName: 'ProcessLink Ghana' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to main content</a><div className="prototype-banner" role="note" aria-label="Prototype payment notice">Prototype: payments are simulated.</div><div id="main-content">{children}</div></body></html>;
}
