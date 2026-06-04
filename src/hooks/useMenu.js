import { useState, useEffect } from 'react'
import { parsePrice } from '../utils/parseCSV'

const SHEET_ID = '1uYtZgLVeupcD-W9mN0RITjQ5OpM1KZ51jWJs51SVO8Q'
const SHEET_NAME = 'Menu_Diario'
const RANGE = 'A7:H'

const DRINK_KEYWORDS = ['refresco', 'pepsi', 'coca', 'cola', 'bebida', 'gaseosa']

function isDrinkRow(name) {
  const lower = name.toLowerCase()
  return DRINK_KEYWORDS.some((kw) => lower.includes(kw))
}

function fetchSheetJSONP() {
  return new Promise((resolve, reject) => {
    const cbName = `_gsq${Date.now()}_${Math.floor(Math.random() * 1e6)}`

    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('timeout'))
    }, 12000)

    window[cbName] = (data) => {
      cleanup()
      resolve(data)
    }

    const script = document.createElement('script')
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}&range=${encodeURIComponent(RANGE)}&tqx=responseHandler:${cbName}`
    script.onerror = () => {
      cleanup()
      reject(new Error('script load error'))
    }

    function cleanup() {
      clearTimeout(timer)
      delete window[cbName]
      if (script.parentNode) script.parentNode.removeChild(script)
    }

    document.head.appendChild(script)
  })
}

function cellStr(cell) {
  if (!cell || cell.v === null || cell.v === undefined) return ''
  if (typeof cell.v === 'number') return cell.f != null ? String(cell.f) : String(cell.v)
  return String(cell.v)
}

export function useMenu() {
  const [dishes, setDishes] = useState([])
  const [menuImage, setMenuImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refrescoDescripcion, setRefrescoDescripcion] = useState('')
  const [saladOptions, setSaladOptions] = useState([])

  useEffect(() => {
    let cancelled = false

    async function fetchMenu() {
      try {
        const data = await fetchSheetJSONP()

        if (cancelled) return
        if (data.status !== 'ok') throw new Error(`gviz error: ${data.status}`)

        const rows = data.table?.rows ?? []
        let imageUrl = ''
        let refrescoDesc = ''
        let saladOpts = []
        const parsed = []

        rows.forEach((row, index) => {
          const c = row?.c ?? []

          const name = cellStr(c[0]).trim()
          const price = cellStr(c[1]).trim().replace(/^\$/, '')

          const description = cellStr(c[2]).trim()
          const img = cellStr(c[4]).trim()

          const qCell = c[5]
          const quantity =
            qCell && typeof qCell.v === 'number'
              ? Math.floor(qCell.v)
              : parseInt(cellStr(qCell), 10)

          // Banner image is in the first data row only
          if (index === 0 && img) imageUrl = img

          // Config row: "[Ensaladas]" in col A — parse salad options from col C
          if (name && (name.toLowerCase().includes('ensaladas') || name.toLowerCase().includes('ensaldas'))) {
            if (description) {
              saladOpts = description
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            }
            return // skip adding to dishes
          }

          // Filter out drink rows — capture refresco description for the order screen
          if (name && isDrinkRow(name)) {
            if (name.toLowerCase().includes('refresco') && !refrescoDesc) {
              refrescoDesc = description
            }
            return // skip adding to dishes
          }

          if (name && !isNaN(quantity) && quantity > 0) {
            parsed.push({
              id: index,
              name,
              price,
              priceNum: parsePrice(price),
              description,
              quantity,
            })
          }
        })

        setMenuImage(imageUrl)
        setDishes(parsed)
        setRefrescoDescripcion(refrescoDesc)
        setSaladOptions(saladOpts)
        setError(false)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMenu()
    return () => {
      cancelled = true
    }
  }, [])

  return { dishes, menuImage, loading, error, refrescoDescripcion, saladOptions }
}
