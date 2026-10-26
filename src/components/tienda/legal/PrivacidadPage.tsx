import { LegalLayout } from './LegalLayout';

export function PrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad" lastUpdated="[FECHA_ACTUALIZACION]">
      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018
          (LOPDGDD), le informamos que los datos personales que nos proporcione serán tratados
          por:
        </p>
        <ul>
          <li>
            <strong>Responsable:</strong> [NOMBRE_EMPRESA]
          </li>
          <li>
            <strong>CIF/NIF:</strong> [CIF_NIF]
          </li>
          <li>
            <strong>Dirección:</strong> [DIRECCION_COMPLETA]
          </li>
          <li>
            <strong>Correo electrónico:</strong>{' '}
            <a href="mailto:[EMAIL_PRIVACIDAD]">[EMAIL_PRIVACIDAD]</a>
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Finalidad del tratamiento</h2>
        <p>Los datos personales que recogemos se utilizan para:</p>
        <ul>
          <li>
            <strong>Gestión de pedidos:</strong> Tramitar y enviar los productos solicitados,
            gestionar pagos y comunicaciones relacionadas con el pedido.
          </li>
          <li>
            <strong>Instalación de productos:</strong> Coordinar servicios de instalación a
            domicilio cuando sean contratados.
          </li>
          <li>
            <strong>Atención al cliente:</strong> Responder consultas, reclamaciones y
            proporcionar soporte técnico.
          </li>
          <li>
            <strong>Comunicaciones comerciales:</strong> Enviar información sobre productos y
            servicios (solo con consentimiento previo).
          </li>
          <li>
            <strong>Cumplimiento legal:</strong> Cumplir con obligaciones fiscales, contables y
            legales.
          </li>
          <li>
            <strong>Mejora del servicio:</strong> Analizar el uso del sitio web para mejorar la
            experiencia del usuario.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Base legal para el tratamiento</h2>
        <p>La base legal para el tratamiento de sus datos es:</p>
        <ul>
          <li>
            <strong>Ejecución de un contrato:</strong> Para la gestión de pedidos y prestación de
            servicios contratados (art. 6.1.b RGPD).
          </li>
          <li>
            <strong>Consentimiento del interesado:</strong> Para comunicaciones comerciales y
            cookies no esenciales (art. 6.1.a RGPD).
          </li>
          <li>
            <strong>Cumplimiento de obligaciones legales:</strong> Para facturación y obligaciones
            fiscales (art. 6.1.c RGPD).
          </li>
          <li>
            <strong>Interés legítimo:</strong> Para mejorar nuestros servicios y prevenir fraudes
            (art. 6.1.f RGPD).
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Categorías de datos tratados</h2>
        <p>Podemos recopilar y tratar las siguientes categorías de datos:</p>
        <ul>
          <li>
            <strong>Datos identificativos:</strong> Nombre, apellidos, DNI/NIF, dirección postal,
            email, teléfono.
          </li>
          <li>
            <strong>Datos de facturación:</strong> Razón social, CIF/NIF, dirección fiscal.
          </li>
          <li>
            <strong>Datos de pago:</strong> Procesados a través de pasarelas de pago seguras
            (Stripe). No almacenamos datos de tarjetas de crédito.
          </li>
          <li>
            <strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas
            visitadas (a través de cookies).
          </li>
          <li>
            <strong>Datos de instalaciones:</strong> Fotografías del trabajo realizado, firma del
            cliente (para servicios de instalación).
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Destinatarios de los datos</h2>
        <p>Sus datos podrán ser comunicados a:</p>
        <ul>
          <li>
            <strong>Proveedores de servicios:</strong> Empresas de transporte, proveedores de
            productos (AliExpress para dropshipping), pasarelas de pago (Stripe), servicios de
            email (Resend).
          </li>
          <li>
            <strong>Administraciones públicas:</strong> Cuando sea requerido por obligación legal
            (Agencia Tributaria, etc.).
          </li>
          <li>
            <strong>Otros instaladores:</strong> Técnicos asignados para realizar instalaciones a
            domicilio.
          </li>
        </ul>
        <p>
          Todos los destinatarios están obligados a mantener la confidencialidad de los datos y
          cumplen con la normativa de protección de datos.
        </p>
      </section>

      <section>
        <h2>6. Transferencias internacionales</h2>
        <p>
          Algunos proveedores de servicios pueden estar ubicados fuera del Espacio Económico
          Europeo (EEE). En estos casos, nos aseguramos de que existan garantías adecuadas para la
          protección de sus datos (cláusulas contractuales tipo, decisiones de adecuación de la
          Comisión Europea, etc.).
        </p>
      </section>

      <section>
        <h2>7. Plazo de conservación</h2>
        <p>Los datos se conservarán durante los siguientes plazos:</p>
        <ul>
          <li>
            <strong>Datos de clientes:</strong> Mientras dure la relación contractual y durante
            los plazos legales de prescripción (5 años para obligaciones fiscales).
          </li>
          <li>
            <strong>Datos de prospectos:</strong> Hasta que solicite su supresión o revoque su
            consentimiento.
          </li>
          <li>
            <strong>Datos de navegación:</strong> Máximo 24 meses para cookies analíticas.
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Derechos de los interesados</h2>
        <p>Puede ejercer los siguientes derechos:</p>
        <ul>
          <li>
            <strong>Acceso:</strong> Conocer qué datos personales tratamos.
          </li>
          <li>
            <strong>Rectificación:</strong> Modificar datos inexactos o incompletos.
          </li>
          <li>
            <strong>Supresión:</strong> Solicitar la eliminación de sus datos ("derecho al
            olvido").
          </li>
          <li>
            <strong>Oposición:</strong> Oponerse al tratamiento de sus datos.
          </li>
          <li>
            <strong>Limitación:</strong> Solicitar la limitación del tratamiento.
          </li>
          <li>
            <strong>Portabilidad:</strong> Recibir sus datos en formato estructurado.
          </li>
          <li>
            <strong>No ser objeto de decisiones automatizadas:</strong> Incluida la elaboración de
            perfiles.
          </li>
        </ul>
        <p>
          Para ejercer estos derechos, envíe un correo electrónico a{' '}
          <a href="mailto:[EMAIL_PRIVACIDAD]">[EMAIL_PRIVACIDAD]</a> indicando:
        </p>
        <ul>
          <li>Nombre y apellidos del interesado</li>
          <li>DNI o documento identificativo equivalente</li>
          <li>Derecho que se ejerce y descripción del mismo</li>
          <li>Dirección a efectos de notificaciones</li>
          <li>Fecha y firma</li>
        </ul>
        <p>
          También puede presentar una reclamación ante la Agencia Española de Protección de Datos
          (AEPD) en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
        </p>
      </section>

      <section>
        <h2>9. Medidas de seguridad</h2>
        <p>
          Hemos implementado medidas técnicas y organizativas apropiadas para garantizar un nivel
          de seguridad adecuado al riesgo, incluyendo:
        </p>
        <ul>
          <li>Cifrado de datos en tránsito (HTTPS/TLS)</li>
          <li>Control de acceso basado en roles</li>
          <li>Copias de seguridad periódicas</li>
          <li>Monitorización de accesos y detección de incidentes</li>
          <li>Formación del personal en protección de datos</li>
        </ul>
      </section>

      <section>
        <h2>10. Menores de edad</h2>
        <p>
          Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos
          conscientemente datos personales de menores de edad. Si eres padre/madre o tutor y
          consideras que tu hijo nos ha proporcionado datos personales, contacta con nosotros.
        </p>
      </section>

      <section>
        <h2>11. Modificaciones</h2>
        <p>
          Nos reservamos el derecho a modificar esta Política de Privacidad para adaptarla a
          novedades legislativas o criterios jurisprudenciales. Te recomendamos revisarla
          periódicamente.
        </p>
      </section>
    </LegalLayout>
  );
}
