export interface DesignSoftProduct {
  id: string;
  nombre: string;
  categoria: 'facturacion' | 'pos' | 'medico' | 'novedades';
  descripcion: string;
  precioMensualCRC: string;
  precioMensualUSD: string;
  compatibilidad: string[];
  caracteristicas: string[];
}

export interface DesignSoftNovelty {
  id: string;
  version: string;
  fecha: string;
  categoria: 'facturacion' | 'pos' | 'medico' | 'general';
  titulo: string;
  descripcion: string;
  moduloAfectado: string;
}

export const DESIGN_SOFT_PRODUCTS: DesignSoftProduct[] = [
  {
    id: 'facturacion-atv',
    nombre: 'DesignSoft Facturación Electrónica Cloud (Hacienda ATV v4.3)',
    categoria: 'facturacion',
    descripcion: 'Sistema de emisión y recepción automática de comprobantes electrónicos en pleno cumplimiento con la normativa tributaria v4.3 de Hacienda Costa Rica.',
    precioMensualCRC: '₡15,000 IVI',
    precioMensualUSD: '$30 USD',
    compatibilidad: ['Windows', 'Web Browsers', 'Android', 'iOS'],
    caracteristicas: [
      'Emisión ilimitada de Facturas, Tiquetes, Notas de Crédito y Débito',
      'Validación e importación automática de XML de gastos y compras',
      'Renovación asistida de Llaves Criptográficas y certificados ATV',
      'Envío automático a correo electrónico y WhatsApp de clientes',
      'Integración con reporte de impuestos IVA de Hacienda'
    ]
  },
  {
    id: 'pos-restaurantes',
    nombre: 'DesignSoft POS Restaurantes, Bares & Cafeterías',
    categoria: 'pos',
    descripcion: 'Punto de venta especializado para la gestión operativa en sala, cocina, barra y delivery en negocios gastronómicos de Costa Rica.',
    precioMensualCRC: '₡35,000 IVI',
    precioMensualUSD: '$70 USD',
    compatibilidad: ['Touchscreens Windows', 'Miniprinters Térmicas (Epson/Bixolon)', 'Tablets Android/iOS para meseros'],
    caracteristicas: [
      'Mapa interactivo de mesas con estado en tiempo real (Disponible, Ocupada, Facturando)',
      'Comanderas táctiles móviles para meseros con envío directo a cocina y barra',
      'Control de inventario por recetas, gramos, mililitros e insumos con merma',
      'Facturación Electrónica ATV v4.3 integrada en el cierre de cuenta',
      'Arqueos de caja por turno y Cierre Z diario detallado'
    ]
  },
  {
    id: 'sistema-medico',
    nombre: 'DesignSoft Médica - Expediente Clínico & Agenda',
    categoria: 'medico',
    descripcion: 'Plataforma para médicos independientes, clínicas y centros de salud aprobada según directrices del Colegio de Médicos de Costa Rica.',
    precioMensualCRC: '₡45,000 IVI',
    precioMensualUSD: '$90 USD',
    compatibilidad: ['Web Browsers', 'Tablets', 'Mac & PC'],
    caracteristicas: [
      'Expediente clínico digital estructurado por consulta e historial médico',
      'Emisión de recetas médicas con Firma Digital de Costa Rica',
      'Agenda interactiva de citas con recordatorios automatizados por WhatsApp',
      'Tiquete y factura electrónica médica integrada'
    ]
  }
];

export const DESIGN_SOFT_NOVELTIES: DesignSoftNovelty[] = [
  {
    id: 'nov-01',
    version: 'v5.2.0',
    fecha: '2026-08-01',
    categoria: 'pos',
    titulo: 'Comandas Táctiles Móviles Android & Impresoras Bluetooth',
    descripcion: 'Nuevo módulo para tomar pedidos directamente en mesa desde cualquier smartphone Android con sincronización instantánea a la cocina.',
    moduloAfectado: 'POS Restaurantes'
  },
  {
    id: 'nov-02',
    version: 'v4.3.2',
    fecha: '2026-07-15',
    categoria: 'facturacion',
    titulo: 'Auto-Renovación de Llaves ATV y Pre-Validación XML',
    descripcion: 'Asistente inteligente que avisa 30 días antes del vencimiento de la llave criptográfica de Hacienda y pre-valida impuestos de compras.',
    moduloAfectado: 'Facturación Electrónica Cloud'
  },
  {
    id: 'nov-03',
    version: 'v3.1.0',
    fecha: '2026-06-20',
    categoria: 'medico',
    titulo: 'Recordatorios Automatizados de Citas por WhatsApp',
    descripcion: 'Confirmación y cancelación de citas médicas automatizada mediante WhatsApp Bot integrado con la agenda de la clínica.',
    moduloAfectado: 'DesignSoft Médica'
  }
];

export function getCatalogAndNovelties(params?: { categoria?: string; busqueda?: string }) {
  const catParam = params?.categoria?.toLowerCase();
  const searchParam = params?.busqueda?.toLowerCase();

  let filteredProducts = DESIGN_SOFT_PRODUCTS;
  let filteredNovelties = DESIGN_SOFT_NOVELTIES;

  if (catParam && catParam !== 'todas' && catParam !== 'general') {
    if (catParam === 'novedades') {
      filteredProducts = [];
    } else {
      filteredProducts = filteredProducts.filter(p => p.categoria === catParam);
      filteredNovelties = filteredNovelties.filter(n => n.categoria === catParam);
    }
  }

  if (searchParam) {
    filteredProducts = filteredProducts.filter(p =>
      p.nombre.toLowerCase().includes(searchParam) ||
      p.descripcion.toLowerCase().includes(searchParam) ||
      p.caracteristicas.some(c => c.toLowerCase().includes(searchParam))
    );

    filteredNovelties = filteredNovelties.filter(n =>
      n.titulo.toLowerCase().includes(searchParam) ||
      n.descripcion.toLowerCase().includes(searchParam) ||
      n.moduloAfectado.toLowerCase().includes(searchParam)
    );
  }

  return {
    empresa: 'DesignSoft Costa Rica (15 Años de Experiencia)',
    monedasSoportadas: ['CRC (₡ Colones)', 'USD ($ Dólares)'],
    cumplimientoNormativo: 'Hacienda Costa Rica ATV v4.3, SUTEL & Colegio de Médicos',
    productos: filteredProducts,
    novedades: filteredNovelties
  };
}
