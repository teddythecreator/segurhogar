import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/database';

export interface CartItem {
  producto: Product;
  cantidad: number;
}

export interface InstallationData {
  direccion: {
    nombre: string;
    telefono: string;
    calle: string;
    codigo_postal: string;
    ciudad: string;
    provincia: string;
  };
  fechas_preferidas: string[]; // Array de fechas en formato ISO
}

interface CartState {
  items: CartItem[];
  installationData: InstallationData | null;
  
  // Acciones de productos
  addItem: (product: Product, quantity?: number) => { success: boolean; error?: string };
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Acciones de instalación
  setInstallationData: (data: InstallationData) => void;
  clearInstallationData: () => void;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  hasInstallation: () => boolean;
  hasAffiliateProducts: () => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      installationData: null,

      // Añadir producto (validar que no sea afiliado)
      addItem: (product, quantity = 1) => {
        // Validar que no sea producto afiliado
        if (product.tipo === 'afiliado') {
          return { 
            success: false, 
            error: 'Los productos de afiliado no se pueden añadir al carrito. Haz clic en "Ver en tienda" para comprarlos directamente.' 
          };
        }

        set((state) => {
          const existing = state.items.find((item) => item.producto.id === product.id);
          
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.producto.id === product.id
                  ? { ...item, cantidad: item.cantidad + quantity }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { producto: product, cantidad: quantity }],
          };
        });

        return { success: true };
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.producto.id !== productId),
        }));

        // Si no hay productos que requieran instalación, limpiar datos de instalación
        const { items, hasInstallation } = get();
        if (!hasInstallation()) {
          set({ installationData: null });
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.producto.id === productId ? { ...item, cantidad: quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], installationData: null });
      },

      setInstallationData: (data) => {
        set({ installationData: data });
      },

      clearInstallationData: () => {
        set({ installationData: null });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.producto.precio_rebajado ?? item.producto.precio;
          return total + price * item.cantidad;
        }, 0);
      },

      hasInstallation: () => {
        return get().items.some(
          (item) => item.producto.tipo === 'servicio' || item.producto.tipo === 'pack'
        );
      },

      hasAffiliateProducts: () => {
        return get().items.some((item) => item.producto.tipo === 'afiliado');
      },
    }),
    {
      name: 'segurhogar-cart',
      partialize: (state) => ({ 
        items: state.items,
        installationData: state.installationData 
      }),
    }
  )
);
