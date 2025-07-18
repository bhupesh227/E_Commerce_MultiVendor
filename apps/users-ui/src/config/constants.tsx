export const navItems: NavItemTypes[] = [
  { title: 'Home', href: '/' },
  { title: 'Products', href: '/products' },
  { title: 'Shops', href: '/shops' },
  { title: 'Offers', href: '/offers' },
  { title: 'Become a Seller', href: `${process.env.NEXT_PUBLIC_SELLER_SERVER_URL}/signup` },
];