import { LegalLayout } from './LegalLayout';

export function GarantiaPage() {
  return (
    <LegalLayout title="Política de Garantía" lastUpdated="[FECHA_ACTUALIZACION]">
      <section>
        <h2>1. Garantía legal</h2>
        <p>
          Todos los productos vendidos por [NOMBRE_EMPRESA] cuentan con la{' '}
          <strong>garantía legal de 3 años</strong> para consumidores, conforme al Real
          Decreto-ley 7/2021, de 27 de abril, por el que se transponen directivas de la Unión
          Europea en las materias de competencia, dispositivos médicos y productos sanitarios, y
          se modifica el texto refundido de la Ley General para la Defensa de los Consumidores y
          Usuarios.
        </p>
        <p>
          Esta garantía es independiente y compatible con cualquier garantía comercial adicional
          ofrecida por el fabricante.
        </p>
      </section>

      <section>
        <h2>2. Cobertura de la garantía</h2>
        <p>La garantía cubre:</p>
        <ul>
          <li>
            <strong>Defectos de conformidad:</strong> Falta de conformidad del bien con el
            contrato que se manifieste en un plazo de tres años desde la entrega del bien.
          </li>
          <li>
            <strong>Fallos de fabricación:</strong> Defectos en los materiales o en el proceso de
            fabricación.
          </li>
          <li>
            <strong>Falta de durabilidad:</strong> Cuando el producto no dure el tiempo
            razonablemente esperado según su naturaleza.
          </li>
          <li>
            <strong>No aptitud para el uso:</strong> Cuando el producto no sea apto para el uso al
            que se destinan productos del mismo tipo.
          </li>
          <li>
            <strong>Descripción incorrecta:</strong> Cuando el producto no se ajuste a la
            descripción, muestras o modelos facilitados.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Derechos del consumidor</h2>
        <p>
          En caso de falta de conformidad, tienes derecho a:
        </p>
        <ul>
          <li>
            <strong>Reparación del producto:</strong> Gratuita y en un plazo razonable.
          </li>
          <li>
            <strong>Sustitución del producto:</strong> Por otro idéntico o de características
            similares.
          </li>
          <li>
            <strong>Rebaja del precio:</strong> Proporcional al defecto.
          </li>
          <li>
            <strong>Resolución del contrato:</strong> Devolución íntegra del importe pagado.
          </li>
        </ul>
        <p>
          La elección entre reparación y sustitución corresponde al consumidor, salvo que una de
          las dos opciones sea objetivamente imposible o desproporcionada.
        </p>
      </section>

      <section>
        <h2>4. Plazos para reclamar</h2>
        <p>
          Los defectos de conformidad deben manifestarse en los siguientes plazos desde la entrega
          del producto:
        </p>
        <ul>
          <li>
            <strong>Primeros 2 años:</strong> Se presume que el defecto existía en el momento de
            la entrega, salvo prueba en contrario.
          </li>
          <li>
            <strong>De 2 a 3 años:</strong> El consumidor debe probar que el defecto existía en el
            momento de la entrega.
          </li>
        </ul>
        <p>
          El plazo de prescripción para ejercer los derechos es de{' '}
          <strong>3 años</strong> desde la manifestación del defecto.
        </p>
      </section>

      <section>
        <h2>5. Cómo reclamar la garantía</h2>
        <p>Para hacer efectiva la garantía, sigue estos pasos:</p>
        <ol>
          <li>
            <strong>Contacta con nosotros:</strong> Comunica el defecto por email a{' '}
            <a href="mailto:[EMAIL_GARANTIA]">[EMAIL_GARANTIA]</a> o teléfono [TELEFONO],
            indicando:
            <ul>
              <li>Número de pedido</li>
              <li>Descripción detallada del defecto</li>
              <li>Fotografías o vídeos del problema (si es posible)</li>
              <li>Fecha de compra y fecha de aparición del defecto</li>
            </ul>
          </li>
          <li>
            <strong>Diagnóstico:</strong> Evaluaremos el caso en un plazo de 48 horas laborables
            y te informaremos de la solución propuesta.
          </li>
          <li>
            <strong>Recogida/envío:</strong> Si procede, te enviaremos una etiqueta de devolución
            prepaid (sin coste para ti) o coordinaremos la recogida en tu domicilio.
          </li>
          <li>
            <strong>Reparación/sustitución:</strong> Una vez recibido el producto, procederemos a
            la reparación o sustitución en un plazo máximo de 30 días.
          </li>
          <li>
            <strong>Devolución:</strong> Te enviaremos el producto reparado/sustituido sin gastos
            adicionales.
          </li>
        </ol>
      </section>

      <section>
        <h2>6. Servicios de instalación</h2>
        <p>
          Los servicios de instalación realizados por nuestros técnicos cuentan con una garantía
          específica de <strong>1 año</strong> sobre el trabajo realizado.
        </p>
        <p>Esta garantía cubre:</p>
        <ul>
          <li>Defectos en la instalación realizados por nuestros técnicos</li>
          <li>Fallos derivados de una mala configuración</li>
          <li>Problemas de funcionamiento relacionados con la instalación</li>
        </ul>
        <p>
          No cubre:
        </p>
        <ul>
          <li>Daños causados por el cliente tras la instalación</li>
          <li>Modificaciones realizadas por terceros no autorizados</li>
          <li>Fallos de los productos (cubiertos por la garantía del fabricante)</li>
          <li>Daños por fuerza mayor (inundaciones, incendios, etc.)</li>
        </ul>
      </section>

      <section>
        <h2>7. Exclusiones de la garantía</h2>
        <p>La garantía no cubre:</p>
        <ul>
          <li>
            <strong>Uso indebido:</strong> Daños causados por un uso contrario a las
            instrucciones del fabricante.
          </li>
          <li>
            <strong>Modificaciones no autorizadas:</strong> Alteraciones realizadas por el
            cliente o terceros no autorizados.
          </li>
          <li>
            <strong>Desgaste normal:</strong> Deterioro natural por el uso adecuado del producto.
          </li>
          <li>
            <strong>Fuerza mayor:</strong> Daños causados por accidentes, catástrofes naturales,
            sobretensiones eléctricas, etc.
          </li>
          <li>
            <strong>Falta de mantenimiento:</strong> Daños derivados de no seguir las
            recomendaciones de mantenimiento del fabricante.
          </li>
          <li>
            <strong>Accidentes:</strong> Caídas, golpes, contacto con líquidos, etc.
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Garantías comerciales adicionales</h2>
        <p>
          Algunos productos pueden incluir garantías comerciales adicionales ofrecidas por el
          fabricante. Estas garantías son independientes y complementarias a la garantía legal,
          no la sustituyen.
        </p>
        <p>
          Las condiciones de las garantías comerciales se indican en la ficha de cada producto y
          en la documentación incluida con el mismo.
        </p>
      </section>

      <section>
        <h2>9. Productos de dropshipping</h2>
        <p>
          Para productos enviados directamente desde nuestros proveedores (dropshipping), la
          garantía se gestiona de la misma forma que para el resto de productos. Nosotros
          actuamos como intermediarios y nos hacemos cargo de todas las gestiones con el
          proveedor.
        </p>
        <p>
          Los plazos pueden ser ligeramente superiores debido a la logística internacional, pero
          te mantendremos informado en todo momento.
        </p>
      </section>

      <section>
        <h2>10. Soporte técnico</h2>
        <p>
          Ofrecemos soporte técnico gratuito para todos nuestros productos durante el período de
          garantía. Nuestro equipo puede ayudarte con:
        </p>
        <ul>
          <li>Configuración inicial de productos</li>
          <li>Resolución de problemas comunes</li>
          <li>Actualizaciones de firmware/software</li>
          <li>Integración con otros dispositivos</li>
        </ul>
        <p>
          Puedes contactar con nuestro soporte técnico en:
        </p>
        <ul>
          <li>
            <strong>Email:</strong> <a href="mailto:[EMAIL_SOPORTE]">[EMAIL_SOPORTE]</a>
          </li>
          <li>
            <strong>Teléfono:</strong> [TELEFONO_SOPORTE]
          </li>
          <li>
            <strong>Horario:</strong> [HORARIO_SOPORTE]
          </li>
        </ul>
      </section>

      <section>
        <h2>11. Asistente IA</h2>
        <p>
          Además del soporte humano, disponemos de un asistente de inteligencia artificial que
          puede ayudarte a resolver dudas comunes sobre el uso y configuración de nuestros
          productos. Puedes acceder a él desde el botón flotante en la esquina inferior derecha
          de nuestra web.
        </p>
      </section>

      <section>
        <h2>12. Legislación aplicable</h2>
        <p>
          La presente política de garantía se rige por la legislación española, en particular:
        </p>
        <ul>
          <li>
            Real Decreto-ley 7/2021, de 27 de abril, de transposición de directivas de la Unión
            Europea
          </li>
          <li>
            Real Decreto-ley 1/2007, de 16 de noviembre, Texto Refundido de la Ley General para
            la Defensa de los Consumidores y Usuarios
          </li>
        </ul>
      </section>

      <section>
        <h2>13. Contacto</h2>
        <p>
          Para cualquier consulta sobre garantías, puedes contactarnos en:
        </p>
        <ul>
          <li>
            <strong>Email:</strong>{' '}
            <a href="mailto:[EMAIL_GARANTIA]">[EMAIL_GARANTIA]</a>
          </li>
          <li>
            <strong>Teléfono:</strong> [TELEFONO]
          </li>
          <li>
            <strong>Dirección postal:</strong> [DIRECCION_COMPLETA]
          </li>
        </ul>
        <p>
          Nos comprometemos a responder en un plazo máximo de 48 horas laborables.
        </p>
      </section>
    </LegalLayout>
  );
}
