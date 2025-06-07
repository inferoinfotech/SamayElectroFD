"use client"

import React, { useState, useEffect } from "react"
import { Users, FileText, Zap, Activity, Database, ChevronDown, ChevronUp, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllMainClients, getAllSubClients } from "@/api/leadgenerator"
import { getLatestDailyReport, getLatestLossesCalculation, getLatestTotalReport } from "@/api/lossCalculationApi"
import History from "./History"

// Custom StatsCard component with improved responsive styling
const StatsCard = ({ title, value, icon, className }) => {
  const IconComponent = icon
  // Extract the text color class (e.g., "text-blue-600") from the className prop
  const textColorClass = className.split(' ').find(cls => cls.startsWith('text-')) || 'text-primary'

  return (
    <Card className={`border-0 shadow-sm ${className} transition-all hover:shadow-md`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm md:text-lg font-medium ${textColorClass} flex items-center justify-between`}>
          <span className="pr-2">{title}</span>
          <div className={`p-1.5 sm:p-2 rounded-lg ${className.includes("bg-") ? "" : "bg-primary/10"} flex-shrink-0`}>
            <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pr-2 sm:px-6">
        <div className={`text-xl sm:text-3xl font-bold ${textColorClass}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

// Compact Report Card for Monthly and Daily reports
const CompactReportCard = ({ title, data, icon }) => {
  const IconComponent = icon
  const [expanded, setExpanded] = useState(false)
  const displayCount = expanded ? data.length : 3

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <IconComponent className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600 font-normal">Recent generated reports</p>
            </div>
          </div>
          {data.length > 0 && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
              {data.length} {data.length === 1 ? "report" : "reports"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 max-h-96 overflow-y-auto history-scrollbar">
        <div className="space-y-3">
          {data.length > 0 ? (
            <>
              {data.slice(0, displayCount).map((report, index) => (
                <div key={index} className="border-b pb-2 last:border-b-0">
                  <div className="font-medium text-xs sm:text-sm truncate">{report.clientName || "All clients"}</div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-muted-foreground gap-1">
                    <span>
                      {report.month ? (
                        <>
                          {new Date(0, report.month - 1).toLocaleString("default", {
                            month: "short",
                          })}{" "}
                          {report.year}
                        </>
                      ) : (
                        "All time"
                      )}
                    </span>
                    <span className="text-right">
                      {new Date(report.generatedAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {data.length > 3 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors w-full pt-2"
                >
                  {expanded ? "Show less" : "Show all"}
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </>
          ) : (
            <div className="text-center text-xs sm:text-sm text-muted-foreground py-4">No reports available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Expanded Total Report Card with responsive table
const TotalReportCard = ({ data }) => {
  // Sort reports by date (newest first)
  const sortedReports = [...data].sort((a, b) => new Date(b.generatedAt) - new Date(a.updatedAt))

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Activity className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Total Reports</h2>
              <p className="text-sm text-slate-600 font-normal">Complete report history</p>
            </div>
          </div>
          {sortedReports.length > 0 && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
              {sortedReports.length} {sortedReports.length === 1 ? "report" : "reports"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="max-h-96 overflow-y-auto history-scrollbar">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full min-w-[400px]">
                <tbody>
                  {sortedReports.length > 0 ? (
                    sortedReports.map((report, reportIndex) => {
                      const clientNames = report.clientNames?.split(", ") || []
                      const rowSpan = Math.max(1, clientNames.length)
                      const period = report.month
                        ? `${new Date(0, report.month - 1).toLocaleString("default", { month: "short" })} ${report.year}`
                        : "All time"

                      return (
                        <React.Fragment key={reportIndex}>
                          {/* Report Group Header */}
                          <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                            <td colSpan={2} className="py-2 px-2 sm:px-4 bg-gray-50 dark:bg-gray-800">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Report {reportIndex + 1}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(report.generatedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Client Rows */}
                          {clientNames.length > 0 ? (
                            clientNames.map((name, nameIndex) => (
                              <tr
                                key={`${reportIndex}-${nameIndex}`}
                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-secondary/10 transition-colors"
                              >
                                {/* Client Name */}
                                <td className="py-2 px-2 sm:px-4">
                                  <div className="text-xs sm:text-sm font-medium break-words">{name.trim()}</div>
                                </td>

                                {/* Merged Month/Year cell */}
                                {nameIndex === 0 && (
                                  <td
                                    rowSpan={rowSpan}
                                    className="py-2 px-2 sm:px-4 border-l border-gray-100 dark:border-gray-800 text-right align-top"
                                  >
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-xs sm:text-sm font-medium text-primary">{period}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {clientNames.length} client
                                        {clientNames.length !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-secondary/10 transition-colors">
                              <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground">
                                No clients in this report
                              </td>
                              <td className="py-2 px-2 sm:px-4 border-l border-gray-100 dark:border-gray-800 text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs sm:text-sm font-medium text-primary">{period}</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-xs sm:text-sm text-muted-foreground">
                        No total reports available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    mainClients: 0,
    subClients: 0,
    mainMeters: 0,
    checkMeters: 0,
  })
  const [latestReports, setLatestReports] = useState({
    losses: [],
    total: [],
    daily: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // First fetch the essential data (main and sub clients)
        const [mainClients, subClients] = await Promise.all([getAllMainClients(), getAllSubClients()])

        // Count meters from main clients
        const mainClientMainMeters = mainClients.filter((c) => c.abtMainMeter?.meterNumber).length
        const mainClientCheckMeters = mainClients.filter((c) => c.abtCheckMeter?.meterNumber).length

        // Count meters from sub clients
        const subClientMainMeters = subClients.filter((c) => c.abtMainMeter?.meterNumber).length
        const subClientCheckMeters = subClients.filter((c) => c.abtCheckMeter?.meterNumber).length

        // Calculate totals
        const totalMainMeters = mainClientMainMeters + subClientMainMeters
        const totalCheckMeters = mainClientCheckMeters + subClientCheckMeters

        setStats({
          mainClients: mainClients.length,
          subClients: subClients.length,
          mainMeters: totalMainMeters,
          checkMeters: totalCheckMeters,
        })

        // Rest of your code remains the same...
        try {
          const [losses, total, daily] = await Promise.all([
            getLatestLossesCalculation().catch(() => ({ data: [] })),
            getLatestTotalReport().catch(() => ({ data: [] })),
            getLatestDailyReport().catch(() => ({ data: [] })),
          ])

          setLatestReports({
            losses: losses.data || [],
            total: total.data || [],
            daily: daily.data || [],
          })
        } catch (reportError) {
          console.error("Failed to load reports:", reportError)
          setLatestReports({
            losses: [],
            total: [],
            daily: [],
          })
        }
      } catch (error) {
        console.error("Failed to load main data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 h-full">
      <div className="mx-auto space-y-4 sm:space-y-6">
        {/* Status Cards - Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            title="RE Generator"
            value={stats.mainClients}
            icon={Users}
            className="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Sub RE Generator"
            value={stats.subClients}
            icon={Users}
            className="bg-purple-100 text-purple-600"
          />
          <StatsCard
            title="Total ABT Main Meters"
            value={stats.mainMeters}
            icon={Zap}
            className="bg-amber-100 text-amber-600"
          />
          <StatsCard
            title="Total ABT Check Meters"
            value={stats.checkMeters}
            icon={Zap}
            className="bg-emerald-100 text-emerald-600"
          />
        </div>

        {/* Monthly and Daily Reports - Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <CompactReportCard title="Monthly Reports" data={latestReports.losses} icon={FileText} />
          <CompactReportCard title="Daily Reports" data={latestReports.daily} icon={Database} />
        </div>

        {/* Total Reports and History - Bottom Section Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <TotalReportCard data={latestReports.total} />
          <History />
        </div>
      </div>
    </div>
  )
}