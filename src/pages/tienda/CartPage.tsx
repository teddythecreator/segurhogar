import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/stores/cart-store';
import { useCheckServiceZone } from '@/hooks/useServiceZones';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/types/database';

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const installationData = useCartStore((s) => s.installationData);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const hasInstallation = useCartStore((s) => s.hasInstallation);
  const setInstallationData = useCartStore((s) => s.setInstallationData);

  const [showInstallationForm, setShowInstallationForm] = useState(false);
  const [fecha1, setFecha1] = useState('');
  const [fecha2, setFecha2] = useState('');
  const [fecha3, setFecha3] = useState('');

  const checkZone = useCheckServiceZone();

  // Formulario de dirección de instalación
  const [direccionInstalacion, setDireccionInstalacion] = useState({
    nombre: installationData?.direccion.nombre || '',
    telefono: installationData?.direccion.telefono || '',
    calle: installationData?.direccion.calle || '',
    codigo_postal: installationData?.direccion.codigo_postal || '',
    ciudad: installationData?.direccion.ciudad || '',
    provincia: installationData?.direccion.provincia || '',
  });

  const handleVerifyPostalCode = () => {
    if (direccionInstalacion.codigo_postal.length === 5) {
      checkZone.mutate(direccionInstalacion.codigo_postal);
    }
  };

  const handleSaveInstallationData = () => {
    const fechas = [fecha1, fecha2, fecha3].filter((f) => f);
    
    if (fechas.length < 2) {
      alert('Por favor, selecciona al menos 2 fechas preferidas');
      return;
    }

    setInstallationData({
      direccion: direccionInstalacion,
      fechas_preferidas: fechas,
    });

    setShowInstallationForm(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Añade productos para empezar</p>
        <Link to="/catalogo">
          <Button>Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#0B1F3A] mb-6">Carrito de compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.producto.precio_rebajado ?? item.producto.precio;
            return (
              <Card key={item.producto.id}>
                <CardContent className="p-4 flex gap-4">
                  {/* Imagen mini */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-3xl">📦</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${item.producto.slug}`}
                      className="font-medium text-[#0B1F3A] hover:text-[#2D7FF9] text-sm"
                    >
                      {item.producto.nombre}
                    </Link>
                    <Badge variant="info" className="mt-1">
                      {PRODUCT_TYPE_LABELS[item.producto.tipo]}
                    </Badge>
                    <p className="font-bold text-[#0B1F3A] mt-2">{formatPrice(price)}</p>
                  </div>

                  {/* Cantidad */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="text-right">
                    <p className="font-bold text-[#0B1F3A]">{formatPrice(price * item.cantidad)}</p>
                    <button
                      onClick={() => removeItem(item.producto.id)}
                      className="mt-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Sección de instalación */}
          {hasInstallation() && (
            <Card className="border-2 border-[#2D7FF9]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#2D7FF9]" />
                  <h2 className="font-semibold text-[#0B1F3A]">Datos de instalación</h2>
                </div>
              </CardHeader>
              <CardContent>
                {installationData ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dirección:</p>
                      <p className="text-sm text-gray-600">
                        {installationData.direccion.calle}, {installationData.direccion.codigo_postal}{' '}
                        {installationData.direccion.ciudad}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fechas preferidas:</p>
                      <ul className="text-sm text-gray-600">
                        {installationData.fechas_preferidas.map((fecha, i) => (
                          <li key={i}>
                            {new Date(fecha).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInstallationForm(true)}
                    >
                      Modificar datos
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Tu carrito incluye servicios de instalación. Por favor, indica la dirección y tus fechas preferidas.
                    </p>
                    <Button onClick={() => setShowInstallationForm(true)}>
                      Introducir datos de instalación
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Formulario de instalación */}
          {showInstallationForm && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[#0B1F3A]">Dirección de instalación</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nombre completo"
                    value={direccionInstalacion.nombre}
                    onChange={(e) =>
                      setDireccionInstalacion({ ...direccionInstalacion, nombre: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={direccionInstalacion.telefono}
                    onChange={(e) =>
                      setDireccionInstalacion({ ...direccionInstalacion, telefono: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  label="Dirección completa"
                  value={direccionInstalacion.calle}
                  onChange={(e) =>
                    setDireccionInstalacion({ ...direccionInstalacion, calle: e.target.value })
                  }
                  placeholder="Calle, número, piso, puerta..."
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Código postal"
                    value={direccionInstalacion.codigo_postal}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setDireccionInstalacion({ ...direccionInstalacion, codigo_postal: value });
                    }}
                    onBlur={handleVerifyPostalCode}
                    maxLength={5}
                    required
                  />
                  <Input
                    label="Ciudad"
                    value={direccionInstalacion.ciudad}
                    onChange={(e) =>
                      setDireccionInstalacion({ ...direccionInstalacion, ciudad: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Provincia"
                    value={direccionInstalacion.provincia}
                    onChange={(e) =>
                      setDireccionInstalacion({ ...direccionInstalacion, provincia: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Resultado de verificación de zona */}
                {checkZone.data && (
                  <div
                    className={`p-3 rounded-lg ${
                      checkZone.data.disponible ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {checkZone.data.disponible ? (
                      <p className="text-sm text-green-800">
                        ✓ Instalamos en tu zona
                        {checkZone.data.zona?.ciudad && ` (${checkZone.data.zona.ciudad})`}
                      </p>
                    ) : (
                      <p className="text-sm text-red-800">
                        ✗ No instalamos en tu zona. Contacta con nosotros para más información.
                      </p>
                    )}
                  </div>
                )}

                {/* Fechas preferidas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fechas preferidas para la instalación (mínimo 2)
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={fecha1}
                      onChange={(e) => setFecha1(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      type="date"
                      value={fecha2}
                      onChange={(e) => setFecha2(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      type="date"
                      value={fecha3}
                      onChange={(e) => setFecha3(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveInstallationData}>Guardar datos</Button>
                  <Button variant="outline" onClick={() => setShowInstallationForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumen del pedido */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <h2 className="font-semibold text-[#0B1F3A]">Resumen del pedido</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const price = item.producto.precio_rebajado ?? item.producto.precio;
                return (
                  <div key={item.producto.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.producto.nombre} × {item.cantidad}
                    </span>
                    <span className="font-medium shrink-0">{formatPrice(price * item.cantidad)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-[#0B1F3A]">{formatPrice(getTotalPrice())}</span>
              </div>
              <p className="text-xs text-gray-500">IVA incluido</p>

              {/* Advertencia si falta datos de instalación */}
              {hasInstallation() && !installationData && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    Debes introducir los datos de instalación antes de continuar
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => navigate('/checkout')}
                disabled={hasInstallation() && !installationData}
              >
                Finalizar compra
              </Button>

              <Link to="/catalogo" className="block">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Seguir comprando
                </Button>
              </Link>

              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 w-full text-center"
              >
                Vaciar carrito
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
