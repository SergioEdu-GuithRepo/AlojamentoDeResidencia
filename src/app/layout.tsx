import type { Metadata } from 'next';
import './globals.css';
import ParallaxController from '@/components/ParallaxController';
import { SiteMediaProvider } from '@/components/SiteMediaProvider';
import { ConfirmProvider } from '@/components/ConfirmDialog';
import { MediaService, GALERIA_PADRAO } from '@/lib/media';

// As fotografias são geridas no painel admin: renderizar sempre com dados atuais
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mr. C Residências | Residências Privadas & Reservas',
  description:
    'Residências privadas de luxo em Angola. Reservas online diretas, pagamento em Kwanzas e entrada autónoma com chave digital (PIN).',
};

// Navbar e Footer são renderizados por cada página (evita duplicação)
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const comLimite = <T,>(promessa: Promise<T>, padrao: T) =>
    Promise.race([promessa, new Promise<T>((resolve) => setTimeout(() => resolve(padrao), 2500))]).catch(
      () => padrao
    );

  const [media, galeria] = await Promise.all([
    comLimite(MediaService.getSiteMedia(), {}),
    comLimite(MediaService.getGaleria(), GALERIA_PADRAO),
  ]);

  return (
    <html lang="pt">
      <body className="bg-white text-mrc-charcoal min-h-screen flex flex-col font-sans font-light antialiased selection:bg-mrc-terracotta selection:text-white">
        <SiteMediaProvider initialMedia={media} initialGaleria={galeria}>
          <ConfirmProvider>
            <div className="flex-1 flex flex-col">{children}</div>
          </ConfirmProvider>
        </SiteMediaProvider>
        <ParallaxController />
      </body>
    </html>
  );
}
