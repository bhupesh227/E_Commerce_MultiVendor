import './global.css';
import { Poppins } from 'next/font/google';
import Provider from './Provider';
import {Toaster} from 'sonner';

export const metadata = {
  title: 'EComm Seller',
  description: 'ECommerce Seller Dashboard',
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable}`} suppressHydrationWarning={true}>
        <Provider>
          <Toaster/>
          {children}
        </Provider>
        
      </body>
    </html>
  )
}
