import { useEffect, useState } from 'react'
import { Users, Target, Trophy, XCircle, DollarSign } from 'lucide-react'
import { StatGridSkeleton, DashboardCardsSkeleton } from '../components/common/Skeleton.jsx'
import { StatCard } from '../components/dashboard/StatCard.jsx'
import { RevenueChart } from '../components/dashboard/RevenueChart.jsx'
import { PipelineFunnelChart } from '../components/dashboard/PipelineFunnelChart.jsx'
import { SalesPerformanceTable } from '../components/dashboard/SalesPerformanceTable.jsx'
import { UpcomingFollowUps } from '../components/followups/UpcomingFollowUps.jsx'
import { formatCurrency } from '../utils/formatters.js'
import * as dashboardService from '../services/dashboard.service.js'

export function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [revenueTrend, setRevenueTrend] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getSummary(),
      dashboardService.getRevenueTrend(),
      dashboardService.getUpcomingFollowUps(),
    ]).then(([summaryData, revenueData, upcomingData]) => {
      setSummary(summaryData)
      setRevenueTrend(revenueData)
      setUpcoming(upcomingData)
      setLoading(false)
    })
  }, [])

  const ready = !loading && summary

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {ready ? (
        <>
          <div className="stat-grid">
            <StatCard label="Total Customers" value={summary.totalCustomers} icon={Users} />
            <StatCard label="Total Leads" value={summary.totalLeads} icon={Target} />
            <StatCard label="Deals Won" value={summary.dealsWon} icon={Trophy} />
            <StatCard label="Deals Lost" value={summary.dealsLost} icon={XCircle} />
            <StatCard label="Monthly Revenue" value={formatCurrency(summary.monthlyRevenue)} icon={DollarSign} />
          </div>

          <div className="dashboard-grid">
            <RevenueChart data={revenueTrend} />
            <PipelineFunnelChart data={summary.pipelineByStage} />
            <SalesPerformanceTable rows={summary.salesPerformance} />
            <UpcomingFollowUps followUps={upcoming} />
          </div>
        </>
      ) : (
        <>
          <StatGridSkeleton count={5} />
          <DashboardCardsSkeleton />
        </>
      )}
    </div>
  )
}
