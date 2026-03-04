interface ComparisonTableProps {
  title: string
  headers: string[]
  rows: string[][]
}

export default function ComparisonTable({ title, headers, rows }: ComparisonTableProps) {
  return (
    <section className="px-4 py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-3xl space-y-8">
        <h2 className="text-2xl font-bold text-center md:text-3xl">
          {title}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="border-b px-4 py-3 text-left font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 ${j === 0 ? "font-medium" : "text-muted-foreground"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
