import { Link } from 'react-router-dom';
import { Shield, Wifi, Lock, Camera, ArrowRight, CheckCircle, Users, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1F3A] to-[#152d4f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Protege lo que más importa
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Seguridad física y digital para hogares, personas mayores y pequeños negocios.
              Productos seleccionados e instalación profesional a domicilio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/catalogo">
                <Button size="lg">
                  Ver catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/catalogo">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#0B1F3A]">
                  Ver packs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] text-center mb-10">
            ¿Qué necesitas proteger?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard
              icon={<Camera className="h-8 w-8" />}
              title="Videovigilancia"
              description="Cámaras WiFi con visión nocturna y alertas al móvil"
              link="/catalogo"
            />
            <CategoryCard
              icon={<Shield className="h-8 w-8" />}
              title="Alarmas"
              description="Sistemas de alarma sin cuotas mensuales"
              link="/catalogo"
            />
            <CategoryCard
              icon={<Lock className="h-8 w-8" />}
              title="Cerraduras"
              description="Cerraduras inteligentes con huella y app"
              link="/catalogo"
            />
            <CategoryCard
              icon={<Wifi className="h-8 w-8" />}
              title="Ciberseguridad"
              description="VPN, antivirus y routers seguros"
              link="/catalogo"
            />
          </div>
        </div>
      </section>

      {/* Ventajas */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] text-center mb-10">
            ¿Por qué SegurHogar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AdvantageCard
              icon={<Wrench className="h-10 w-10 text-[#2D7FF9]" />}
              title="Instalación profesional"
              description="Nuestro técnico va a tu domicilio, instala y configura todo. Tú solo disfrutas de la tranquilidad."
            />
            <AdvantageCard
              icon={<Users className="h-10 w-10 text-[#2D7FF9]" />}
              title="Pensado para todos"
              description="Productos fáciles de usar, pensados especialmente para personas mayores y familias."
            />
            <AdvantageCard
              icon={<CheckCircle className="h-10 w-10 text-[#2D7FF9]" />}
              title="Asesoramiento IA"
              description="Nuestro asistente inteligente te ayuda a elegir los productos que mejor se adaptan a ti."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ icon, title, description, link }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link to={link}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-6 text-center">
          <div className="text-[#2D7FF9] mb-3 flex justify-center">{icon}</div>
          <h3 className="font-semibold text-[#0B1F3A] mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function AdvantageCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-semibold text-[#0B1F3A] text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
