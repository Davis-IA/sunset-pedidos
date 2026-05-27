/**
 * Builds the WhatsApp message text for a confirmed order.
 *
 * options.orderId        — e.g. "#1857DM"; required when isAddition is true
 * options.isAddition     — true when this is a follow-up to a previous order
 * options.submittedCartIds — array of cartIds already sent; new items are those NOT in this list
 */
export function formatWhatsAppMessage(user, cart, subtotal, options = {}) {
  const { orderId = null, isAddition = false, submittedCartIds = [] } = options

  const now = new Date()
  const time = now.toLocaleTimeString('en-US', {
    timeZone: 'America/El_Salvador',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  // For additions, only include items not yet sent
  const itemsToSend = isAddition
    ? cart.filter((item) => !submittedCartIds.includes(item.cartId))
    : cart

  const dishes = itemsToSend.filter((item) => item.type === 'dish')
  const drinks = itemsToSend.filter((item) => item.type === 'drink')

  const lines = []

  dishes.forEach((item) => {
    const lineTotal = (item.priceNum * item.quantity).toFixed(2)
    const detailStr = item.details ? ` (${item.details})` : ''
    lines.push(`- ${item.quantity}x ${item.name}${detailStr} — $${lineTotal}`)
  })

  drinks.forEach((item) => {
    const lineTotal = (item.priceNum * item.quantity).toFixed(2)
    lines.push(`- ${item.quantity}x ${item.name} — $${lineTotal}`)
  })

  // Subtotal of only the items being sent in this message
  const messageTotalNum = itemsToSend.reduce(
    (sum, item) => sum + item.priceNum * item.quantity,
    0,
  )

  const header = isAddition
    ? `➕ *ADICIÓN AL PEDIDO ${orderId}* - Sunset Sabor Casero`
    : `🛒 *NUEVO PEDIDO - Sunset Sabor Casero*`

  return `${header}

👤 *Cliente:* ${user.nombre}
📞 *Teléfono:* ${user.tel}

📋 *Detalle del pedido:*
${lines.join('\n')}

💵 *Subtotal (sin envío): $${messageTotalNum.toFixed(2)}*

⏰ *Pedido realizado:* ${time}`
}
