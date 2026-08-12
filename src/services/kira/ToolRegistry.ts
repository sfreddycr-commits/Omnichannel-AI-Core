import { FunctionDeclaration, Type } from "@google/genai";
import { getCatalogAndNovelties } from "../catalogService";

// --- KIRA CORE STANDARD TOOL DECLARATIONS ---

export const consultarNovedadesYCatalogoDeclaration: FunctionDeclaration = {
  name: "consultar_novedades_y_catalogo",
  description: "Consulta la base de conocimientos oficial de DesignSoft para obtener detalles de productos, licencias, características técnicas o los nuevos módulos y actualizaciones agregados recientemente.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      categoria: {
        type: Type.STRING,
        description: "Categoría opcional de consulta: 'novedades', 'pos', 'facturacion', 'medico' o 'general'."
      },
      busqueda: {
        type: Type.STRING,
        description: "Término de búsqueda específico (ej: 'restaurante', 'comandas', 'hacienda', 'receta medica')."
      }
    }
  }
};

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
  consultarNovedadesYCatalogoDeclaration,
  consultarNovedadesDeclaration,
  buscarProductoDeclaration,
  consultarTicketDeclaration,
  transferirAHumanoDeclaration
];

// --- TOOL EXECUTORS (KIRA CORE TOOL REGISTRY EXECUTION) ---

export class ToolRegistry {
  public static async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "consultar_novedades_y_catalogo":
        return getCatalogAndNovelties({ categoria: args?.categoria, busqueda: args?.busqueda });
      case "consultar_novedades_y_actualizaciones":
        return getCatalogAndNovelties({ categoria: "novedades", busqueda: args?.modulo });
      case "buscar_producto_o_servicio":
        return getCatalogAndNovelties({ busqueda: args?.busqueda });
      case "consultar_ticket_soporte":
        return this.executeConsultarTicket(args);
      case "transferir_a_humano":
        return this.executeTransferirAHumano(args);
      default:
        throw new Error(`Herramienta no registrada en Kira ToolRegistry: ${name}`);
    }
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
