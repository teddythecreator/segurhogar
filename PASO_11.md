# Paso 11: Asistentes de IA con Claude API

## ✅ Implementación completada

### Componentes creados:

#### 1. **Asistente de Tienda (Widget Flotante)**
- **Componente**: `ShopAssistantWidget.tsx`
- **Ubicación**: Flotante en esquina inferior derecha de la tienda pública
- **Funcionalidad**:
  - Chat conversacional con clientes
  - Pregunta sobre tipo de vivienda/negocio, tamaño, personas, presupuesto
  - Recomienda productos REALES del catálogo (consulta BD)
  - Muestra productos con imágenes, precios y enlaces a fichas
  - Verifica código postal para instalación
  - Tono cercano y sencillo
  - **NUNCA inventa productos ni precios**

#### 2. **Asistente del Panel**
- **Componente**: `PanelAssistantChat.tsx`
- **Página**: `/panel/asistente-ia`
- **Acceso**: Admin y gestor
- **Funcionalidad**:
  - Chat para analizar datos del negocio
  - Function calling con herramientas seguras predefinidas
  - Respeta permisos del rol
  - Ejemplos de consultas:
    - "¿Qué pedidos llevan más de 10 días sin entregar?"
    - "Resume las instalaciones de mañana"
    - "¿Cuáles son los productos más vendidos este mes?"

#### 3. **Botón "Generar con IA" (Productos)**
- **Componente**: `GenerateDescriptionButton.tsx`
- **Ubicación**: Formulario de productos (al lado de descripción completa)
- **Funcionalidad**:
  - Genera descripción atractiva basada en nombre y datos
  - Genera especificaciones técnicas
  - Modal con preview antes de aplicar
  - Auto-rellena campos del formulario

#### 4. **Botón "Redactar respuesta" (Pedidos)**
- **Componente**: `GenerateEmailButton.tsx`
- **Ubicación**: Detalle de pedido (sección comunicación)
- **Funcionalidad**:
  - Redacta email profesional según estado del pedido
  - Modal con email generado
  - Botón copiar al portapapeles
  - Opción de regenerar

#### 5. **Control de Límites de Uso**
- **Tabla BD**: `ai_usage` y `ai_usage_limits`
- **Migración**: `011_ai_usage_limits.sql`
- **Funcionalidad**:
  - Registro de cada uso de IA (tokens, coste)
  - Límites mensuales por usuario
  - Verificación en Edge Function antes de cada llamada
  - Bloqueo automático al alcanzar límite

---

## 🤖 Edge Function: ai-assistant

### Configuración:
```bash
# Variables de entorno necesarias en Supabase:
ANTHROPIC_API_KEY=sk-ant-...
```

### Endpoints soportados:

#### 1. `shop-assistant`
- **Prompt del sistema**: Incluye catálogo real de productos
- **Funcionamiento**:
  1. Consulta productos publicados de la BD
  2. Construye prompt con lista de productos reales
  3. Claude responde recomendando solo productos existentes
  4. Extrae productos recomendados del formato especial
  5. Devuelve mensaje + productos con enlaces

#### 2. `panel-assistant`
- **Prompt del sistema**: Incluye rol del usuario y permisos
- **Function calling**: Herramientas predefinidas y seguras
  - `get_delayed_orders`: Pedidos retrasados
  - `get_today_installations`: Instalaciones de hoy
  - `get_tomorrow_installations`: Instalaciones de mañana
  - `get_top_products`: Productos más vendidos
  - `get_sales_summary`: Resumen de ventas
  - `get_pending_orders`: Pedidos pendientes
- **Seguridad**: 
  - NO permite SQL libre
  - Solo herramientas predefinidas
  - Respeta permisos del rol

#### 3. `product-description`
- Genera descripción y especificaciones en formato JSON
- Basado en nombre y datos del producto

#### 4. `email-response`
- Redacta email profesional según estado del pedido
- Tono cercano pero profesional

### Control de límites:
```typescript
// Antes de cada llamada a Claude:
1. Obtener límite mensual del usuario
2. Calcular uso acumulado del mes
3. Si uso >= límite → rechazar solicitud
4. Si uso < límite → permitir y registrar
```

### Registro de uso:
```typescript
// Después de cada llamada exitosa:
await supabase.from('ai_usage').insert({
  user_id: userId,
  endpoint: 'shop-assistant',
  tokens_input: claudeData.usage.input_tokens,
  tokens_output: claudeData.usage.output_tokens,
  cost_usd: totalTokens * COST_PER_TOKEN, // $0.03 por 1K tokens
})
```

