import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { STAGE_LABELS, OPPORTUNITY_STAGES } from '../../utils/constants.js'

const AXIS_COLOR = '#7a7a87'
const GRID_COLOR = 'rgba(255,255,255,0.08)'
const BAR_COLOR = '#7c6ef2'
const WON_COLOR = '#34d399'
const LOST_COLOR = '#f87171'

export function PipelineFunnelChart({ data }) {
  const byStage = new Map(data.map((row) => [row.stage, row]))
  const chartData = OPPORTUNITY_STAGES.map((stage) => ({
    key: stage,
    stage: STAGE_LABELS[stage],
    count: byStage.get(stage)?.count ?? 0,
  }))

  return (
    <div className="dashboard-card">
      <h3>Pipeline by Stage</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="stage"
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
            stroke={AXIS_COLOR}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
          />
          <YAxis allowDecimals={false} stroke={AXIS_COLOR} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: '#191921',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 10,
              color: '#f4f4f6',
            }}
            labelStyle={{ color: '#b4b4bf' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.key === 'WON' ? WON_COLOR : entry.key === 'LOST' ? LOST_COLOR : BAR_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
