interface ProductStructuredDataProps {
  name: string;
  description: string;
  image: string[];
  sku: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  ratingValue?: number;
  reviewCount?: number;
}

export function ProductStructuredData({
  name,
  description,
  image,
  sku,
  price,
  currency = 'EUR',
  availability = 'InStock',
  brand = 'SegurHogar',
  ratingValue,
  reviewCount,
}: ProductStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: `${window.location.origin}/producto/${sku}`,
      priceCurrency: currency,
      price,
      availability: `https://schema.org/${availability}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'SegurHogar',
      },
    },
    ...(ratingValue &&
      reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue,
          reviewCount,
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Datos estructurados para la organización
export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '[NOMBRE_EMPRESA]',
    url: 'https://[DOMINIO_WEB]',
    logo: 'https://[DOMINIO_WEB]/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '[TELEFONO]',
      contactType: 'customer service',
      email: '[EMAIL_CONTACTO]',
      availableLanguage: ['Spanish'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '[DIRECCION]',
      addressLocality: '[CIUDAD]',
      postalCode: '[CODIGO_POSTAL]',
      addressCountry: 'ES',
    },
    sameAs: [
      // Añadir redes sociales aquí
      // 'https://facebook.com/...',
      // 'https://twitter.com/...',
      // 'https://instagram.com/...',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Datos estructurados para breadcrumbs
export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${window.location.origin}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
