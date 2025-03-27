"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useTheme } from "next-themes"

interface ChartData {
  name: string
  value: number
  icon: string
}

interface ExpenseChartProps {
  data: ChartData[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Colors for the pie chart
  const COLORS = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
    "#f43f5e", // rose-500
    "#84cc16", // lime-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
  ]

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <div className="flex items-center gap-2">
            <span>{data.icon}</span>
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="mt-1">
            <span className="font-bold">
              {payload[0].value.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
            </span>
            <span className="text-muted-foreground ml-1">({((data.value / data.total) * 100).toFixed(1)}%)</span>
          </div>
        </div>
      )
    }
    return null
  }

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const chartData = data.map((item) => ({ ...item, total }))

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

