import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/formatters.js'

const AXIS_COLOR = '#7a7a87'
const GRID_COLOR = 'rgba(255,255,255,0.08)'

export function RevenueChart({ data }) {
  const chartData = data.map((point) => ({
    month: new Date(point.month).toLocaleDateString('en-US', { month: 'short' }),
    total: point.total,
  }))

  return (
    <div className="dashboard-card">
      <h3>Revenue Trend (6 months)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c6ef2" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#7c6ef2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="month" stroke={AXIS_COLOR} tickLine={false} axisLine={{ stroke: GRID_COLOR }} />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            width={90}
            stroke={AXIS_COLOR}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={{
              background: '#191921',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 10,
              color: '#f4f4f6',
            }}
            labelStyle={{ color: '#b4b4bf' }}
            cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#8f83f5"
            strokeWidth={2}
            fill="url(#revenueFill)"
            dot={{ r: 3, fill: '#8f83f5', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