---

## 🎨 Hooks personalizados

### `useAiAssistant`
Hook genérico para todas las llamadas a IA:
```typescript
const { sendMessage, isLoading, error } = useAiAssistant();

await sendMessage({
  endpoint: 'shop-assistant',
  messages: [{ role: 'user', content: '...' }],
  context: { ... },
});
```

### `useShopAssistant`
Hook específico para el asistente de tienda:
```typescript
const { askQuestion, isLoading } = useShopAssistant();
const response = await askQuestion('¿Qué cámara me recomiendas?');
```

### `usePanelAssistant`
Hook específico para el asistente del panel:
```typescript
const { askQuestion, isLoading } = usePanelAssistant();
const response = await askQuestion('¿Qué pedidos están retrasados?');
```

### `useGenerateProductDescription`
Hook para generar descripciones de productos:
```typescript
const { generate, isLoading } = useGenerateProductDescription();
const response = await generate('Cámara WiFi 1080p', { tipo: 'dropshipping', precio: 34.99 });
```

### `useGenerateEmailResponse`
Hook para generar emails:
```typescript
const { generate, isLoading } = useGenerateEmailResponse();
const response = await generate('pagado', { numero: 'PED-123', cliente: 'Juan' });
```

---

## 🗄️ Estructura de base de datos

### Tabla `ai_usage`:
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
endpoint TEXT NOT NULL              -- 'shop-assistant', 'panel-assistant', etc.
tokens_input INTEGER NOT NULL
tokens_output INTEGER NOT NULL
cost_usd DECIMAL(10, 6) NOT NULL
created_at TIMESTAMP
```

### Tabla `ai_usage_limits`:
```sql
user_id UUID PRIMARY KEY REFERENCES auth.users
monthly_limit_usd DECIMAL(10, 2)    -- Límite mensual en USD
current_month_start DATE            -- Inicio del período actual
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Límites por defecto sugeridos:
- **Admin**: 50€/mes
- **Gestor**: 20€/mes
- **Instalador**: 10€/mes
- **Cliente**: 5€/mes (solo asistente de tienda)

---

## 🔐 Seguridad

### Asistente de tienda (público):
- ✅ Solo recomienda productos REALES del catálogo
- ✅ No expone datos sensibles
- ✅ Verifica código postal para instalación
- ✅ Límite de uso por IP (opcional, no implementado aún)

### Asistente del panel:
- ✅ Requiere autenticación
- ✅ Respeta permisos del rol
- ✅ Function calling con herramientas seguras
- ✅ NO permite SQL libre
- ✅ Registro de uso por usuario

### Control de costes:
- ✅ Límites mensuales por usuario
- ✅ Registro detallado de tokens y coste
- ✅ Bloqueo automático al alcanzar límite
- ✅ Coste por token configurable

---

## 🧪 Configuración

### 1. Ejecutar migración SQL:
```sql
-- En Supabase SQL Editor
-- Contenido de: supabase/migrations/011_ai_usage_limits.sql
```

### 2. Configurar API Key de Claude:
```bash
# En Supabase → Settings → Secrets
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Desplegar Edge Function:
```bash
supabase functions deploy ai-assistant
```

### 4. Configurar límites de uso:
```sql
-- Ejemplo: Dar 50€/mes al admin
INSERT INTO ai_usage_limits (user_id, monthly_limit_usd)
VALUES ('uuid-del-admin', 50.00);

-- Ejemplo: Dar 20€/mes al gestor
INSERT INTO ai_usage_limits (user_id, monthly_limit_usd)
VALUES ('uuid-del-gestor', 20.00);
```

---

## 🧪 Cómo probar

### 1. Asistente de tienda:
- Ir a la tienda pública (`/`)
- Ver botón flotante en esquina inferior derecha
- Click para abrir chat
- Preguntar: "¿Qué cámara me recomiendas para un piso?"
- Verificar que recomienda productos reales con enlaces
- Preguntar: "¿Instaláis en Madrid?"
- Verificar que responde sobre zonas de servicio

### 2. Asistente del panel:
- Login como admin o gestor
- Ir a `/panel/asistente-ia`
- Preguntar: "¿Qué pedidos llevan más de 10 días sin entregar?"
- Verificar que usa function calling y devuelve datos reales
- Preguntar: "Resume las instalaciones de mañana"
- Verificar que devuelve información correcta

### 3. Generar descripción de producto:
- Ir a `/panel/productos/nuevo`
- Rellenar nombre del producto
- Click en "Generar con IA"
- Ver modal con preview
- Click en "Generar descripción"
- Verificar que rellena descripción y especificaciones

### 4. Redactar email:
- Ir a `/panel/pedidos/:id`
- Click en "Redactar respuesta"
- Ver modal con email generado
- Click en "Copiar al portapapeles"
- Verificar que el email es profesional y apropiado

### 5. Verificar límites de uso:
```sql
-- Ver uso de IA
SELECT 
  p.email,
  SUM(u.cost_usd) as total_cost,
  l.monthly_limit_usd,
  SUM(u.cost_usd) / l.monthly_limit_usd * 100 as percentage_used
