import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/tienda', label: 'Tienda' },
    { href: '/packs', label: 'Packs' },
    { href: '/instalacion', label: 'Instalación' },
    { href: '/asistente-ia', label: 'Asistente IA' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-[#0B1F3A] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-[#2D7FF9]" />
            <span className="font-bold text-lg">SegurHogar</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-[#2D7FF9]',
                  isActive(link.href) ? 'text-[#2D7FF9]' : 'text-gray-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/carrito" className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2D7FF9] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link to="/panel">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <User className="h-4 w-4 mr-1" />
                  Panel
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  Acceder
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-[#2D7FF9] text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
