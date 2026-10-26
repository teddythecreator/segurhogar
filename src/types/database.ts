// ============================================================================
// Tipos TypeScript generados a partir del esquema de Supabase
// ============================================================================
// Estos tipos reflejan la estructura de las tablas de la base de datos.
// Se actualizarán cuando cambie el esquema SQL.
// ============================================================================

// --------------------------------------------------------------------------
// ENUMS
// --------------------------------------------------------------------------

export type UserRole = 'admin' | 'gestor' | 'instalador' | 'cliente';

export type CustomerType = 'familia' | 'mayor' | 'negocio';

export type ProductType = 'dropshipping' | 'afiliado' | 'servicio' | 'pack';

export type ProductStatus = 'borrador' | 'publicado';

export type RecommendedProfile = 'familia' | 'mayor' | 'negocio' | 'todos';

export type OrderStatus =
  | 'pendiente_pago'
  | 'pagado'
  | 'enviado_proveedor'
  | 'en_transito'
  | 'entregado'
  | 'incidencia'
  | 'devuelto'
  | 'cancelado';

export type InstallationStatus =
  | 'solicitada'
  | 'confirmada'
  | 'asignada'
  | 'realizada'
  | 'cerrada'
  | 'cancelada';

export type QuoteStatus = 'borrador' | 'enviado' | 'aceptado' | 'rechazado';

// --------------------------------------------------------------------------
// TABLAS
// --------------------------------------------------------------------------

export interface Profile {
  id: string; // UUID vinculado a auth.users
  email: string;
  nombre: string;
  telefono: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  tipo: CustomerType;
  nombre: string;
  nif_cif: string | null;
  email: string | null;
  telefono: string | null;
  direccion_calle: string | null;
  direccion_codigo_postal: string | null;
  direccion_ciudad: string | null;
  direccion_provincia: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen_url: string | null;
  parent_id: string | null;
  orden: number;
  created_at: string;
  updated_at: string;
  // Relaciones (opcionales, se cargan con queries)
  parent?: Category | null;
  children?: Category[];
}

export interface Product {
  id: string;
  tipo: ProductType;
  nombre: string;
  slug: string;
  descripcion_corta: string | null;
  descripcion_completa: string | null;
  especificaciones: Record<string, unknown>; // jsonb
  precio: number;
  precio_coste: number;
  precio_rebajado: number | null;
  estado: ProductStatus;
  categoria_id: string | null;
  perfiles_recomendados: RecommendedProfile[];
  url_afiliado: string | null;
  tienda_afiliado: string | null;
  id_aliexpress: string | null;
  plazo_entrega_dias: number | null;
  stock: number;
  duracion_instalacion_min: number | null;
  activo: boolean;
  // AliExpress
  aliexpress_product_id: string | null;
  aliexpress_last_price: number | null;
  aliexpress_last_sync: string | null;
  margin_alert_sent: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  categoria?: Category | null;
  imagenes?: ProductImage[];
  pack_items?: PackItem[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  orden: number;
  alt: string | null;
  created_at: string;
}

export interface PackItem {
  id: string;
  pack_id: string;
  product_id: string;
  cantidad: number;
  created_at: string;
  // Relación
  product?: Product;
}

export interface Order {
  id: string;
  numero: string;
  customer_id: string | null;
  user_id: string | null;
  estado: OrderStatus;
  // Totales
  subtotal: number;
  iva: number;
  total: number;
  tipo_iva: number;
  // Envío
  envio_nombre: string | null;
  envio_telefono: string | null;
  envio_calle: string | null;
  envio_codigo_postal: string | null;
  envio_ciudad: string | null;
  envio_provincia: string | null;
  // Facturación
  factura_nombre: string | null;
  factura_nif: string | null;
  factura_calle: string | null;
  factura_codigo_postal: string | null;
  factura_ciudad: string | null;
  factura_provincia: string | null;
  // Pagos
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  pagado_en: string | null;
  // Notas
  notas_cliente: string | null;
  notas_internas: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  customer?: Customer | null;
  user?: Profile | null;
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
  installation?: Installation | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  nombre_snapshot: string;
  tipo_snapshot: ProductType;
  cantidad: number;
  precio_unitario: number;
  iva_unitario: number;
  created_at: string;
  // Relación
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  estado_anterior: OrderStatus | null;
  estado_nuevo: OrderStatus;
  usuario_id: string | null;
  notas: string | null;
  created_at: string;
  // Relación
  usuario?: Profile | null;
}

export interface Installation {
  id: string;
  order_id: string | null;
  customer_id: string;
  instalador_id: string | null;
  estado: InstallationStatus;
  fecha: string; // date
  hora_inicio: string | null; // time
  hora_fin: string | null; // time
  // Dirección
  direccion_calle: string;
  direccion_codigo_postal: string;
  direccion_ciudad: string;
  direccion_provincia: string | null;
  // Detalles
  checklist: InstallationChecklistItem[]; // jsonb
  firma_url: string | null;
  notas: string | null;
  notas_instalador: string | null;
  fecha_llegada: string | null;
  fecha_realizacion: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  order?: Order | null;
  customer?: Customer;
  instalador?: Profile | null;
  photos?: InstallationPhoto[];
}

export interface InstallationChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface InstallationPhoto {
  id: string;
  installation_id: string;
  url: string;
  descripcion: string | null;
  orden: number;
  created_at: string;
}

export interface Quote {
  id: string;
  numero: string;
  customer_id: string;
  user_id: string | null;
  estado: QuoteStatus;
  subtotal: number;
  iva: number;
  total: number;
  notas: string | null;
  valido_hasta: string | null; // date
  created_at: string;
  updated_at: string;
  // Relaciones
  customer?: Customer;
  user?: Profile | null;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  iva: number;
  created_at: string;
  // Relación
  product?: Product | null;
}

export interface AffiliateClick {
  id: string;
  product_id: string;
  ip_address: string | null;
  user_agent: string | null;
  referer: string | null;
  created_at: string;
}

export interface ServiceZone {
  id: string;
  codigo_postal: string;
  ciudad: string | null;
  provincia: string | null;
  activo: boolean;
  created_at: string;
}

// --------------------------------------------------------------------------
// TIPOS AUXILIARES PARA INSERTS/UPDATES (campos opcionales)
// --------------------------------------------------------------------------

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type CustomerInsert = Omit<Customer, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type ProductInsert = Omit<Product, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type OrderInsert = Omit<Order, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type InstallationInsert = Omit<Installation, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type QuoteInsert = Omit<Quote, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

// --------------------------------------------------------------------------
// LABELS (para mostrar en la UI)
// --------------------------------------------------------------------------

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Pagado',
  enviado_proveedor: 'Enviado a proveedor',
  en_transito: 'En tránsito',
  entregado: 'Entregado',
  incidencia: 'Incidencia',
  devuelto: 'Devuelto',
  cancelado: 'Cancelado',
};

export const INSTALLATION_STATUS_LABELS: Record<InstallationStatus, string> = {
  solicitada: 'Solicitada',
  confirmada: 'Confirmada',
  asignada: 'Asignada',
  realizada: 'Realizada',
  cerrada: 'Cerrada',
  cancelada: 'Cancelada',
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  dropshipping: 'Dropshipping',
  afiliado: 'Afiliado',
  servicio: 'Servicio',
  pack: 'Pack',
};

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  familia: 'Familia',
  mayor: 'Persona mayor',
  negocio: 'Negocio',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  gestor: 'Gestor de pedidos',
  instalador: 'Instalador',
  cliente: 'Cliente',
};