FROM ai_usage u
JOIN profiles p ON u.user_id = p.id
JOIN ai_usage_limits l ON u.user_id = l.user_id
WHERE u.created_at >= l.current_month_start
GROUP BY p.email, l.monthly_limit_usd;
```

---

## 📊 Costes estimados

### Claude 3.5 Sonnet:
- **Input**: $3 por millón de tokens
- **Output**: $15 por millón de tokens
- **Coste medio por conversación**: ~$0.01-0.05

### Ejemplos de uso mensual:
- **Asistente de tienda** (100 conversaciones/día): ~$30-150/mes
- **Asistente del panel** (20 consultas/día): ~$6-30/mes
- **Generación de descripciones** (50/mes): ~$0.50-2.50/mes
- **Redacción de emails** (100/mes): ~$1-5/mes

### Recomendación:
- Empezar con límites bajos (5-10€/mes por usuario)
- Monitorizar uso real durante el primer mes
- Ajustar límites según necesidades reales

---

## 🚀 Próximos pasos sugeridos

### Mejoras inmediatas:
- [ ] Añadir streaming de respuestas (mejor UX)
- [ ] Implementar caché de respuestas frecuentes
- [ ] Añadir feedback de usuarios (👍/👎)
- [ ] Dashboard de uso de IA para admin

### Mejoras avanzadas:
- [ ] Fine-tuning del modelo con datos de SegurHogar
- [ ] Integración con base de conocimiento (RAG)
- [ ] Asistente de voz (speech-to-text)
- [ ] Análisis de sentimiento en conversaciones
- [ ] Detección automática de leads calientes

### Optimización de costes:
- [ ] Usar Claude Haiku para tareas simples
- [ ] Implementar caché de embeddings
- [ ] Batch processing para tareas no urgentes
- [ ] Compresión de prompts

---

## 📝 Notas técnicas

### Por qué Edge Functions:
- ✅ API keys seguras (nunca en el frontend)
- ✅ Acceso directo a la BD con service_role_key
- ✅ Escalabilidad automática
- ✅ Latencia baja (ejecución en edge)

### Por qué Claude:
- ✅ Excelente en español
- ✅ Function calling robusto
- ✅ Contexto largo (200K tokens)
- ✅ Precio competitivo
- ✅ Seguridad y privacidad

### Alternativas consideradas:
- **OpenAI GPT-4**: Más caro, menos preciso en español
- **OpenAI GPT-3.5**: Más barato, menos capaz
- **Gemini**: Menos maduro para function calling
- **Modelos open-source**: Requieren infraestructura propia

---

## 🔧 Troubleshooting

### Error: "Has alcanzado el límite mensual"
- **Causa**: Usuario ha superado su límite mensual
- **Solución**: Admin aumenta límite en tabla `ai_usage_limits`

### Error: "Error al procesar la solicitud con IA"
- **Causa**: Problema con API de Claude o Edge Function
- **Solución**: Verificar logs en Supabase → Functions → ai-assistant

### Error: "ANTHROPIC_API_KEY no configurada"
- **Causa**: Falta variable de entorno
- **Solución**: Añadir en Supabase → Settings → Secrets

### Productos no recomendados correctamente:
- **Causa**: Productos no están publicados o activos
- **Solución**: Verificar estado y campo activo en tabla products

---

## 📚 Recursos

- [Documentación de Claude API](https://docs.anthropic.com/claude/reference)
- [Function Calling con Claude](https://docs.anthropic.com/claude/docs/tool-use)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Precios de Claude](https://www.anthropic.com/pricing)

---

**Paso 11 completado**: Sistema completo de asistentes de IA con Claude API, control de límites de uso, function calling seguro y múltiples casos de uso (tienda, panel, generación de contenido).
