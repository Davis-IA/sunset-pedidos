# CLAUDE.md — Sunset Pedidos

Guía de referencia para Claude Code al trabajar en este repositorio.

## Resumen del proyecto

**Sunset Pedidos** — app de pedidos mobile-first para el restaurante **Sunset Sabor Casero** (Santa Tecla, El Salvador).  
El cliente accede vía link de WhatsApp con parámetros URL, elige su comida y el pedido se envía de vuelta por WhatsApp.

- **Stack:** React 18 · Vite 5 · Tailwind CSS 3 · 100% client-side, sin backend
- **Repo:** https://github.com/Davis-IA/sunset-pedidos
- **Deploy:** Vercel (conectar repo en vercel.com; `vercel.json` ya incluido)
- **Dev local:** `npm run dev` → `http://localhost:5173/?tel=76543210&nombre=Davis`

---

## Arquitectura general

```
App.jsx
 ├─ useMenu()            → JSONP a Google Sheets, expone: dishes, menuImage, refrescoDescripcion
 ├─ UserForm             → validación de nombre + teléfono, guard de entrada
 ├─ MenuScreen           → banner, grid de platos, sección de bebidas
 │    ├─ DishCard        → contador −/n/+ por plato
 │    ├─ AddDishModal    → selectores dinámicos por descripción del plato
 │    ├─ FloatingCart    → barra flotante con subtotal
 │    └─ DecoBackground  → SVG decorativo de fondo
 ├─ OrderSummary         → resumen editable, botón confirmar/adición/modificación
 └─ OrderConfirmation    → pantalla post-envío con ID de pedido y acciones
```

**Navegación:** state-based (`'menu'` / `'order'` / `'confirmation'`), sin react-router.  
**Cart state:** vive en `App.jsx` y se pasa como props; no hay Context.

---

## Google Sheets — Fuente de datos

| Parámetro | Valor |
|---|---|
| SHEET_ID | `1uYtZgLVeupcD-W9mN0RITjQ5OpM1KZ51jWJs51SVO8Q` |
| Sheet name | `Menu_Diario` |
| Rango | `A7:H` |

### Columnas esperadas (fila 7 en adelante)

| Col | Contenido |
|---|---|
| A | Nombre del plato/bebida |
| B | Precio (ej: `$3.50` — el `$` se limpia con `.replace(/^\$/, '')`) |
| C | Descripción |
| E | URL de imagen del banner (solo fila 7) |
| F | Cantidad disponible (numérico) |

### ⚠️ CORS — usar JSONP obligatoriamente

El endpoint `gviz/tq` de Google Sheets **no envía headers CORS**. `fetch()` falla siempre.  
La solución es JSONP via `<script>` dinámico con `?tqx=responseHandler:cbName`.  
Ver `src/hooks/useMenu.js` → `fetchSheetJSONP()`.  
**El spreadsheet DEBE estar en "Cualquiera con el enlace → Lector".**

### Filtro de bebidas

Las filas que contengan `refresco`, `pepsi`, `coca`, `cola`, `bebida`, `gaseosa` en el nombre se **excluyen del grid de platos**.  
El `refrescoDescripcion` (col C de la fila refresco) se usa para construir el nombre dinámico:  
`"Bebida de horchata"` → `"Refresco de horchata"` (se elimina el prefijo `"Bebida de "` con regex).

---

## Componentes clave

### `UserForm.jsx`
Validación de teléfono en dos opciones:
- **Opción A (SV):** `/^[67]\d{7}$/` sobre los dígitos limpios (acepta guion `7654-3210`)
- **Opción B (Internacional):** input puramente numérico + longitud ≥ 10

Reglas adicionales (bloquean ambas opciones):
1. No inicia con `"00"`
2. No todos los dígitos iguales (`/^(\d)\1+$/`)
3. No secuencia pura ascendente o descendente
4. No patrón de par repetido (ej: `58585858`)

Botón deshabilitado hasta que nombre ≥ 2 chars Y teléfono válido.  
Al submit, el teléfono se guarda solo con dígitos (`digitsOnly()`).

### `useMenu.js`
- Llama `fetchSheetJSONP()` → devuelve `{ dishes, menuImage, loading, error, refrescoDescripcion }`
- `dishes` excluye filas de bebidas y filas con cantidad ≤ 0
- `menuImage` = URL de col E en fila 7 (primera fila de datos)

### `MenuScreen.jsx`
- **Banner:** `height: 215px`, `objectPosition: 'top center'`, gradiente overlay:  
  `transparent 78% → rgba(255,255,255,0.6) 86% → white 94%`  
  *(ajustar si el menú del día tiene texto en proporciones distintas)*
