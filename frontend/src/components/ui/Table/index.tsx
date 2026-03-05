import type { ReactNode } from "react"

export type TableProps = {
  headers: string[]
  rows: ReactNode[][]
}

export const Table = ({ headers, rows }: TableProps) => {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-700">
          {headers.map((header) => (
            <th key={header} className="px-3 py-3 font-medium first:pl-0 last:pr-0">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-3 py-3 text-gray-700 first:pl-0 last:pr-0">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
