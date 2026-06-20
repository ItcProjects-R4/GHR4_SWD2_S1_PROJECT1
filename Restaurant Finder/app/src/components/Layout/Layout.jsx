import { Outlet, useLocation } from 'react-router';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isHeroPage = location.pathname.startsWith('/restaurant');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${!isHome && !isHeroPage ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
