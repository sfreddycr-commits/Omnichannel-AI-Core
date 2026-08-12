import { FunctionDeclaration, Type } from "@google/genai";

export interface ProductInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  priceMonthlyCRC: number;
  priceMonthlyUSD: number;
  features: string[];
}

export const DESIGNSOFT_CATALOG: ProductInfo[] = [
  {
    id: 'pos-restaurantes',
    name: 'DesignSoft POS Restaurantes & Bares',
    category: 'Puntos de Venta',
    description: 'Sistema integral de comandas táctiles, inventario por receta, mapa de mesas y facturación electrónica directa para Hacienda Costa Rica.',
    priceMonthlyCRC: 35000,
    priceMonthlyUSD: 70,
    features: [
      'Comandas móviles para meseros en tablets/teléfonos',
      'Integración directa con Hacienda Costa Rica v4.3',
      'Control de insumos por gramaje y recetas',
      'Reporte Z y cierres de caja en tiempo real'
    ]
  },
  {
    id: 'facturacion-pyme',
    name: 'DesignSoft Facturación Electrónica Cloud',
    category: 'Facturación & ERP',
    description: 'Plataforma web y móvil para emisión automática de facturas, tiquetes electrónicas, notas de crédito y notas de débito válidas por el Ministerio de Hacienda.',
    priceMonthlyCRC: 15000,
    priceMonthlyUSD: 30,
    features: [
      'Emisión ilimitada de comprobantes electrónicos',
      'Aceptación automática de XML de compras',
      'Envío automático por correo a clientes y WhatsApp',
      'Firma digital centralizada'
    ]
  },
  {
    id: 'sistema-medico',
    name: 'DesignSoft Médica - Expediente Electrónico',
    category: 'Salud & Clinicas',
    description: 'Expediente clínico digital para médicos, odontólogos y clínicas en Costa Rica con agenda interactiva y recetas.',
    priceMonthlyCRC: 45000,
    priceMonthlyUSD: 90,
    features: [
      'Expediente de salud acorde a normas del Colegio de Médicos',
      'Recordatorio automático de citas por WhatsApp',
      'Facturación médica de honorarios e insumos',
      'Historial de diagnósticos e imágenes'
    ]
  }
];

// Functions for Gemini Function Calling
export const catalogFunctionDeclaration: FunctionDeclaration = {
  name: "consultarCatalogoPOS",
  description: "Consulta el catálogo oficial de productos y módulos de DesignSoft en Costa Rica (POS Restaurantes, Facturación Pyme, Sistema Médico).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      categoria: {
        type: Type.STRING,
        description: "Filtro opcional por categoría: 'Puntos de Venta', 'Facturación & ERP', 'Salud & Clinicas' o vacio para todo el catálogo."
      }
    }
  }
};

export const quoteFunctionDeclaration: FunctionDeclaration = {
  name: "crearCotizacionCRM",
  description: "Genera una cotización formal en el CRM de DesignSoft para un cliente interesado en Costa Rica.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      nombreCliente: { type: Type.STRING, description: "Nombre completo o empresa del cliente." },
      telefonoWhatsApp: { type: Type.STRING, description: "Número de teléfono/WhatsApp del cliente en Costa Rica." },
      productoId: { type: Type.STRING, description: "Identificador del producto (pos-restaurantes, facturacion-pyme, sistema-medico)." },
      numUsuarios: { type: Type.NUMBER, description: "Número de usuarios o terminales adicionales requeridas." }
    },
    required: ["nombreCliente", "telefonoWhatsApp", "productoId"]
  }
};

export const ticketFunctionDeclaration: FunctionDeclaration = {
  name: "consultarTicketSoporte",
  description: "Consulta el estado actual de un ticket de soporte técnico o consulta sobre facturación tributaria.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      numeroTicket: { type: Type.STRING, description: "Código o número de ticket de soporte del cliente (ej. DS-8041)." }
    },
    required: ["numeroTicket"]
  }
};

export const escalationFunctionDeclaration: FunctionDeclaration = {
  name: "escalarAHumano",
  description: "Escala la llamada o chat con un ejecutivo humano especialista de DesignSoft cuando la consulta es compleja o el cliente lo solicita explícitamente.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      motivo: { type: Type.STRING, description: "Motivo detallado del traspaso a ejecutivo humano." },
      departamento: { type: Type.STRING, description: "Departamento sugerido: 'Ventas', 'Soporte Tecnico', 'Facturacion' o 'Cobros'." }
    },
    required: ["motivo"]
  }
};

export const ALL_DESIGNSOFT_TOOLS = [
  catalogFunctionDeclaration,
  quoteFunctionDeclaration,
  ticketFunctionDeclaration,
  escalationFunctionDeclaration
];

// Helper execution functions
export function executeConsultarCatalogo(args: { categoria?: string }) {
  if (!args.categoria) return { productos: DESIGNSOFT_CATALOG };
  const filtered = DESIGNSOFT_CATALOG.filter(p => p.category.toLowerCase().includes(args.categoria!.toLowerCase()));
  return { productos: filtered.length > 0 ? filtered : DESIGNSOFT_CATALOG };
}

export function executeCrearCotizacion(args: { nombreCliente: string; telefonoWhatsApp: string; productoId: string; numUsuarios?: number }) {
  const product = DESIGNSOFT_CATALOG.find(p => p.id === args.productoId) || DESIGNSOFT_CATALOG[0];
  const totalUsuarios = args.numUsuarios || 1;
  const precioBaseCRC = product.priceMonthlyCRC;
  const precioTotalCRC = precioBaseCRC + (totalUsuarios > 1 ? (totalUsuarios - 1) * 5000 : 0);

  const cotizacionId = `COT-DS-${Math.floor(10000 + Math.random() * 90000)}`;
  return {
    cotizacionId,
    cliente: args.nombreCliente,
    telefono: args.telefonoWhatsApp,
    producto: product.name,
    precioMensualCRC: `₡${precioTotalCRC.toLocaleString('es-CR')}`,
    precioMensualUSD: `$${Math.round(precioTotalCRC / 500)} USD`,
    incluye: [
      'Soporte Técnico 24/7 en Costa Rica',
      'Configuración inicial e impuestos Hacienda incluidos',
      'Capacitación virtual para personal'
    ],
    mensajeConfirmacion: `Cotización ${cotizacionId} registrada con éxito en CRM DesignSoft. Se ha preparado la ficha técnica para envío por WhatsApp.`
  };
}

export function executeConsultarTicket(args: { numeroTicket: string }) {
  return {
    ticket: args.numeroTicket,
    estado: 'En Atención por Soporte Técnico Nivel 2',
    prioridad: 'Alta',
    tecnicoAsignado: 'Ing. Carlos Brenes (DesignSoft San José)',
    ultimoComentario: 'Verificando la llave criptográfica con el portal ATV de Hacienda Costa Rica. El servicio estará normalizado en menos de 15 minutos.',
    tiempoEstimadoResolucion: '15 minutos'
  };
}

export function executeEscalarAHumano(args: { motivo: string; departamento?: string }) {
  return {
    status: 'traspaso_exitoso',
    departamento: args.departamento || 'Atención General',
    extensionSIP: '201 - Ventas & Soporte Costa Rica',
    motivo: args.motivo,
    mensaje: 'Transferencia realizada. En unos segundos un ejecutivo de DesignSoft continuará la llamada/chat.'
  };
}
