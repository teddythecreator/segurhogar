import { Link } from 'react-router-dom';
import { 
  Shield, Wifi, Lock, Camera, ArrowRight, CheckCircle, 
  Users, Wrench, Award, Headphones, Quote, Home,
  Heart, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Accordion } from '@/components/ui/Accordion';
import { ProductCard } from '@/components/tienda/product/ProductCard';
import { useFeaturedPacks } from '@/hooks/usePublicProducts';
import { useSEO, DEFAULT_SEO } from '@/hooks/useSEO';
import { OrganizationStructuredData } from '@/components/seo/StructuredData';

export function HomePage() {
  useSEO({
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    keywords: DEFAULT_SEO.keywords,
    canonical: 'https://[DOMINIO_WEB]/',
  });
  const { data: featuredPacks } = useFeaturedPacks(3);

  const faqItems = [
    {
      id: '1',
      question: '¿Cuánto tarda el envío?',
      answer: 'Los productos de dropshipping tardan entre 7 y 15 días laborables. Los productos de afiliado dependen de la tienda externa. Los servicios de instalación se programan en un plazo de 3 a 7 días laborables tras la compra.',
    },
    {
      id: '2',
      question: '¿La instalación está incluida en el precio?',
      answer: 'Depende del producto. Los packs incluyen instalación profesional sin coste adicional. Para productos individuales, puedes añadir el servicio de instalación durante el proceso de compra.',
    },
    {
      id: '3',
      question: '¿Qué garantía tienen los productos?',
      answer: 'Todos nuestros productos tienen una garantía mínima de 3 años. Los servicios de instalación incluyen 1 año de garantía sobre el trabajo realizado.',
    },
    {
      id: '4',
      question: '¿En qué zonas realizáis instalaciones?',
      answer: 'Actualmente operamos en la Comunidad de Madrid y zonas limítrofes. Puedes comprobar si llegamos a tu código postal en nuestra página de verificación de zonas.',
    },
    {
      id: '5',
      question: '¿Necesito conocimientos técnicos para usar los productos?',
      answer: 'No. Todos nuestros productos están seleccionados por su facilidad de uso. Además, nuestro servicio de instalación incluye configuración completa y formación personalizada para que puedas usar todo sin problemas.',
    },
    {
      id: '6',
      question: '¿Cómo funciona el servicio de instalación?',
      answer: 'Tras la compra, te contactaremos para programar la fecha. Un técnico certificado acudirá a tu domicilio, instalará y configurará todos los dispositivos, y te explicará su funcionamiento. La duración varía según el producto (60-120 minutos).',
    },
  ];

  return (
    <div>
      {/* Datos estructurados para SEO */}
      <OrganizationStructuredData />
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0f2847] to-[#152d4f] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#2D7FF9] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#22C55E] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Shield className="h-4 w-4 text-[#2D7FF9]" />
              <span className="text-sm font-medium">Seguridad física y digital</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Protege tu hogar y tu negocio,{' '}
              <span className="text-[#2D7FF9]">dentro y fuera de la red</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Productos de seguridad seleccionados, instalación profesional a domicilio y asesoramiento personalizado. 
              Todo lo que necesitas para sentirte seguro.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/catalogo">
                <Button size="lg">
                  Ver catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/packs">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#0B1F3A]">
                  Ver packs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Accesos por perfil */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
              Soluciones para cada perfil
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Productos y servicios adaptados a tus necesidades específicas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProfileCard
              icon={<Home className="h-10 w-10" />}
              title="Familias"
              description="Protege a los tuyos con sistemas fáciles de usar. Cámaras, alarmas y cerraduras inteligentes para el día a día."
              link="/catalogo?perfil=familia"
              color="bg-blue-50 text-[#2D7FF9]"
            />
            <ProfileCard
              icon={<Heart className="h-10 w-10" />}
              title="Personas mayores"
              description="Tecnología sencilla con soporte cercano. Productos intuitivos y instalación incluida para que no te compliques."
              link="/catalogo?perfil=mayor"
              color="bg-pink-50 text-pink-600"
            />
            <ProfileCard
              icon={<Building2 className="h-10 w-10" />}
              title="Negocios"
              description="Seguridad integral para tu local o oficina. Videovigilancia, control de accesos y ciberseguridad profesional."
              link="/catalogo?perfil=negocio"
              color="bg-green-50 text-[#22C55E]"
            />
          </div>
        </div>
      </section>

      {/* Packs destacados */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-2">
                Packs destacados
              </h2>
              <p className="text-gray-600">
                Todo incluido: productos + instalación profesional
              </p>
            </div>
            <Link to="/packs" className="hidden sm:inline-flex text-[#2D7FF9] hover:underline text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          
          {featuredPacks && featuredPacks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPacks.map((pack) => (
                <ProductCard key={pack.id} product={pack} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">Los packs se mostrarán aquí cuando estén disponibles</p>
            </div>
          )}
          
          <div className="sm:hidden mt-6 text-center">
            <Link to="/packs" className="text-[#2D7FF9] hover:underline text-sm font-medium">
              Ver todos los packs →
            </Link>
          </div>
        </div>
      </section>

      {/* Ventajas */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
              ¿Por qué elegir SegurHogar?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Más que productos: un servicio completo de principio a fin
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AdvantageCard
              icon={<Wrench className="h-8 w-8" />}
              title="Instalación profesional"
              description="Nuestro técnico va a tu domicilio, instala y configura todo. Tú solo disfrutas de la tranquilidad."
            />
            <AdvantageCard
              icon={<Award className="h-8 w-8" />}
              title="Garantía de 3 años"
              description="Todos nuestros productos incluyen 3 años de garantía. Si algo falla, lo reparamos o sustituimos sin coste."
            />
            <AdvantageCard
              icon={<Headphones className="h-8 w-8" />}
              title="Soporte cercano"
              description="Atención al cliente en español, por teléfono y email. Te ayudamos con cualquier duda o incidencia."
            />
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              name="María G."
              location="Madrid"
              text="Instalaron las cámaras en casa de mis padres y les explicaron todo con mucha paciencia. Ahora pueden ver desde el móvil si todo está bien. Un 10."
              rating={5}
            />
            <TestimonialCard
              name="Carlos R."
              location="Pozuelo"
              text="El pack de seguridad para mi negocio fue una gran inversión. La instalación fue rápida y el técnico muy profesional. Totalmente recomendable."
              rating={5}
            />
            <TestimonialCard
              name="Ana M."
              location="Las Rozas"
              text="Tenía miedo de que la tecnología fuera complicada para mí, pero me lo configuraron todo y ahora lo uso sin problemas. El soporte es excelente."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Comprobador de zona */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
            ¿Instalamos en tu zona?
          </h2>
          <p className="text-gray-600 mb-6">
            Comprueba si llegamos a tu código postal
          </p>
          <Link to="/comprobar-zona">
            <Button size="lg" variant="outline">
              Comprobar código postal
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
              Preguntas frecuentes
            </h2>
            <p className="text-gray-600">
              Resolvemos tus dudas más comunes
            </p>
          </div>
          <Accordion items={faqItems} />
        </div>
      </section>

      {/* CTA final */}
      <section className="py-12 md:py-16 bg-[#0B1F3A] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Listo para proteger lo que importa?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Explora nuestro catálogo o habla con nuestro asistente para encontrar la solución perfecta para ti.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/catalogo">
              <Button size="lg">
                Ver catálogo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileCard({ icon, title, description, link, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: string;
}) {
  return (
    <Link to={link} className="block">
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
            {icon}
          </div>
          <h3 className="font-bold text-[#0B1F3A] text-lg mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          <div className="mt-4 text-[#2D7FF9] text-sm font-medium flex items-center">
            Ver productos <ArrowRight className="ml-1 h-4 w-4" />
          </div>
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
      <div className="inline-flex p-4 rounded-2xl bg-blue-50 text-[#2D7FF9] mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-[#0B1F3A] text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, location, text, rating }: {
  name: string;
  location: string;
  text: string;
  rating: number;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Quote className="h-8 w-8 text-[#2D7FF9] mb-3 opacity-30" />
        <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">
          "{text}"
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="font-semibold text-[#0B1F3A] text-sm">{name}</p>
            <p className="text-xs text-gray-500">{location}</p>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: rating }).map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
