import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentState {
  hasConsented: boolean;
  preferences: CookiePreferences;
  bannerVisible: boolean;
  setConsent: (preferences: CookiePreferences) => void;
  showBanner: () => void;
  hideBanner: () => void;
}

export const useCookieConsent = create<CookieConsentState>()(
  persist(
    (set) => ({
      hasConsented: false,
      preferences: {
        necessary: true, // Siempre true, no se puede desactivar
        analytics: false,
        marketing: false,
      },
      bannerVisible: true,

      setConsent: (preferences) =>
        set({
          hasConsented: true,
          preferences,
          bannerVisible: false,
        }),

      showBanner: () => set({ bannerVisible: true }),
      hideBanner: () => set({ bannerVisible: false }),
    }),
    {
      name: 'segurhogar-cookie-consent',
    }
  )
);

// Función para aplicar las preferencias de cookies
export function applyCookiePreferences(preferences: CookiePreferences) {
  // Aquí se integraría con Google Analytics, Facebook Pixel, etc.
  // Ejemplo:
  // if (preferences.analytics) {
  //   loadGoogleAnalytics();
  // } else {
  //   disableGoogleAnalytics();
  // }

  if (preferences.marketing) {
    // Cargar scripts de marketing
    console.log('Marketing cookies enabled');
  }

  if (preferences.analytics) {
    // Cargar scripts de analítica
    console.log('Analytics cookies enabled');
  }
}
