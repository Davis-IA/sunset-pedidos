/**
 * Parses a CSV string into an array of string arrays.
 * Handles quoted fields (with escaped double-quotes) and CRLF/LF line endings.
 */
export function parseCSV(text) {
  const rows = []
  let i = 0
  const len = text.length

  while (i < len) {
    const row = []

    while (i < len && text[i] !== '\n' && text[i] !== '\r') {
      let field = ''

      if (text[i] === '"') {
        i++ // skip opening quote
        while (i < len) {
          if (text[i] === '"') {
            if (i + 1 < len && text[i + 1] === '"') {
              field += '"'
              i += 2
            } else {
              i++ // skip closing quote
              break
            }
          } else {
            field += text[i++]
          }
        }
      } else {
        while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i++]
        }
      }

      row.push(field)

      if (i < len && text[i] === ',') {
        i++
      }
    }

    // Skip CRLF or LF
    if (i < len && text[i] === '\r') i++
    if (i < len && text[i] === '\n') i++

    // Skip fully empty rows
    if (row.length > 0 && !(row.length === 1 && row[0] === '')) {
      rows.push(row)
    }
  }

  return rows
}

/**
 * Extracts the first numeric value from a price string.
 * Handles plain numbers ("7"), ranges ("5 - 6"), and prefixed ("$7.50").
 */
export function parsePrice(priceStr) {
  if (!priceStr) return 0
  const match = String(priceStr).match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}
