import { useState } from 'react'
import DishCard from './DishCard'
import AddDishModal from './AddDishModal'
import FloatingCart from './FloatingCart'
import SkeletonCard from './SkeletonCard'
import ErrorScreen from './ErrorScreen'
import DecoBackground from './DecoBackground'

const DRINKS = (refrescoName) => [
  { name: refrescoName, price: 0.5 },
  { name: 'Pepsi', price: 1.0 },
  { name: 'Coca Cola', price: 1.25 },
]

export default function MenuScreen({
  user,
  cart,
  subtotal,
  dishCount,
  totalItems,
  onAddToCart,
  onRemove,
  onViewOrder,
  onUpdateDrink,
  refrescoName,
  dishes,
  menuImage,
  loading,
  menuError,
}) {
  const [selectedDish, setSelectedDish] = useState(null)
  const [logoError, setLogoError] = useState(false)

  const drinks = DRINKS(refrescoName || 'Refresco del día')

  const getDrinkQty = (name) => {
    const d = cart.find((item) => item.type === 'drink' && item.name === name)
    return d ? d.quantity : 0
  }

  // Total units of a dish across all cart entries (may have diff. sides)
  const getDishQty = (dishId) =>
    cart
      .filter((item) => item.type === 'dish' && item.dishId === dishId)
      .reduce((sum, item) => sum + item.quantity, 0)

  // Remove the last-added cart entry for this dish
  const handleRemoveOne = (dishId) => {
    const dishItems = cart.filter(
      (item) => item.type === 'dish' && item.dishId === dishId,
    )
    if (dishItems.length === 0) return
    onRemove(dishItems[dishItems.length - 1].cartId)
  }

  if (menuError) return <ErrorScreen />

  return (
    <div className="min-h-screen min-h-dvh bg-[#F5F5F5] flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen min-h-dvh relative">

        <DecoBackground />

        <div className="relative" style={{ zIndex: 1 }}>

          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
            {logoError ? (
              <span className="text-sunset font-bold text-lg">Sunset Sabor Casero</span>
            ) : (
              <img
                src="/logo.png"
                alt="Sunset Sabor Casero"
                className="h-11 w-11 object-contain flex-shrink-0"
                onError={() => setLogoError(true)}
              />
            )}
            {!logoError && (
              <span className="font-semibold text-[#1a1a1a] text-base">
                Sunset Sabor Casero
              </span>
            )}
          </div>

          {/* Menu banner — fixed 220px, aggressive bottom fade to white */}
          {!loading && menuImage && (
            <div
              className="mx-4 mt-3 rounded-2xl overflow-hidden bg-white relative"
              style={{ height: '215px' }}
            >
              <img
                src={menuImage}
                alt="Menú del día"
                className="w-full h-full object-cover animate-fade-in"
                style={{ objectPosition: 'top center' }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 0%, transparent 78%, rgba(255,255,255,0.6) 86%, white 94%, white 100%)',
                }}
              />
            </div>
          )}

          {/* Greeting */}
          <div className="px-4 pt-3 pb-2">
            <h2 className="text-lg font-bold text-[#1a1a1a]">
              ¡Hola, {user.nombre}! 👋
            </h2>
            <p className="text-[#888888] text-xs mt-0.5">
              Elige lo que más te guste
            </p>
          </div>

          {/* Dish grid — 2 columns */}
          <div className="px-4 pb-4">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">🍽️</p>
                <p className="text-[#888888] font-medium">
                  No hay platos disponibles en este momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 items-stretch">
                {dishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    dishQty={getDishQty(dish.id)}
                    onAddClick={() => setSelectedDish(dish)}
                    onRemoveOne={() => handleRemoveOne(dish.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Drinks section */}
          {!loading && (
            <div className="px-4 pb-4">
              <h3 className="font-bold text-[#1a1a1a] text-base mb-3">🥤 Bebidas</h3>
              <div className="grid grid-cols-3 gap-2">
                {drinks.map((drink) => {
                  const qty = getDrinkQty(drink.name)
                  return (
                    <div
                      key={drink.name}
                      className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm flex flex-col justify-between text-center h-[110px]"
                    >
                      <div className="h-[32px] flex items-start justify-center">
                        <p
                          className="font-semibold text-[#1a1a1a] leading-tight text-center"
                          style={{ fontSize: '11px' }}
                        >
                          {drink.name}
                        </p>
                      </div>
                      <p className="text-sunset font-bold text-xs">
                        ${drink.price.toFixed(2)}
                      </p>
                      {qty === 0 ? (
                        <button
                          onClick={() => onUpdateDrink(drink.name, 1)}
                          className="w-full bg-sunset hover:bg-[#E09510] text-white font-semibold py-1.5 rounded-xl text-xs active:opacity-70 transition-all duration-150"
                        >
                          + Agregar
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-full gap-1">
                          <button
                            onClick={() => onUpdateDrink(drink.name, -1)}
                            className="w-8 h-8 rounded-full border-2 border-sunset text-sunset text-lg font-bold flex items-center justify-center active:opacity-70"
                          >
                            −
                          </button>
                          <span className="font-bold text-[#1a1a1a] text-sm tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() => onUpdateDrink(drink.name, 1)}
                            className="w-8 h-8 rounded-full bg-sunset text-white text-lg font-bold flex items-center justify-center active:opacity-70"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Info notes */}
          {!loading && (
            <div className="px-4 pb-40">
              {/* Box: schedule + payment */}
              <div
                style={{
                  background: '#FFF8EE',
                  borderLeft: '3px solid #F5A623',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <p className="text-sm text-[#1a1a1a] leading-snug">
                  ⏰ Haz tu pedido antes de las 10:45 AM para recibirlo antes de la 1 PM. Pedidos después de las 10:45 AM se entregan después de la 1 PM.
                </p>
                <p className="text-sm text-[#1a1a1a] leading-snug mt-2.5">
                  💳 Pagás en efectivo o transferencia bancaria.
                </p>
              </div>

              {/* Instagram — outside the box, centered */}
              <a
                href="https://www.instagram.com/sunsetsaborcasero"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 mt-4 active:opacity-70 transition-opacity"
              >
                {/* Instagram logo with official gradient */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                      <stop offset="0%"   stopColor="#fdf497" />
                      <stop offset="10%"  stopColor="#fdf497" />
                      <stop offset="30%"  stopColor="#fd5949" />
                      <stop offset="60%"  stopColor="#d6249f" />
                      <stop offset="90%"  stopColor="#285AEB" />
                    </radialGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="url(#ig-grad)" />
                  <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
                </svg>
                <span className="text-sm font-medium" style={{ color: '#555555' }}>
                  @sunsetsaborcasero
                </span>
              </a>
            </div>
          )}

        </div>{/* end content wrapper */}
      </div>

      {/* Add dish modal */}
      {selectedDish && (
        <AddDishModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          onConfirm={(item) => {
            onAddToCart(item)
            setSelectedDish(null)
          }}
        />
      )}

      {/* Floating cart — shows total item count (dishes + drinks) */}
      <FloatingCart
        itemCount={totalItems}
        subtotal={subtotal}
        onViewOrder={onViewOrder}
      />
    </div>
  )
}
