import { useState, useCallback, useEffect } from 'react'
import { useMenu } from './hooks/useMenu'
import UserForm from './components/UserForm'
import MenuScreen from './components/MenuScreen'
import OrderSummary from './components/OrderSummary'
import OrderConfirmation from './components/OrderConfirmation'

function readUrlParams() {
  const params = new URLSearchParams(window.location.search)
  const tel = params.get('tel') ?? ''
  const nombre = decodeURIComponent(params.get('nombre') ?? '')
  return tel && nombre ? { tel, nombre } : null
}

/** Generates a short order ID: #HHMM + first 2 initials of the name */
function generateOrderId(nombre) {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const initials = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return `#${hh}${mm}${initials}`
}

export default function App() {
  const [user, setUser] = useState(readUrlParams)
  const [screen, setScreen] = useState('menu')   // 'menu' | 'order' | 'confirmation'
  const [cart, setCart] = useState([])
  const [orderId, setOrderId] = useState(null)
  const [submittedCart, setSubmittedCart] = useState([])  // full items sent in last batch

  // Menu data — loaded once here and passed down to both screens
  const { dishes, menuImage, loading, error, refrescoDescripcion } = useMenu()

  // Build the dynamic refresco display name.
  // Sheet description may be "Bebida de horchata" → display "Refresco de horchata"
  const refrescoName = refrescoDescripcion
    ? `Refresco de ${refrescoDescripcion.replace(/^bebida de\s*/i, '').trim()}`
    : 'Refresco del día'

  // Auto-return to menu if cart is emptied on the order screen
  useEffect(() => {
    if (screen === 'order' && cart.length === 0) {
      setScreen('menu')
    }
  }, [cart, screen])

  /** Called after WhatsApp opens — saves the full sent cart snapshot and shows confirmation */
  const handleOrderSent = useCallback(() => {
    setOrderId((prev) => prev ?? generateOrderId(user?.nombre ?? ''))
    setSubmittedCart([...cart])   // snapshot of everything currently in the cart
    setScreen('confirmation')
  }, [user, cart])

  /** Go back to menu keeping cart intact (for adding more items) */
  const handleAddMore = useCallback(() => {
    setScreen('menu')
  }, [])

  /** Full reset — new independent order */
  const handleNewOrder = useCallback(() => {
    setCart([])
    setOrderId(null)
    setSubmittedCart([])
    setScreen('menu')
  }, [])

  const addToCart = useCallback((item) => {
    setCart((prev) => [
      ...prev,
      { ...item, cartId: `${Date.now()}-${Math.random()}` },
    ])
  }, [])

  const removeFromCart = useCallback((cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId))
  }, [])

  const updateDrinkQuantity = useCallback(
    (name, delta) => {
      // Price map — keyed by the actual drink name used in the UI
      const DRINK_PRICES = {
        [refrescoName]: 0.5,
        Pepsi: 1.0,
        'Coca Cola': 1.25,
      }

      setCart((prev) => {
        const existing = prev.find(
          (item) => item.type === 'drink' && item.name === name,
        )

        if (!existing) {
          if (delta <= 0) return prev
          return [
            ...prev,
            {
              cartId: `drink-${name}-${Date.now()}`,
              type: 'drink',
              name,
              priceNum: DRINK_PRICES[name] ?? 0,
              quantity: 1,
            },
          ]
        }

        const newQty = existing.quantity + delta
        if (newQty <= 0) {
          return prev.filter(
            (item) => !(item.type === 'drink' && item.name === name),
          )
        }
        return prev.map((item) =>
          item.type === 'drink' && item.name === name
            ? { ...item, quantity: newQty }
            : item,
        )
      })
    },
    [refrescoName],
  )

  const subtotal = cart.reduce(
    (sum, item) => sum + item.priceNum * item.quantity,
    0,
  )

  // Count only dish items for the cart badge (drinks are secondary)
  const dishCount = cart
    .filter((item) => item.type === 'dish')
    .reduce((sum, item) => sum + item.quantity, 0)

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (!user) {
    return <UserForm onSubmit={setUser} />
  }

  if (screen === 'confirmation') {
    return (
      <OrderConfirmation
        cart={cart}
        subtotal={subtotal}
        orderId={orderId}
        onAddMore={handleAddMore}
        onNewOrder={handleNewOrder}
      />
    )
  }

  if (screen === 'order') {
    return (
      <OrderSummary
        cart={cart}
        user={user}
        subtotal={subtotal}
        onRemove={removeFromCart}
        onUpdateDrink={updateDrinkQuantity}
        onBack={() => setScreen('menu')}
        onOrderSent={handleOrderSent}
        orderId={orderId}
        submittedCart={submittedCart}
      />
    )
  }

  return (
    <MenuScreen
      user={user}
      cart={cart}
      subtotal={subtotal}
      dishCount={dishCount}
      totalItems={totalItems}
      onAddToCart={addToCart}
      onRemove={removeFromCart}
      onViewOrder={() => setScreen('order')}
      onUpdateDrink={updateDrinkQuantity}
      refrescoName={refrescoName}
      dishes={dishes}
      menuImage={menuImage}
      loading={loading}
      menuError={error}
    />
  )
}
