import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://llegoyamed.site'),

  title: {
    default: 'LlegoYa | Rutas de buses en Medellín',
    template: '%s | LlegoYa',
  },

  description:
    'Encuentra las mejores rutas de buses urbanos en Medellín. Consulta recorridos, paradas y la forma más rápida de llegar a tu destino.',

  keywords: [
    'buses Medellín',
    'rutas Medellín',
    'transporte público',
    'buses urbanos',
    'cómo llegar Medellín',
    'Metro Medellín',
    'LlegoYa',
  ],

  authors: [{ name: 'LlegoYa' }],

  creator: 'LlegoYa',

  publisher: 'LlegoYa',

  applicationName: 'LlegoYa',

  category: 'Transportation',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'LlegoYa | Rutas de buses en Medellín',
    description: 'Encuentra la mejor ruta de bus para llegar a cualquier lugar de Medellín.',
    url: 'https://llegoyamed.site',
    siteName: 'LlegoYa',
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LlegoYa',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'LlegoYa',
    description: 'Encuentra rutas de buses urbanos en Medellín fácilmente.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
