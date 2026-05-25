import { useState } from 'react'

export default function DishCard({ dish, dishQty = 0, onAddClick, onRemoveOne }) {
  const [pressed, setPressed] = useState(false)

  const handleAdd = () => {
    setPressed(true)
    setTimeout(() => setPressed(false), 200)
    onAddClick(dish)
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-3 flex flex-col justify-between
        transition-all duration-200
        ${dishQty > 0 ? 'ring-2 ring-sunset' : ''}
        ${pressed ? 'scale-[0.97]' : 'hover:shadow-lg hover:scale-[1.02]'}
      `}
    >
      {/* Top: Name + Description */}
      <div>
        <h3 className="font-bold text-[#1a1a1a] text-sm leading-tight mb-1">
          {dish.name}
        </h3>
        {dish.description && (
          <p className="text-[#888888] text-xs leading-snug">
            {dish.description}
          </p>
        )}
      </div>

      {/* Bottom: Price + button / counter */}
      <div className="pt-2">
        <p className="text-sunset font-bold text-sm mb-1.5">${dish.price}</p>

        {/* Fixed-height container keeps card height identical in both states */}
        <div className="h-[36px] flex items-center">
          {dishQty > 0 ? (
            <div className="flex items-center justify-between w-full h-full">
              <button
                onClick={onRemoveOne}
                className="w-9 h-9 rounded-full border-2 border-sunset text-sunset text-lg font-bold flex items-center justify-center active:opacity-70 transition-opacity"
              >
                −
              </button>
              <span className="font-bold text-[#1a1a1a] text-sm tabular-nums">
                {dishQty}
              </span>
              <button
                onClick={handleAdd}
                className="w-9 h-9 rounded-full bg-sunset text-white text-lg font-bold flex items-center justify-center active:opacity-70 transition-opacity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full h-full bg-sunset hover:bg-[#E09510] text-white font-semibold rounded-xl text-xs active:opacity-75 transition-all duration-150"
            >
              + Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
