/**
 * Builds the WhatsApp message text for a confirmed order.
 *
 * options.orderId       — e.g. "#1857DM"; required when isAddition is true
 * options.isAddition    — true when this is a follow-up to a previous order
 * options.submittedCart — full array of cart items already sent in previous messages;
 *                         items whose cartId is absent from the current cart are REMOVED,
 *                         items in the current cart not found here are NEW.
 */
export function formatWhatsAppMessage(user, cart, subtotal, options = {}) {
  const { orderId = null, isAddition = false, submittedCart = [] } = options

  const now = new Date()
  const time = now.toLocaleTimeString('en-US', {
    timeZone: 'America/El_Salvador',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  // ── Determine removed vs new items (only relevant for additions) ─────────
  const submittedIds = new Set(submittedCart.map((i) => i.cartId))
  const currentIds   = new Set(cart.map((i) => i.cartId))

  // Items previously sent that are no longer in the cart
  const removedItems = submittedCart.filter((i) => !currentIds.has(i.cartId))
  // Items in the current cart that were not in the previous send
  const newItems     = cart.filter((i) => !submittedIds.has(i.cartId))

  // A modification = it was already an addition AND something was removed
  const isModification = isAddition && removedItems.length > 0

  // ── Pick header and section label ────────────────────────────────────────
  let header, sectionLabel
  if (isModification) {
    header       = `✏️ *MODIFICACIÓN AL PEDIDO ${orderId}* - Sunset Sabor Casero`
    sectionLabel = '📋 *Cambios al pedido:*'
  } else if (isAddition) {
    header       = `➕ *ADICIÓN AL PEDIDO ${orderId}* - Sunset Sabor Casero`
    sectionLabel = '📋 *Ítems agregados:*'
  } else {
    header       = '🛒 *NUEVO PEDIDO - Sunset Sabor Casero*'
    sectionLabel = '📋 *Detalle del pedido:*'
  }

  // ── Build item lines ─────────────────────────────────────────────────────
  const lines = []

  if (isAddition) {
    // Removed items first
    removedItems.forEach((item) => {
      const lineTotal = (item.priceNum * item.quantity).toFixed(2)
      const detailStr = item.details ? ` (${item.details})` : ''
      lines.push(`❌ ELIMINADO: ${item.quantity}x ${item.name}${detailStr} — $${lineTotal}`)
    })

    // Then new items
    const newDishes = newItems.filter((i) => i.type === 'dish')
    const newDrinks = newItems.filter((i) => i.type === 'drink')
    newDishes.forEach((item) => {
      const lineTotal = (item.priceNum * item.quantity).toFixed(2)
      const detailStr = item.details ? ` (${item.details})` : ''
      lines.push(`- ${item.quantity}x ${item.name}${detailStr} — $${lineTotal}`)
    })
    newDrinks.forEach((item) => {
      const lineTotal = (item.priceNum * item.quantity).toFixed(2)
      lines.push(`- ${item.quantity}x ${item.name} — $${lineTotal}`)
    })
  } else {
    // First order — send everything
    const dishes = cart.filter((i) => i.type === 'dish')
    const drinks  = cart.filter((i) => i.type === 'drink')
    dishes.forEach((item) => {
      const lineTotal = (item.priceNum * item.quantity).toFixed(2)
      const detailStr = item.details ? ` (${item.details})` : ''
      lines.push(`- ${item.quantity}x ${item.name}${detailStr} — $${lineTotal}`)
    })
    drinks.forEach((item) => {
      const lineTotal = (item.priceNum * item.quantity).toFixed(2)
      lines.push(`- ${item.quantity}x ${item.name} — $${lineTotal}`)
    })
  }

  // ── Build footer lines ───────────────────────────────────────────────────
  let footerLines
  if (isAddition) {
    // Cost of new items only
    const additionTotal = newItems.reduce(
      (sum, item) => sum + item.priceNum * item.quantity,
      0,
    )
    const label = isModification ? 'Modificación' : 'Adición'
    footerLines =
      `💵 *${label} (sin envío): $${additionTotal.toFixed(2)}*\n` +
      `💵 *Total acumulado (sin envío): $${subtotal.toFixed(2)}*`
  } else {
    footerLines = `💵 *Subtotal (sin envío): $${subtotal.toFixed(2)}*`
  }

  return `${header}

👤 *Cliente:* ${user.nombre}
📞 *Teléfono:* ${user.tel}

${sectionLabel}
${lines.join('\n')}

${footerLines}

⏰ *Pedido realizado:* ${time}`
}
