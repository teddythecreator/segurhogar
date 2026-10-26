import { LegalLayout } from './LegalLayout';

export function CookiesPage() {
  return (
    <LegalLayout title="Política de Cookies" lastUpdated="[FECHA_ACTUALIZACION]">
      <section>
        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que los sitios web almacenan en tu
          dispositivo (ordenador, tablet, móvil) cuando los visitas. Permiten que el sitio web
          recuerde información sobre tu visita, como tu idioma preferido y otras configuraciones,
          lo que puede facilitar tu próxima visita y hacer que el sitio te resulte más útil.
        </p>
      </section>

      <section>
        <h2>2. ¿Qué tipos de cookies utilizamos?</h2>
        
        <h3>2.1 Cookies técnicas (esenciales)</h3>
        <p>
          Son necesarias para el funcionamiento del sitio web y no se pueden desactivar. Solo se
          establecen en respuesta a acciones realizadas por ti, como establecer tus preferencias
          de privacidad, iniciar sesión o rellenar formularios.
        </p>
        <table className="w-full text-sm border-collapse mt-3">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2 text-left">Cookie</th>
              <th className="border p-2 text-left">Finalidad</th>
              <th className="border p-2 text-left">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">sb-session</td>
              <td className="border p-2">Mantener la sesión del usuario</td>
              <td className="border p-2">Sesión</td>
            </tr>
            <tr>
              <td className="border p-2">segurhogar-cart</td>
              <td className="border p-2">Almacenar el carrito de compra</td>
              <td className="border p-2">Persistente (1 año)</td>
            </tr>
            <tr>
              <td className="border p-2">segurhogar-auth</td>
              <td className="border p-2">Recordar datos de autenticación</td>
              <td className="border p-2">Persistente (1 año)</td>
            </tr>
            <tr>
              <td className="border p-2">cookie-consent</td>
              <td className="border p-2">Recordar tus preferencias de cookies</td>
              <td className="border p-2">1 año</td>
            </tr>
          </tbody>
        </table>

        <h3>2.2 Cookies analíticas</h3>
        <p>
          Nos permiten medir y mejorar el rendimiento del sitio web, recopilando información
          sobre cómo los visitantes interactúan con el sitio.
        </p>
        <table className="w-full text-sm border-collapse mt-3">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2 text-left">Cookie</th>
              <th className="border p-2 text-left">Proveedor</th>
              <th className="border p-2 text-left">Finalidad</th>
              <th className="border p-2 text-left">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">_ga, _gid</td>
              <td className="border p-2">Google Analytics</td>
              <td className="border p-2">Analizar el tráfico web</td>
              <td className="border p-2">2 años / 24 horas</td>
            </tr>
          </tbody>
        </table>

        <h3>2.3 Cookies de marketing</h3>
        <p>
          Se utilizan para mostrar anuncios relevantes y atractivos para los usuarios individuales,
          así como para rastrear la eficacia de las campañas publicitarias.
        </p>
        <table className="w-full text-sm border-collapse mt-3">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2 text-left">Cookie</th>
              <th className="border p-2 text-left">Proveedor</th>
              <th className="border p-2 text-left">Finalidad</th>
              <th className="border p-2 text-left">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">_fbp</td>
              <td className="border p-2">Facebook</td>
              <td className="border p-2">Publicidad personalizada</td>
              <td className="border p-2">3 meses</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>3. ¿Cómo puedo gestionar las cookies?</h2>
        <p>
          Puedes configurar tus preferencias de cookies en cualquier momento haciendo clic en el
          botón "Configurar cookies" en el pie de página de nuestro sitio web.
        </p>
        <p>
          También puedes configurar tu navegador para que bloquee o te alerte sobre estas cookies,
          pero ten en cuenta que algunas partes del sitio no funcionarán entonces. Para obtener
          más información sobre cómo administrar las cookies en tu navegador:
        </p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
              Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
              Microsoft Edge
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Cookies de terceros</h2>
        <p>
          Algunos servicios de terceros que utilizamos pueden establecer sus propias cookies en tu
          dispositivo. No tenemos control sobre estas cookies de terceros. Te recomendamos
          consultar las políticas de privacidad de estos terceros para obtener más información:
        </p>
        <ul>
          <li>
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google (Analytics, Ads)
            </a>
          </li>
          <li>
            <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </li>
          <li>
            <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer">
              Stripe (pagos)
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Consentimiento</h2>
        <p>
          Al acceder a nuestro sitio web por primera vez, se te mostrará un banner de cookies
          donde podrás aceptar, rechazar o configurar las cookies no esenciales. Las cookies
          técnicas son necesarias para el funcionamiento del sitio y no requieren consentimiento.
        </p>
        <p>
          Puedes cambiar tus preferencias en cualquier momento haciendo clic en "Configurar
          cookies" en el pie de página.
        </p>
      </section>

      <section>
        <h2>6. Actualizaciones de esta política</h2>
        <p>
          Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las
          cookies que utilizamos o por otros motivos operativos, legales o reglamentarios. Te
          recomendamos revisar esta política regularmente.
        </p>
      </section>

      <section>
        <h2>7. Contacto</h2>
        <p>
          Si tienes alguna pregunta sobre nuestra Política de Cookies, puedes contactarnos en:
        </p>
        <ul>
          <li>
            Email: <a href="mailto:[EMAIL_PRIVACIDAD]">[EMAIL_PRIVACIDAD]</a>
          </li>
          <li>Dirección: [DIRECCION_COMPLETA]</li>
        </ul>
      </section>
    </LegalLayout>
  );
}
