import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0B1F3A] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-[#2D7FF9]" />
              <span className="font-bold text-lg">SegurHogar</span>
            </div>
            <p className="text-gray-400 text-sm">
              Protección integral para tu hogar y negocio. Seguridad física y digital con instalación profesional.
            </p>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-semibold mb-3">Productos</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/tienda?cat=camaras" className="hover:text-white transition-colors">Cámaras de seguridad</Link></li>
              <li><Link to="/tienda?cat=alarmas" className="hover:text-white transition-colors">Alarmas</Link></li>
              <li><Link to="/tienda?cat=cerraduras" className="hover:text-white transition-colors">Cerraduras inteligentes</Link></li>
              <li><Link to="/tienda?cat=routers" className="hover:text-white transition-colors">Routers seguros</Link></li>
              <li><Link to="/packs" className="hover:text-white transition-colors">Packs completos</Link></li>
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="font-semibold mb-3">Servicios</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/instalacion" className="hover:text-white transition-colors">Instalación a domicilio</Link></li>
              <li><Link to="/asistente-ia" className="hover:text-white transition-colors">Asesoramiento IA</Link></li>
              <li><Link to="/tienda?cat=vpn" className="hover:text-white transition-colors">VPN y privacidad</Link></li>
              <li><Link to="/tienda?cat=antivirus" className="hover:text-white transition-colors">Antivirus</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-3">Contacto</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#2D7FF9]" />
                <span>900 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2D7FF9]" />
                <span>info@segurhogar.es</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#2D7FF9]" />
                <span>Madrid, España</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SegurHogar. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
