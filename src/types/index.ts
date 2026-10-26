// Tipos principales de la aplicación SegurHogar

export type Role = 'admin' | 'gestor_pedidos' | 'instalador';

export type ProductType = 'dropshipping' | 'afiliado' | 'instalacion' | 'pack';

export type ProductCategory =
  | 'camaras'
  | 'alarmas'
  | 'cerraduras'
  | 'detectores'
  | 'routers'
  | 'vpn'
  | 'antivirus'
  | 'llaves_seguridad'
  | 'packs';

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  descripcion_corta: string;
  precio: number;
  precio_rebajado?: number;
  tipo: ProductType;
  categoria: ProductCategory;
  imagen_url: string;
  imagenes_urls: string[];
  stock: number;
  activo: boolean;
  // Para afiliado
  url_afiliado?: string;
  nombre_tienda_afiliado?: string;
  // Para instalación
  duracion_instalacion_min?: number;
  // Para packs
  productos_incluidos?: string[];
  // AliExpress para dropshipping
  url_aliexpress?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface CartItem {
  producto: Product;
  cantidad: number;
}

export interface Order {
  id: string;
  usuario_id: string;
  estado: OrderStatus;
  items: OrderItem[];
  total: number;
  direccion_envio?: Direccion;
  fecha_instalacion?: string;
  direccion_instalacion?: Direccion;
  notas?: string;
  creado_en: string;
  actualizado_en: string;
}

export type OrderStatus =
  | 'pendiente_pago'
  | 'pagado'
  | 'en_preparacion'
  | 'enviado'
  | 'instalacion_programada'
  | 'instalacion_completada'
  | 'completado'
  | 'cancelado';

export interface OrderItem {
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  tipo: ProductType;
}

export interface Direccion {
  nombre_completo: string;
  telefono: string;
  calle: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  notas?: string;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  role: Role;
  avatar_url?: string;
  creado_en: string;
}

export interface InstallationSlot {
  id: string;
  instalador_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
  order_id?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AiAssistantConfig {
  id: string;
  nombre: string;
  descripcion: string;
  system_prompt: string;
  icono: string;
}
