import { useState, useCallback, useEffect } from 'react'
import { useMenu } from './hooks/useMenu'
import UserForm from './components/UserForm'
import MenuScreen from './components/MenuScreen'
import OrderSummary from './components/OrderSummary'

function readUrlParams() {
  const params = new URLSearchParams(window.location.search)
  const tel = params.get('tel') ?? ''
  const nombre = decodeURIComponent(params.get('nombre') ?? '')
  return tel && nombre ? { tel, nombre } : null
}

export default function App() {
  const [user, setUser] = useState(readUrlParams)
  const [screen, setScreen] = useState('menu')
  const [cart, setCart] = useState([])

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

  if (screen === 'order') {
    return (
      <OrderSummary
        cart={cart}
        user={user}
        subtotal={subtotal}
        onRemove={removeFromCart}
        onUpdateDrink={updateDrinkQuantity}
        onBack={() => setScreen('menu')}
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
