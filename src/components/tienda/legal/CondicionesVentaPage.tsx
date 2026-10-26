import { LegalLayout } from './LegalLayout';

export function CondicionesVentaPage() {
  return (
    <LegalLayout title="Condiciones Generales de Venta" lastUpdated="[FECHA_ACTUALIZACION]">
      <section>
        <h2>1. Identificación del vendedor</h2>
        <p>
          Las presentes Condiciones Generales de Venta regulan la compraventa de productos y
          servicios a través del sitio web [DOMINIO_WEB], titularidad de:
        </p>
        <ul>
          <li>
            <strong>Denominación social:</strong> [NOMBRE_EMPRESA]
          </li>
          <li>
            <strong>CIF/NIF:</strong> [CIF_NIF]
          </li>
          <li>
            <strong>Domicilio:</strong> [DIRECCION_COMPLETA]
          </li>
          <li>
            <strong>Email:</strong> <a href="mailto:[EMAIL_CONTACTO]">[EMAIL_CONTACTO]</a>
          </li>
          <li>
            <strong>Teléfono:</strong> [TELEFONO]
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Objeto</h2>
        <p>
          Las presentes Condiciones regulan la venta de productos de seguridad física y digital,
          así como servicios de instalación a domicilio, a través del sitio web [DOMINIO_WEB].
        </p>
        <p>
          Al realizar un pedido a través de nuestro sitio web, el cliente acepta íntegramente las
          presentes Condiciones Generales de Venta.
        </p>
      </section>

      <section>
        <h2>3. Productos y servicios</h2>
        <h3>3.1 Tipos de productos</h3>
        <ul>
          <li>
            <strong>Productos de dropshipping:</strong> Productos enviados directamente desde
            nuestros proveedores autorizados.
          </li>
          <li>
            <strong>Productos de afiliado:</strong> Productos disponibles en tiendas asociadas
            (Amazon, etc.) a través de enlaces de afiliación.
          </li>
          <li>
            <strong>Servicios de instalación:</strong> Instalación profesional a domicilio de
            productos de seguridad.
          </li>
          <li>
            <strong>Packs:</strong> Combinaciones de productos y servicios con precio especial.
          </li>
        </ul>

        <h3>3.2 Características de los productos</h3>
        <p>
          Las características esenciales de los productos se describen en cada ficha de producto.
          Las fotografías e ilustraciones presentadas en el sitio web tienen carácter orientativo
          y no son contractuales.
        </p>

        <h3>3.3 Disponibilidad</h3>
        <p>
          Los productos se ofrecen hasta agotar existencias o mientras figuren en el catálogo del
          sitio web. En caso de indisponibilidad temporal, informaremos al cliente y le
          ofreceremos la posibilidad de esperar o cancelar el pedido con reembolso íntegro.
        </p>
      </section>

      <section>
        <h2>4. Precios</h2>
        <p>
          Todos los precios indicados en el sitio web están expresados en euros (€) e incluyen el
          IVA aplicable en cada momento (actualmente 21% para la mayoría de productos).
        </p>
        <p>
          Los gastos de envío, cuando procedan, se indicarán claramente antes de finalizar la
          compra.
        </p>
        <p>
          [NOMBRE_EMPRESA] se reserva el derecho a modificar sus precios en cualquier momento, si
          bien los productos se facturarán a los precios vigentes en el momento de la confirmación
          del pedido.
        </p>
      </section>

      <section>
        <h2>5. Proceso de compra</h2>
        <h3>5.1 Realización del pedido</h3>
        <p>El proceso de compra se realiza en las siguientes etapas:</p>
        <ol>
          <li>Selección de productos y adición al carrito</li>
          <li>Identificación del cliente (registro o como invitado)</li>
          <li>Indicación de la dirección de envío y facturación</li>
          <li>Selección del método de pago</li>
          <li>Verificación y confirmación del pedido</li>
          <li>Pago seguro</li>
          <li>Recepción del email de confirmación</li>
        </ol>

        <h3>5.2 Confirmación del pedido</h3>
        <p>
          Una vez realizado el pago, el cliente recibirá un email de confirmación con el número de
          pedido y el detalle de la compra. El contrato de compraventa se considerará perfeccionado
          en el momento de la aceptación del pedido por parte de [NOMBRE_EMPRESA].
        </p>

        <h3>5.3 Facturación</h3>
        <p>
          Se emitirá factura conforme a la legislación vigente. El cliente puede solicitar factura
          con datos fiscales completos durante el proceso de compra marcando la opción "Necesito
          factura".
        </p>
      </section>

      <section>
        <h2>6. Métodos de pago</h2>
        <p>Aceptamos los siguientes métodos de pago:</p>
        <ul>
          <li>
            <strong>Tarjeta de crédito/débito:</strong> Visa, Mastercard, American Express a
            través de la pasarela segura de Stripe.
          </li>
          <li>
            <strong>Apple Pay / Google Pay:</strong> Pago rápido y seguro desde dispositivos
            móviles.
          </li>
        </ul>
        <p>
          El pago se realiza de forma segura a través de Stripe, plataforma certificada PCI DSS
          Nivel 1. [NOMBRE_EMPRESA] no almacena en ningún momento los datos de las tarjetas de
          crédito de sus clientes.
        </p>
      </section>

      <section>
        <h2>7. Entrega</h2>
        <h3>7.1 Plazos de entrega</h3>
        <p>Los plazos de entrega son los siguientes:</p>
        <ul>
          <li>
            <strong>Productos en stock:</strong> 3-7 días laborables desde la confirmación del
            pago.
          </li>
          <li>
            <strong>Productos dropshipping:</strong> 7-15 días laborables (según proveedor).
          </li>
          <li>
            <strong>Servicios de instalación:</strong> Se coordinarán directamente con el cliente
            en un plazo de 3-7 días laborables.
          </li>
        </ul>

        <h3>7.2 Zona de entrega</h3>
        <p>
          Los servicios de instalación se prestan actualmente en la Comunidad de Madrid y zonas
          limítrofes. Puedes comprobar si llegamos a tu zona en la sección "Comprobar zona" de
          nuestra web.
        </p>
        <p>
          El envío de productos se realiza a toda la Península Ibérica. Para Baleares, Canarias,
          Ceuta y Melilla, consultar condiciones específicas.
        </p>

        <h3>7.3 Seguimiento</h3>
        <p>
          Una vez enviado el pedido, el cliente recibirá un email con el número de seguimiento
          para poder consultar el estado de la entrega en todo momento.
        </p>
      </section>

      <section>
        <h2>8. Derecho de desistimiento</h2>
        <p>
          De acuerdo con el Real Decreto-ley 1/2007, el cliente dispone de un plazo de{' '}
          <strong>14 días naturales</strong> desde la recepción del producto para ejercer el
          derecho de desistimiento, sin necesidad de justificación y sin penalización alguna.
        </p>
        <p>
          Para ejercer este derecho, el cliente deberá comunicarlo a [NOMBRE_EMPRESA] mediante
          declaración inequívoca (por email a [EMAIL_CONTACTO] o por escrito a la dirección
          social).
        </p>
        <p>
          El reembolso se realizará en un plazo máximo de 14 días desde la comunicación del
          desistimiento, utilizando el mismo medio de pago empleado por el cliente.
        </p>
        <p>
          El cliente deberá devolver los productos en su embalaje original y en perfectas
          condiciones. Los gastos de devolución correrán por cuenta del cliente, salvo que se
          indique lo contrario.
        </p>
        <p>
          <strong>Excepciones:</strong> El derecho de desistimiento no será aplicable a los
          servicios de instalación una vez hayan sido ejecutados con el consentimiento del
          cliente.
        </p>
        <p>
          Para más información, consulta nuestra{' '}
          <a href="/devoluciones">Política de Devoluciones</a>.
        </p>
      </section>

      <section>
        <h2>9. Garantía</h2>
        <p>
          Todos los productos vendidos por [NOMBRE_EMPRESA] cuentan con una garantía legal de{' '}
          <strong>3 años</strong> para consumidores, conforme a la normativa vigente.
        </p>
        <p>
          Los servicios de instalación cuentan con una garantía de <strong>1 año</strong> sobre el
          trabajo realizado.
        </p>
        <p>
          Para más información, consulta nuestra{' '}
          <a href="/garantia">Política de Garantía</a>.
        </p>
      </section>

      <section>
        <h2>10. Responsabilidad</h2>
        <p>
          [NOMBRE_EMPRESA] no será responsable de:
        </p>
        <ul>
          <li>
            Incumplimientos imputables al cliente (dirección errónea, ausencia en el momento de la
            entrega, etc.).
          </li>
          <li>
            Retrasos en la entrega causados por fuerza mayor (huelgas, catástrofes naturales,
            etc.).
          </li>
          <li>
            Daños derivados del uso incorrecto de los productos por parte del cliente.
          </li>
          <li>
            Problemas derivados de la conexión a Internet o del funcionamiento de los dispositivos
            del cliente.
          </li>
        </ul>
      </section>

      <section>
        <h2>11. Propiedad intelectual</h2>
        <p>
          Todos los contenidos del sitio web (textos, imágenes, logotipos, diseño gráfico, código
          fuente, etc.) son propiedad de [NOMBRE_EMPRESA] o de terceros que han autorizado su uso,
          y están protegidos por la legislación sobre propiedad intelectual e industrial.
        </p>
      </section>

      <section>
        <h2>12. Protección de datos</h2>
        <p>
          Los datos personales del cliente serán tratados conforme a nuestra{' '}
          <a href="/privacidad">Política de Privacidad</a>, en cumplimiento del RGPD y la
          LOPDGDD.
        </p>
      </section>

      <section>
        <h2>13. Legislación aplicable y jurisdicción</h2>
        <p>
          Las presentes Condiciones Generales se regirán por la legislación española. Para la
          resolución de cualquier controversia que pudiera derivarse de la interpretación o
          ejecución de las presentes Condiciones, las partes se someten expresamente a los
          Juzgados y Tribunales de [CIUDAD_JUZGADOS], salvo que la normativa aplicable disponga
          otra cosa en relación con consumidores.
        </p>
        <p>
          No obstante, como consumidor, tienes derecho a acudir a los sistemas de resolución
          alternativa de conflictos existentes en la Unión Europea. Puedes acceder al portal de
          resolución de litigios en línea de la Comisión Europea en:{' '}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          .
        </p>
      </section>

      <section>
        <h2>14. Contacto</h2>
        <p>
          Para cualquier consulta relacionada con las presentes Condiciones Generales de Venta,
          puedes ponerte en contacto con nosotros a través de:
        </p>
        <ul>
          <li>
            Email: <a href="mailto:[EMAIL_CONTACTO]">[EMAIL_CONTACTO]</a>
          </li>
          <li>Teléfono: [TELEFONO]</li>
          <li>Dirección postal: [DIRECCION_COMPLETA]</li>
        </ul>
      </section>
    </LegalLayout>
  );
}
