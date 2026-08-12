import { FunctionDeclaration, Type } from "@google/genai";

// --- KIRA CORE STANDARD TOOL DECLARATIONS ---

export const consultarNovedadesDeclaration: FunctionDeclaration = {
  name: "consultar_novedades_y_actualizaciones",
  description: "Busca los nuevos productos, módulos, actualizaciones o versiones agregados al sistema de DesignSoft Costa Rica (ej. Facturación Electrónica v4.3 ATV Hacienda, comandas táctiles Android, firmas digitales médicas).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      modulo: {
        type: Type.STRING,
        description: "Módulo o área de interés opcional: 'POS Restaurantes', 'Hacienda', 'Sistema Medico' o 'General'."
      }
    }
  }
};

export const buscarProductoDeclaration: FunctionDeclaration = {
  name: "buscar_producto_o_servicio",
  description: "Consulta el catálogo de software, soluciones y licencias comerciales de DesignSoft con precios oficial en Colones (₡) y Dólares ($ USD).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      busqueda: {
        type: Type.STRING,
        description: "Término de búsqueda o categoría (ej: 'restaurante', 'factura pyme', 'medico', 'comandas')."
      }
    }
  }
};

export const consultarTicketDeclaration: FunctionDeclaration = {
  name: "consultar_ticket_soporte",
  description: "Revisa el estado de un ticket de soporte técnico, consulta de llaves criptográficas ATV o falla reportada por un cliente.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      numeroTicket: {
        type: Type.STRING,
        description: "Código de ticket del cliente de DesignSoft (ej: 'DS-8041', 'DS-9102')."
      }
    },
    required: ["numeroTicket"]
  }
};

export const transferirAHumanoDeclaration: FunctionDeclaration = {
  name: "transferir_a_humano",
  description: "Realiza el traspaso (handoff) inmediato de la conversación de chat o llamada telefónica hacia un ejecutivo especialista humano de DesignSoft.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      motivo: {
        type: Type.STRING,
        description: "Razón detallada de la transferencia al especialista humano."
      },
      departamentoSugerido: {
        type: Type.STRING,
        description: "Departamento de destino: 'Ventas', 'Soporte Tecnico', 'Facturacion' o 'Cobros'."
      }
    },
    required: ["motivo"]
  }
};

export const KIRA_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  consultarNovedadesDeclaration,
  buscarProductoDeclaration,
  consultarTicketDeclaration,
  transferirAHumanoDeclaration
];

// --- TOOL EXECUTORS (KIRA CORE TOOL REGISTRY EXECUTION) ---

export class ToolRegistry {
  public static async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "consultar_novedades_y_actualizaciones":
        return this.executeConsultarNovedades(args);
      case "buscar_producto_o_servicio":
        return this.executeBuscarProducto(args);
      case "consultar_ticket_soporte":
        return this.executeConsultarTicket(args);
      case "transferir_a_humano":
        return this.executeTransferirAHumano(args);
      default:
        throw new Error(`Herramienta no registrada en Kira ToolRegistry: ${name}`);
    }
  }

  private static executeConsultarNovedades(args: { modulo?: string }) {
    return {
      actualizaciones: [
        {
          fecha: '2026-08-01',
          version: 'POS Restaurantes v5.2',
          novedades: 'Soporte para comandas táctiles desde teléfonos Android y sincronización directa con impresoras térmicas Bluetooth.'
        },
        {
          fecha: '2026-07-15',
          version: 'Hacienda ATV Costa Rica v4.3',
          novedades: 'Renovación automática de llaves criptográficas y validación previa de XML de compras tributarias.'
        },
        {
          fecha: '2026-06-20',
          version: 'DesignSoft Médica Cloud',
          novedades: 'Integración de firma digital avanzada para recetas médicas y recordatorios de citas automatizados por WhatsApp.'
        }
      ]
    };
  }

  private static executeBuscarProducto(args: { busqueda?: string }) {
    const catalog = [
      {
        id: 'pos-restaurantes',
        nombre: 'DesignSoft POS Restaurantes & Bares',
        categoria: 'Puntos de Venta',
        precioMensualCRC: '₡35,000 IVI',
        precioMensualUSD: '$70 USD',
        caracteristicas: [
          'Comandas táctiles para meseros',
          'Control de insumos y recetas por gramos',
          'Facturación Electrónica Hacienda ATV v4.3',
          'Arqueos y Cierre Z en tiempo real'
        ]
      },
      {
        id: 'facturacion-pyme',
        nombre: 'DesignSoft Facturación Electrónica Cloud',
        categoria: 'Facturación & ERP',
        precioMensualCRC: '₡15,000 IVI',
        precioMensualUSD: '$30 USD',
        caracteristicas: [
          'Emisión ilimitada de comprobantes',
          'Aceptación automática de XML',
          'Envío directo a correo y WhatsApp del cliente'
        ]
      },
      {
        id: 'sistema-medico',
        nombre: 'DesignSoft Médica - Expediente Clínico',
        categoria: 'Salud & Clínicas',
        precioMensualCRC: '₡45,000 IVI',
        precioMensualUSD: '$90 USD',
        caracteristicas: [
          'Expediente clínico avalado por el Colegio de Médicos de CR',
          'Recetas con firma digital',
          'Agenda interactiva de citas'
        ]
      }
    ];

    if (!args.busqueda) return { resultados: catalog };

    const term = args.busqueda.toLowerCase();
    const filtered = catalog.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.categoria.toLowerCase().includes(term) ||
      p.caracteristicas.some(c => c.toLowerCase().includes(term))
    );

    return { resultados: filtered.length > 0 ? filtered : catalog };
  }

  private static executeConsultarTicket(args: { numeroTicket: string }) {
    return {
      ticket: args.numeroTicket,
      estado: 'En Atención por Soporte Técnico Nivel 2',
      prioridad: 'Alta',
      tecnicoAsignado: 'Ing. Carlos Brenes (Soporte DesignSoft San José)',
      ultimoComentario: 'Verificando firma criptográfica con el servidor de Hacienda ATV. El servicio estará normalizado en menos de 15 minutos.',
      tiempoEstimadoResolucion: '15 minutos'
    };
  }

  private static executeTransferirAHumano(args: { motivo: string; departamentoSugerido?: string }) {
    return {
      status: 'transferencia_exitosa',
      departamento: args.departamentoSugerido || 'Atención General',
      extensionSIP: 'Ext. 201 (PBX DesignSoft Costa Rica)',
      motivo: args.motivo,
      mensaje: 'Traspaso nativo realizado. En unos segundos un especialista humano atenderá la llamada/chat.'
    };
  }
}
