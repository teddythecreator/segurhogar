import { useParams } from 'react-router-dom';
import { ProductForm } from '@/components/panel/products/ProductForm';

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>ID de producto no proporcionado</div>;
  }

  return <ProductForm productId={id} />;
}
