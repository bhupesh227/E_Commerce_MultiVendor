import Header from '../shared/widgets/header';
import './global.css';
import { Poppins } from 'next/font/google';
import Providers from './providers';


export const metadata = {
  title: 'EComm',
  description: 'E-Commerce Application ',
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
        <Providers>
          <Header/>
          {children}
        </Providers>  
      </body>
    </html>
  )
}
