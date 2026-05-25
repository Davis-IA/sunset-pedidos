/**
 * Builds the WhatsApp message text for a confirmed order.
 */
export function formatWhatsAppMessage(user, cart, subtotal) {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', {
    timeZone: 'America/El_Salvador',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  const dishes = cart.filter((item) => item.type === 'dish')
  const drinks = cart.filter((item) => item.type === 'drink')

  const lines = []

  dishes.forEach((item) => {
    const lineTotal = (item.priceNum * item.quantity).toFixed(2)
    const details = item.isSopa
      ? '2 tortillas'
      : `${item.acompañamiento} + ${item.ensalada} + 2 tortillas`
    lines.push(`- ${item.quantity}x ${item.name} (${details}) — $${lineTotal}`)
  })

  drinks.forEach((item) => {
    const lineTotal = (item.priceNum * item.quantity).toFixed(2)
    lines.push(`- ${item.quantity}x ${item.name} — $${lineTotal}`)
  })

  return `🛒 *NUEVO PEDIDO - Sunset Sabor Casero*

👤 *Cliente:* ${user.nombre}
📞 *Teléfono:* ${user.tel}

📋 *Detalle del pedido:*
${lines.join('\n')}

💵 *Subtotal (sin envío): $${subtotal.toFixed(2)}*

⏰ *Pedido realizado:* ${time}`
}
