
export class ProductImageHelper {
  static getProductImageSrc(product: any): string {
    if (!product || !product.nombre) {
      return 'assets/images/default.jpg';
    }

    // Normalizar el nombre: minúsculas, sin tildes
    const nombre = product.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

    const rutas: { condicion: boolean; ruta: string }[] = [
      {
        condicion: nombre.includes('plug')& nombre.includes('silicona'),
        ruta: 'assets/images/plug-dobles/dorado_plug-doble3.jpg'
      },
      {
        condicion: nombre.includes('plug')& nombre.includes('corazon'),
        ruta: 'assets/images/plug/plug8.jpg'
      },
      {
        condicion: nombre.includes('plug'),
        ruta: 'assets/images/plug/plug5.jpg'
      },
      {
        condicion: nombre.includes('tunel de silicona'),
        ruta: 'assets/images/tunel-silicona/tunel1.jpg'
      },
      {
        condicion: nombre.includes('tunel') & nombre.includes('mandala'),
        ruta: 'assets/images/tunel-orfebre/tuneles-orfebre1.jpg'
      },
      {
        condicion: nombre.includes('tunel de acero'),
        ruta: 'assets/images/tunel-metal/tunel-metal2.jpg'
      },
      {
        condicion: nombre.includes('tunel') & nombre.includes('acrilico'),
        ruta: 'assets/images/tunel-acrilico/dorado_anillo6.jpg'
      },
      {
        condicion: nombre.includes('mandala'),
        ruta: 'assets/images/tunel-ofebre/dorado_tuneles-orfebre1.jpg'
      },
      {
        condicion: nombre.includes('plug') && nombre.includes('dorado'),
        ruta: 'assets/images/plug-dobles/dorado_plug-doble3.jpg'
      },
      {
        condicion: nombre.includes('banana con rosa'),
        ruta: 'assets/images/banana-flor/banana-flor4.jpg'
      },
      {
        condicion: nombre.includes('circular') && nombre.includes('barbell') && nombre.includes('piedra'),
        ruta: 'assets/images/circular-barbell-piedra/circular-barbel-piedra1.jpg'
      },
      {
        condicion: nombre.includes('circular') && nombre.includes('barbell') && nombre.includes('coni'),
        ruta: 'assets/images/circular-barbell-coni/negro.jpg'
      },
      {
        condicion: nombre.includes('barbell') && nombre.includes('flecha'),
        ruta: 'assets/images/barbell-flecha/barbel-flecha1.jpg'
      },
      {
        condicion: nombre.includes('barbell') && nombre.includes('alas'),
        ruta: 'assets/images/barbell-alas/plateado.jpg'
      },
      {
        condicion: nombre.includes('barbell') && nombre.includes('largo'),
        ruta: 'assets/images/barbell-largo/barbell-largo1.jpg'
      },
      {
        condicion: nombre.includes('dilatadores'),
        ruta: 'assets/images/set-dilatadores/dorado_set4.jpg'
      },
      {
        condicion: nombre.includes('set de dilatadores'),
        ruta: 'assets/images/set-dilatadores/set-dilatadores3.jpg'
      },
      {
        condicion: nombre.includes('banana simple'),
        ruta: 'assets/images/banana-simple/banana-simple1.jpg'
      },
      {
        condicion: nombre.includes('aro') && nombre.includes('nostril'),
        ruta: this.detectarColor(nombre, 'aro-nostril', 'aro-nostril1.jpg')
      },
      {
        condicion: nombre.includes('set') && nombre.includes('dilatadores'),
        ruta: 'assets/images/set-dilatadores/set-dilatadores1.jpg'
      },
      {
        condicion: nombre.includes('set') && nombre.includes('dilatadores'),
        ruta: 'assets/images/set-dilatadores/set-dilatadores1.jpg'
      },
       {
        condicion: nombre.includes('expander') && nombre.includes('curvados'),
        ruta: 'assets/images/expander/dorado_expander3.jpg'
      }, 
      {
        condicion: nombre.includes('expander') && nombre.includes('espiral'),
        ruta: 'assets/images/expander/dorado_expander4.jpg'
      }, 
      {
        condicion: nombre.includes('banana') && nombre.includes('dorada'),
        ruta: 'assets/images/banana/banana7.jpg'
      },
      {
        condicion: nombre.includes('banana') && nombre.includes('simple'),
        ruta: 'assets/images/banana-simple/banana-simple1.jpg'
      },
/*       {
        condicion: nombre.includes('banana'),
        ruta: this.detectarColor(nombre, 'banana', 'banana1.jpg')
      }, */
      {
        condicion: nombre.includes('banana') && nombre.includes('negra'),
        ruta: 'assets/images/banana/banana6.jpg'
      },
      {
        condicion: nombre.includes('labret') && nombre.includes('triangulo'),
        ruta: 'assets/images/labret-triangulos/labret-triangulos1.jpg'
      },
      {
        condicion: nombre.includes('labret') && nombre.includes('corazon'),
        ruta: 'assets/images/labret-corazon/labret-corazon1.jpg'
      },
      {
        condicion: nombre.includes('labret'),
        ruta: 'assets/images/labret/labret1.jpg'
      },
      {
        condicion: nombre.includes('anillo') && nombre.includes('corazon'),
        ruta: 'assets/images/anillo-corazon/anillo-corazon1.jpg'
      },
      {
        condicion: nombre.includes('anillo') && nombre.includes('bisagra'),
        ruta: 'assets/images/anillo-bisagra/negro.jpg'
      },
      {
        condicion: nombre.includes('anillo'),
        ruta: 'assets/images/anillo/anillo1.jpg'
      },
      {
        condicion: nombre.includes('segment'),
        ruta: 'assets/images/segment-ring/dorado.jpg'
      },
      {
        condicion: nombre.includes('plug'),
        ruta: 'assets/images/plug/plug1.jpg'
      },
      {
        condicion: nombre.includes('bisagra'),
        ruta: 'assets/images/anillo-bisagra/negro.jpg'
      }
    ];

    for (const item of rutas) {
      if (item.condicion) {
        console.log(`Producto: ${product.nombre} → Ruta: ${item.ruta}`);
        return item.ruta;
      }
    }

    console.warn(`No se encontró imagen para: ${nombre}`);
    return 'assets/images/default.jpg';
  }

  // Método auxiliar para detectar colores
  static detectarColor(nombre: string, carpeta: string, porDefecto: string): string {
    if (nombre.includes('negro') || (nombre.includes('negra'))) {
      return `assets/images/${carpeta}/negro_${carpeta}1.jpg`;
    } else if (nombre.includes('dorado')) {
      return `assets/images/${carpeta}/dorado_${carpeta}1.jpg`;
    } else if (nombre.includes('plateado')) {
      return `assets/images/${carpeta}/plateado_${carpeta}1.jpg`;
    }
    return `assets/images/${carpeta}/${porDefecto}`;
  }
}