- **Grid platos:** `grid-cols-2 items-stretch`, cards con `flex-col justify-between`
- **Sección bebidas:** `grid-cols-3`, cada card `h-[110px]`, nombre en `h-[32px]`
- Recibe `onUpdateDrink` y `refrescoName` desde `App.jsx` para gestionar bebidas desde el menú

### `DishCard.jsx`
- `dishQty > 0` → muestra `− n +` (contador); `0` → muestra `+ Agregar`  
- `+` abre el modal de nuevo (permite agregar misma dish con diferente configuración)
- `−` llama `onRemoveOne` → elimina el último cart item de ese `dishId`
- Ring naranja cuando `dishQty > 0`
- Hover desktop: `shadow-lg + scale(1.02)`

### `AddDishModal.jsx` — `detectOptions(dish)`

Determina qué selectores mostrar leyendo `dish.name` y `dish.description`:

| Condición | Resultado |
|---|---|
| Nombre contiene `"sopa"` | Solo `✓ Incluye 2 tortillas` |
| Descripción contiene `"sin acompañamientos"` | Solo `✓ Incluye 2 tortillas` |
| Descripción menciona `"arroz"` o `"casamiento"` | Selector **[Arroz / Casamiento]** completo |
| Descripción menciona `"ensalada"`, `"chimol"`, `"coditos"` o `"vegetales"` | Selector **[Ensalada fresca / Chimol]** completo |
| Descripción menciona `"tortilla"` + sin selectores | `✓ Incluye 2 tortillas` |
| Nada de lo anterior | Solo selector de cantidad |

El modal construye `item.details` (ej: `"Arroz + Ensalada fresca + 2 tortillas"`) que se usa en `OrderSummary` y en el mensaje de WhatsApp.

### `OrderSummary.jsx`
- Muestra dishes con botón `×` para eliminar y `item.details` como subtítulo
- Muestra bebidas del cart con `−/n/+` para editar cantidad
- Recibe `orderId`, `submittedCart`, `onOrderSent` desde `App.jsx`
- Detecta automáticamente el tipo de envío para el texto del botón:
  - Primera vez → **"📲 Confirmar pedido por WhatsApp"**
  - Adición (solo ítems nuevos) → **"📲 Enviar adición por WhatsApp"**
  - Modificación (hay ítems eliminados) → **"📲 Enviar modificación por WhatsApp"**
- Al confirmar: abre WhatsApp y llama `onOrderSent()` → App cambia a pantalla `'confirmation'`

### `OrderConfirmation.jsx`
Pantalla post-envío. Se muestra después de confirmar por WhatsApp. **No cierra automáticamente.**

- Ícono ✓ naranja en círculo `bg-[#FFF4E0]`
- Título "¡Pedido enviado!" + subtítulo
- Badge con ID del pedido (ej: `Pedido #1857DM`)
- Resumen de solo lectura de todos los ítems del carrito (dishes + bebidas)
- Total acumulado
- Dos botones:
  - **"+ Agregar algo más"** — vuelve al menú con el carrito intacto
  - **"Hacer otro pedido"** — reset completo (carrito vacío, nuevo ID)
- Botón **"✕ Cerrar ventana"** (`window.close()`, `text-sm`, color `#555555`)

### `formatMessage.js` — `formatWhatsAppMessage(user, cart, subtotal, options)`

`options`:
- `orderId` — string del ID, ej: `"#1857DM"`
- `isAddition` — `true` cuando es un segundo envío del mismo pedido
- `submittedCart` — array completo de items enviados en el batch anterior

**Lógica de detección:**
```js
const removedItems = submittedCart.filter(i => !currentIds.has(i.cartId))
const newItems     = cart.filter(i => !submittedIds.has(i.cartId))
const isModification = isAddition && removedItems.length > 0
```

**Tipos de mensaje:**

| Escenario | Header | Sección |
|---|---|---|
| Primer envío | `🛒 *NUEVO PEDIDO*` | `📋 *Detalle del pedido:*` |
| Solo ítems nuevos | `➕ *ADICIÓN AL PEDIDO #XXXX*` | `📋 *Ítems agregados:*` |
| Hay ítems eliminados | `✏️ *MODIFICACIÓN AL PEDIDO #XXXX*` | `📋 *Cambios al pedido:*` |

Ítems eliminados se muestran con `❌ ELIMINADO:` antes de los nuevos.

**Footer para adiciones/modificaciones:**
```
💵 *Adición (sin envío): $X.XX*         ← solo ítems nuevos
💵 *Total acumulado (sin envío): $Y.YY*  ← subtotal completo del carrito
```

