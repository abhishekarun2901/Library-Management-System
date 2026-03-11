import type { HTMLAttributes, ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '../ui'

export type DataTableProps = HTMLAttributes<HTMLDivElement> & {
  headers: string[]
  rows: ReactNode[][]
  title?: ReactNode
}

export const DataTable = ({
  className = '',
  headers,
  rows,
  title,
  ...props
}: DataTableProps) => {
  return (
    <Card className={className} {...props}>
      {title ? (
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </CardHeader>
      ) : null}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-700">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-3 font-medium first:pl-0 last:pr-0"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-3 py-3 align-middle text-gray-700 first:pl-0 last:pr-0"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
