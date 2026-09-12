import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-bricolage',
});

const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-instrument',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-mono',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ia.linhafacil2026.com.br';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Criativa AI - Gere imagens incríveis com IA',
    template: '%s | Criativa AI',
  },
  description: 'Crie imagens profissionais com inteligência artificial. Texto em português nítido, resolução 4K, sem watermark e com estilos prontos para anúncio de produto. Grátis para começar.',
  keywords: ['criar imagens com IA', 'inteligência artificial', 'gerar imagem', 'anúncio de produto', 'ia de imagens', 'texto em português ia'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Criativa AI',
    locale: 'pt_BR',
    url: SITE_URL,
    title: 'Criativa AI - Gere imagens incríveis com IA',
    description: 'Crie imagens profissionais com IA. Texto em português, resolução 4K, estilos prontos para anúncio de produto. Grátis para começar.',
    images: [{ url: '/criativa-logo.png', width: 1672, height: 330, alt: 'Criativa AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Criativa AI - Gere imagens incríveis com IA',
    description: 'Crie imagens profissionais com IA. Texto em português, resolução 4K, estilos prontos para anúncio.',
    images: ['/criativa-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    'google-site-verification': 'Oke-oVcZAkOPXT6B45TJfDMgst5Pw4LdhV919SbcTYY',
  },
  icons: { icon: '/criativa-logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} antialiased min-h-screen font-sans`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Criativa AI',
              applicationCategory: 'DesignApplication',
              operatingSystem: 'Web',
              description: 'Plataforma para criar imagens profissionais com inteligência artificial, com texto em português e estilos prontos para anúncio de produto.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'BRL',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