**Ejemplo de mensaje completo (primer pedido):**
```
🛒 *NUEVO PEDIDO - Sunset Sabor Casero*

👤 *Cliente:* Davis
📞 *Teléfono:* 76543210

📋 *Detalle del pedido:*
- 1x Sopa de gallina (2 tortillas) — $5.00
- 1x Gallina asada (Casamiento + Chimol + 2 tortillas) — $6.00
- 1x Pepsi — $1.00

💵 *Subtotal (sin envío): $12.00*

⏰ *Pedido realizado:* 12:30 PM
```

### `DecoBackground.jsx`
SVG decorativo con Spoon, Fork, Chili, Leaf, Onion, Herb, Dot.  
`opacity="0.07"`, `viewBox="0 0 430 1600"`, `pointer-events-none`.

---

## App.jsx — Estado global

```js
const [user, setUser]             = useState(readUrlParams)   // null → muestra UserForm
const [screen, setScreen]         = useState('menu')          // 'menu' | 'order' | 'confirmation'
const [cart, setCart]             = useState([])
const [orderId, setOrderId]       = useState(null)            // ej: "#1857DM"
const [submittedCart, setSubmittedCart] = useState([])        // snapshot del cart en el último envío
```

### `generateOrderId(nombre)`
```js
// Formato: #HHMM + 2 iniciales del nombre
// "Davis Martínez" a las 18:57 → "#1857DM"
const hh = String(now.getHours()).padStart(2, '0')
const mm = String(now.getMinutes()).padStart(2, '0')
const initials = nombre.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
return `#${hh}${mm}${initials}`
```

### Flujo de envíos
1. Cliente confirma → `handleOrderSent()`:
   - Genera `orderId` (si no existe)
   - Guarda snapshot: `setSubmittedCart([...cart])`
   - Cambia pantalla a `'confirmation'`
2. "Agregar algo más" → `handleAddMore()`: `setScreen('menu')` (carrito intacto)
3. Cliente agrega/elimina ítems → va a `OrderSummary` → detecta adición o modificación
4. "Hacer otro pedido" → `handleNewOrder()`: limpia cart, orderId y submittedCart

---

## WhatsApp

- **Número del restaurante:** `50377490453` (El Salvador 503)
- Aparece en: `src/components/OrderSummary.jsx` (constante `WA_NUMBER`) y `src/components/ErrorScreen.jsx`
- Link: `https://wa.me/50377490453?text={encodeURIComponent(message)}`

---

## Tailwind config

```js
colors:     { sunset: '#F5A623' }
animations: slide-up, scale-in, fade-in
```

---

## Cart item — estructura

### Dish
```js
{
  cartId: string,       // unique ID: `${Date.now()}-${Math.random()}`
  type: 'dish',
  dishId: number,       // dish.id del sheet
  name: string,
  price: string,        // ej: "3.50"
  priceNum: number,
  isSopa: boolean,
  acompañamiento: string,
  ensalada: string,
  details: string,      // ej: "Arroz + Ensalada fresca + 2 tortillas"
  quantity: number,
}
```

### Drink
```js
{
  cartId: string,       // `drink-${name}-${Date.now()}` — fijo; cantidad se actualiza in-place
  type: 'drink',
  name: string,         // coincide con la key en DRINK_PRICES de App.jsx
  priceNum: number,
  quantity: number,
}
```

> ⚠️ Los drinks usan un `cartId` fijo por nombre. Si el usuario aumenta la cantidad de una bebida ya enviada, el `cartId` no cambia → no aparece en `newItems` al generar un mensaje de adición. Esto es comportamiento intencional.

---

## Pendientes / posibles mejoras

- [ ] **Vercel deploy:** conectar repo `Davis-IA/sunset-pedidos` en vercel.com y configurar dominio
- [ ] **Banner — robustez:** el gradiente overlay está calibrado para el menú actual; imágenes con proporciones muy distintas pueden necesitar ajuste manual del porcentaje de transparencia
- [ ] **Comentarios de entrega:** opción para que el cliente escriba una nota libre antes de confirmar (dirección, piso, referencias)
- [ ] **Historial de pedidos:** actualmente no se persiste nada entre sesiones
- [ ] **Límite de stock:** `dish.quantity` se lee del sheet pero no se usa para deshabilitar el botón cuando llega a 0
- [ ] **Cambio de cantidad de bebida ya enviada:** si se aumenta una bebida del pedido original al agregar más, ese cambio no se refleja en el mensaje de adición (ver nota en Cart item → Drink)
