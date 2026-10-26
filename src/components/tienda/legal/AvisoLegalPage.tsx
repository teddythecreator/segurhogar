import { LegalLayout } from './LegalLayout';

export function AvisoLegalPage() {
  return (
    <LegalLayout title="Aviso Legal" lastUpdated="[FECHA_ACTUALIZACION]">
      <section>
        <h2>1. Datos identificativos del titular</h2>
        <p>
          En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
          Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los datos
          identificativos del titular del sitio web:
        </p>
        <ul>
          <li>
            <strong>Denominación social:</strong> [NOMBRE_EMPRESA]
          </li>
          <li>
            <strong>CIF/NIF:</strong> [CIF_NIF]
          </li>
          <li>
            <strong>Domicilio social:</strong> [DIRECCION_COMPLETA]
          </li>
          <li>
            <strong>Inscrita en el Registro Mercantil de:</strong> [REGISTRO_MERCANTIL], Tomo [TOMO], Folio [FOLIO], Hoja [HOJA]
          </li>
          <li>
            <strong>Correo electrónico:</strong>{' '}
            <a href="mailto:[EMAIL_CONTACTO]">[EMAIL_CONTACTO]</a>
          </li>
          <li>
            <strong>Teléfono de contacto:</strong> [TELEFONO]
          </li>
          <li>
            <strong>Dominio web:</strong> [DOMINIO_WEB]
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Objeto</h2>
        <p>
          El presente Aviso Legal regula el uso del sitio web [DOMINIO_WEB], cuyo objeto es la
          venta de productos de seguridad física y digital para hogares, personas mayores y
          pequeños negocios, así como servicios de instalación a domicilio.
        </p>
      </section>

      <section>
        <h2>3. Legislación aplicable</h2>
        <p>
          La prestación de los servicios del sitio web, así como los presentes términos y
          condiciones, se regirán por la legislación española. Son de aplicación, entre otras, las
          siguientes normas:
        </p>
        <ul>
          <li>Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)</li>
          <li>Real Decreto-ley 1/2007, de 16 de noviembre, por el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios</li>
          <li>Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016 (RGPD)</li>
          <li>Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)</li>
        </ul>
      </section>

      <section>
        <h2>4. Condiciones de uso</h2>
        <p>
          El acceso y uso de este sitio web atribuye la condición de usuario, aceptando desde
          dicho acceso las presentes condiciones de uso. El usuario se compromete a hacer un uso
          adecuado de los contenidos y servicios ofrecidos y a no emplearlos para:
        </p>
        <ul>
          <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público</li>
          <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos</li>
          <li>Provocar daños en los sistemas físicos y lógicos del titular, introducir o difundir virus informáticos o cualesquiera otros sistemas capaces de causar daños</li>
          <li>Intentar acceder y, en su caso, utilizar las cuentas de correo electrónico de otros usuarios y modificar o manipular sus mensajes</li>
        </ul>
      </section>

      <section>
        <h2>5. Propiedad intelectual e industrial</h2>
        <p>
          Todos los contenidos del sitio web (textos, fotografías, gráficos, imágenes, tecnología,
          software, enlaces, contenidos audiovisuales, etc.), así como su diseño gráfico y códigos
          fuente, son propiedad intelectual de [NOMBRE_EMPRESA] o de terceros que han autorizado
          su uso, sin que puedan entenderse cedidos al usuario ninguno de los derechos de
          explotación reconocidos por la normativa vigente en materia de propiedad intelectual.
        </p>
      </section>

      <section>
        <h2>6. Enlaces a terceros</h2>
        <p>
          Este sitio web puede contener enlaces a sitios de terceros. Si habilita enlaces,
          abandonará nuestro sitio. No controlamos y no asumimos ninguna responsabilidad por el
          contenido, políticas de privacidad o prácticas de sitios o servicios de terceros.
        </p>
      </section>

      <section>
        <h2>7. Responsabilidad</h2>
        <p>
          [NOMBRE_EMPRESA] no se hace responsable de los daños y perjuicios de cualquier
          naturaleza que pudieran derivarse del uso de este sitio web, incluyendo, a título
          enunciativo y no limitativo: errores u omisiones en los contenidos, falta de
          disponibilidad del sitio, o la transmisión de virus, a pesar de haber adoptado todas las
          medidas tecnológicas necesarias para evitarlo.
        </p>
      </section>

      <section>
        <h2>8. Modificaciones</h2>
        <p>
          [NOMBRE_EMPRESA] se reserva el derecho a efectuar, sin previo aviso, las modificaciones
          que considere oportunas en su sitio web, pudiendo cambiar, suprimir o añadir tanto los
          contenidos y servicios que se presten a través de la misma, como la forma en la que
          éstos aparezcan presentados o localizados.
        </p>
      </section>

      <section>
        <h2>9. Contacto</h2>
        <p>
          Para cualquier consulta o reclamación relacionada con el presente Aviso Legal, el
          usuario puede dirigirse a:
        </p>
        <ul>
          <li>
            Correo electrónico:{' '}
            <a href="mailto:[EMAIL_CONTACTO]">[EMAIL_CONTACTO]</a>
          </li>
          <li>Dirección postal: [DIRECCION_COMPLETA]</li>
        </ul>
      </section>
    </LegalLayout>
  );
}
