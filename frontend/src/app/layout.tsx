import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import IntroSplash from '@/components/IntroSplash';
import MascotNotification from '@/components/MascotNotification';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'StyleFreds — Crea catálogos y posters',
  description: 'Crea catálogos y posters profesionales para tu negocio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Montserrat:wght@400;600;700&family=Roboto:wght@400;700&family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&family=Oswald:wght@400;600&family=Merriweather:wght@400;700&family=Pacifico&family=Bebas+Neue&family=Raleway:wght@400;700&family=Nunito:wght@400;700&family=Dancing+Script:wght@400;700&family=Inter:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Roboto+Slab:wght@400;700&family=Roboto+Condensed:wght@400;700&family=Work+Sans:wght@400;600;700&family=Rubik:wght@400;600;700&family=Quicksand:wght@400;600;700&family=Josefin+Sans:wght@400;600;700&family=Barlow:wght@400;600;700&family=Karla:wght@400;700&family=Mulish:wght@400;700&family=DM+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&family=Fira+Sans:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Cormorant+Garamond:wght@400;700&family=Crimson+Text:wght@400;700&family=EB+Garamond:wght@400;700&family=Lora:wght@400;700&family=PT+Serif:wght@400;700&family=Abril+Fatface&family=Anton&family=Archivo+Black&family=Righteous&family=Alfa+Slab+One&family=Fredoka:wght@400;600&family=Baloo+2:wght@400;600&family=Comfortaa:wght@400;700&family=Caveat:wght@400;700&family=Satisfy&family=Great+Vibes&family=Sacramento&family=Shadows+Into+Light&family=Permanent+Marker&family=Amatic+SC:wght@400;700&family=Indie+Flower&family=Kalam:wght@400;700&family=Patrick+Hand&family=Courier+Prime:wght@400;700&family=Space+Mono:wght@400;700&family=IBM+Plex+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;600;700&family=Teko:wght@400;600&family=Bungee&family=Passion+One:wght@400;700&family=Yanone+Kaffeesatz:wght@400;700&family=Titan+One&display=swap"
          rel="stylesheet"
        />
      </head>
            <body className="font-sans">
        <IntroSplash />
        <MascotNotification />
        {children}
      </body>
    </html>
  );
}