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
 ├─ useMenu()          → JSONP a Google Sheets, expone: dishes, menuImage, refrescoDescripcion
 ├─ UserForm           → validación de nombre + teléfono, guard de entrada
 ├─ MenuScreen         → banner, grid de platos, sección de bebidas
 │    ├─ DishCard      → contador −/n/+ por plato
 │    ├─ AddDishModal  → selectores dinámicos por descripción del plato
 │    ├─ FloatingCart  → barra flotante con subtotal
 │    └─ DecoBackground → SVG decorativo de fondo
 └─ OrderSummary       → resumen editable, botón confirmar por WhatsApp
```

**Navegación:** state-based (`'menu'` / `'order'`), sin react-router.  
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
- Botón confirmar → abre WhatsApp con número `50377490453`

### `formatMessage.js`
Formato del mensaje WhatsApp:
```
🛒 *NUEVO PEDIDO - Sunset Sabor Casero*
👤 *Cliente:* {nombre}
📞 *Teléfono:* {tel}
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
  cartId: string,       // unique ID
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
  cartId: string,
  type: 'drink',
  name: string,         // coincide con la key en DRINK_PRICES de App.jsx
  priceNum: number,
  quantity: number,
}
```

---

## Pendientes / posibles mejoras

- [ ] **Vercel deploy:** conectar repo `Davis-IA/sunset-pedidos` en vercel.com y configurar dominio
- [ ] **Banner — robustez:** el gradiente overlay está calibrado para el menú actual; imágenes con proporciones muy distintas pueden necesitar ajuste manual del porcentaje de transparencia
- [ ] **Comentarios de entrega:** opción para que el cliente escriba una nota libre antes de confirmar (dirección, piso, referencias)
- [ ] **Historial de pedidos:** actualmente no se persiste nada entre sesiones
- [ ] **Límite de stock:** `dish.quantity` se lee del sheet pero no se usa para deshabilitar el botón cuando llega a 0
