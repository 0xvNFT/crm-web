import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, Users, MapPin, BarChart2, Settings, BookUser, TrendingUp } from 'lucide-react'
import {
  useKpiCallSummary,
  useKpiActivitySummary,
  useKpiDoctorCoverage,
  useKpiTerritoryPerformance,
} from '@/api/endpoints/reports'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { KpiSection, PeriodSelector } from './components/KpiShared'
import { CURRENT_YEAR, CURRENT_MONTH, QUARTERS } from './components/kpi-constants'
import { CallSummaryTable, ActivitySummaryTable, DoctorCoverageTable, TerritoryPerformanceTable } from './components/KpiTables'

export default function KpiReportsPage() {
  const navigate = useNavigate()
  const { isAdmin, isManager } = useRole()

  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [quarter, setQuarter] = useState(Math.ceil(CURRENT_MONTH / 3))

  const monthPeriod = { year, month }
  const quarterPeriod = { year, quarter }

  const callSummary = useKpiCallSummary(monthPeriod)
  const activitySummary = useKpiActivitySummary(monthPeriod)
  const doctorCoverage = useKpiDoctorCoverage(monthPeriod)
  const territoryPerf = useKpiTerritoryPerformance(quarterPeriod)

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Reports"
        description="Field force call rate, compliance, reach, and territory performance"
        actions={
          <div className="flex items-center gap-2">
            {(isAdmin || isManager) && (
              <Button variant="outline" size="sm" onClick={() => navigate('/reports/kpi/targets')}>
                <Settings className="h-4 w-4 mr-1.5" />
                Manage Targets
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/reports/kpi/my-doctors')}>
              <BookUser className="h-4 w-4 mr-1.5" />
              My Doctors
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports/kpi/sales-performance')}>
              <TrendingUp className="h-4 w-4 mr-1.5" />
              Sales Performance
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All Reports
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border bg-background p-4">
        <PeriodSelector
          year={year}
          month={month}
          quarter={quarter}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onQuarterChange={setQuarter}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Monthly metrics use Year + Month. Territory Performance uses Year + Quarter.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
          On target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" />
          Within 10% of target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive inline-block" />
          Below target
        </span>
      </div>

      <KpiSection title="Call Summary" icon={Target} isLoading={callSummary.isLoading}>
        {callSummary.isError ? (
          <ErrorMessage className="py-6" error={callSummary.error} onRetry={() => callSummary.refetch()} />
        ) : (
          <CallSummaryTable rows={callSummary.data ?? []} />
        )}
      </KpiSection>

      <KpiSection title="Doctor Coverage (Call Reach)" icon={Users} isLoading={doctorCoverage.isLoading}>
        {doctorCoverage.isError ? (
          <ErrorMessage className="py-6" error={doctorCoverage.error} onRetry={() => doctorCoverage.refetch()} />
        ) : (
          <DoctorCoverageTable rows={doctorCoverage.data ?? []} />
        )}
      </KpiSection>

      <KpiSection title="Activity Summary" icon={BarChart2} isLoading={activitySummary.isLoading}>
        {activitySummary.isError ? (
          <ErrorMessage className="py-6" error={activitySummary.error} onRetry={() => activitySummary.refetch()} />
        ) : (
          <ActivitySummaryTable rows={activitySummary.data ?? []} />
        )}
      </KpiSection>

      {(isAdmin || isManager) && (
        <KpiSection title={`Territory Performance — ${QUARTERS[quarter - 1]}`} icon={MapPin} isLoading={territoryPerf.isLoading}>
          {territoryPerf.isError ? (
            <ErrorMessage className="py-6" error={territoryPerf.error} onRetry={() => territoryPerf.refetch()} />
          ) : (
            <TerritoryPerformanceTable rows={territoryPerf.data ?? []} />
          )}
        </KpiSection>
      )}
    </div>
  )
}
