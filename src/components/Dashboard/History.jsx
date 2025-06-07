"use client"

import { useState, useEffect } from "react"
import { Clock, AlertCircle, User, Edit3, Database, Hash, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllMainClients, getAllSubClients, getAllPartClients } from "@/api/leadgenerator"

const CriticalHistoryItem = ({ change }) => {
  const getChangeIcon = () => {
    const field = change.fieldName.toLowerCase()
    if (field.includes("mf")) {
      return <Edit3 className="h-4 w-4" />
    } else if (field.includes("partclient") || field.includes("divisionname")) {
      return <Building2 className="h-4 w-4" />
    } else if (field.includes("meter")) {
      return <Database className="h-4 w-4" />
    } else if (field.includes("consumerno")) {
      return <Hash className="h-4 w-4" />
    }
    return <AlertCircle className="h-4 w-4" />
  }

  const getReadableFieldName = (fieldName) => {
    const fieldMap = {
      mf: "MF",
      "abtmainmeter.meternumber": "Main Meter Number",
      "abtcheckmeter.meternumber": "Check Meter Number",
      divisionname: "Division Name",
      consumerno: "Consumer Number",
    }

    const lowerField = fieldName.toLowerCase()
    for (const [key, value] of Object.entries(fieldMap)) {
      if (lowerField.includes(key)) {
        return value
      }
    }

    return fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim()
  }

  const getChangeDescription = () => {
    const readableField = getReadableFieldName(change.fieldName)

    // Special case for part client addition
    if (change.fieldName.toLowerCase().includes("part client add")) {
      return `Part client added to "${change.clientName}"`
    }

    if (change.oldValue && change.oldValue !== change.newValue) {
      return `${readableField} changed from "${change.oldValue}" to "${change.newValue}"`
    } else {
      return `${readableField} set to "${change.newValue}"`
    }
  }

  const getClientTypeBadge = () => {
    const typeLabels = {
      MainClient: "Main",
      SubClient: "Sub",
      PartClient: "Part",
    }

    return (
      <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-slate-200">
        {typeLabels[change.clientType] || change.clientType}
      </Badge>
    )
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const isHighPriority = () => {
    const field = change.fieldName.toLowerCase()
    return (
      field.includes("mf") ||
      field.includes("consumerno") ||
      field.includes("abtmainmeter.meternumber") ||
      field.includes("abtcheckmeter.meternumber")
    )
  }

  return (
    <div
      className={`p-4 border-l-2 ${isHighPriority() ? "border-l-slate-400 bg-slate-50/30" : "border-l-slate-200"} hover:bg-slate-50/50 transition-colors duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-shrink-0 p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
          {getChangeIcon()}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-900 truncate">{change.clientName}</span>
              {getClientTypeBadge()}
              {isHighPriority() && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  Priority
                </Badge>
              )}
            </div>
            <span className="text-sm text-slate-500 flex-shrink-0">{formatTime(change.updatedAt)}</span>
          </div>

          <div className="bg-white rounded-md p-3 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-700 leading-relaxed">{getChangeDescription()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function History() {
  const [criticalChanges, setCriticalChanges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCriticalChanges = async () => {
      try {
        setLoading(true)

        const [mainClients, subClients, partClients] = await Promise.all([
          getAllMainClients(),
          getAllSubClients(),
          getAllPartClients(),
        ])

        const allHistories = []

        mainClients.forEach((client) => {
          if (client.history && client.history.length > 0) {
            client.history.forEach((history) => {
              allHistories.push({
                ...history,
                clientName: client.name,
                clientType: "MainClient",
              })
            })
          }
        })

        subClients.forEach((client) => {
          if (client.history && client.history.length > 0) {
            client.history.forEach((history) => {
              allHistories.push({
                ...history,
                clientName: client.name,
                clientType: "SubClient",
              })
            })
          }
        })

        partClients.forEach((client) => {
          if (client.history && client.history.length > 0) {
            client.history.forEach((history) => {
              allHistories.push({
                ...history,
                clientName: `${client.divisionName} (Part)`,
                clientType: "PartClient",
              })
            })
          }
        })

        const criticalKeywords = [
          "mf",
          "abtmainmeter.meternumber",
          "abtcheckmeter.meternumber",
          "divisionname",
          "consumerno",
          "part client add" // Added the new critical keyword
        ]

        const critical = allHistories
          .filter((history) =>
            criticalKeywords.some((keyword) =>
              history.fieldName && history.fieldName.toLowerCase().includes(keyword.toLowerCase())
            ),
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 20)

        setCriticalChanges(critical)
      } catch (error) {
        console.error("Failed to load critical changes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCriticalChanges()
  }, [])

  if (loading) {
    return (
      <Card className="w-full border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            Critical Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600"></div>
              <p className="text-sm text-slate-500">Loading Critical changes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Critical Changes</h2>
              <p className="text-sm text-slate-600 font-normal">Important updates across all clients</p>
            </div>
          </div>
          {criticalChanges.length > 0 && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
              {criticalChanges.length} {criticalChanges.length === 1 ? "change" : "changes"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 max-h-96 overflow-y-auto history-scrollbar">
        {criticalChanges.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {criticalChanges.map((change, index) => (
              <CriticalHistoryItem key={`${change.clientName}-${change.fieldName}-${index}`} change={change} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
              <AlertCircle className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-base font-medium text-slate-900 mb-2">No Recent Changes</h3>
            <p className="text-sm text-slate-500 text-center max-w-md">
              No critical changes have been detected recently. All systems are operating normally.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
