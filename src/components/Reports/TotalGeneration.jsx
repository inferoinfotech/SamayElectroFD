import { useState, useEffect } from "react"
import { toast } from "sonner"
import { FileText, FileSpreadsheet, Search, Check, ChevronDown, Users, Calendar, Square, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getAllMainClients } from "@/api/leadgenerator"
import { downloadTotalReport, downloadTotalReportPdf, generateTotalReport } from "@/api/lossCalculationApi"

export default function TotalGeneration() {
  const [selectedClients, setSelectedClients] = useState([])
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState([])
  const [reportData, setReportData] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 13 }, (_, i) => (currentYear - 2 + i).toString())

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientList = await getAllMainClients()
        setClients(clientList)
      } catch (error) {
        console.error("Failed to fetch clients:", error)
        toast.error("Failed to load client list")
      } finally {
        setClientsLoading(false)
      }
    }

    fetchClients()
  }, [])

  const toggleClientSelection = (clientId) => {
    setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  const selectAllClients = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map((client) => client._id))
    }
  }

  const handleGenerateExcel = async () => {
    if (!month || !year) {
      toast.error("Please select month and year")
      return
    }

    if (selectedClients.length === 0) {
      toast.error("Please select at least one client")
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Generate the report
      const payload = {
        mainClientIds: selectedClients,
        month: Number.parseInt(month),
        year: Number.parseInt(year),
      }

      const generationResponse = await generateTotalReport(payload)

      // Step 2: Download the report
      const reportId = generationResponse.data?._id || generationResponse._id

      if (!reportId) {
        throw new Error("No report ID returned from the server")
      }

      const { data, headers } = await downloadTotalReport(reportId)

      // Extract filename from Content-Disposition header
      let filename = `total_report_${month}_${year}.xlsx` // default fallback
      const contentDisposition = headers["content-disposition"]

      if (contentDisposition) {
        // First try to handle RFC 5987 encoded filenames (with filename*=)
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i)
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1])
        } else {
          // Fallback for simpler filename extraction
          const simpleMatch = contentDisposition.match(/filename="(.+?)"/)
          if (simpleMatch && simpleMatch[1]) {
            filename = simpleMatch[1]
          }
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Excel report generated and downloaded successfully")
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error(error.message || "Failed to generate report")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!month || !year) {
      toast.error("Please select month and year")
      return
    }

    if (selectedClients.length === 0) {
      toast.error("Please select at least one client")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        mainClientIds: selectedClients,
        month: Number.parseInt(month),
        year: Number.parseInt(year),
      }

      const generationResponse = await generateTotalReport(payload)
      const reportId = generationResponse.data?._id || generationResponse._id

      if (!reportId) {
        throw new Error("No report ID returned from the server")
      }

      const { data, filename } = await downloadTotalReportPdf(reportId)

      // Create blob URL
      const blob = new Blob([data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.style.display = "none"
      document.body.appendChild(link)

      // Trigger download
      link.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      toast.success("PDF report downloaded successfully")
    } catch (error) {
      console.error("Error generating PDF report:", error)

      // Check if it's a network error
      if (error.message === "Network Error") {
        toast.error("Download blocked by browser extension. Please try disabling ad blockers.")
      } else {
        toast.error(`Download failed: ${error.message || error}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clients.filter((client) => client?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()))

  const selectedClientsData = reportData.filter(
    (item) =>
      selectedClients.includes(item.clientId) &&
      item.month === months.find((m) => m.value === month)?.label &&
      item.year === year,
  )

  // Mobile Card Component for Preview Table
  const PreviewCard = ({ item }) => (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-medium text-sm">{item.clientName}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              {item.netGeneration}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="block">Period:</span>
              <span className="font-medium text-foreground">{`${item.month} ${item.year}`}</span>
            </div>
            <div>
              <span className="block">Gross Injection:</span>
              <span className="font-medium text-foreground">{item.grossInjection}</span>
            </div>
            <div>
              <span className="block">Gross Drawl:</span>
              <span className="font-medium text-foreground">{item.grossDrawl}</span>
            </div>
            <div>
              <span className="block">Net Generation:</span>
              <span className="font-medium text-foreground">{item.netGeneration}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="mx-auto py-3 sm:py-4 px-3 sm:px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
          <span className="truncate">Total Generation Report</span>
        </h1>
      </div>

      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Generate Total Report</CardTitle>
          <CardDescription className="text-sm">
            Select multiple RE Generator and generate reports for a specific period
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Client Selection */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Label className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Select RE Generator
                </Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search RE Generators..."
                      className="pl-8 w-full sm:w-[250px] lg:w-[300px] bg-background border-slate-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={clientsLoading}
                    />
                  </div>
                  <Button
                    variant="default"
                    size="default"
                    onClick={selectAllClients}
                    disabled={clientsLoading || filteredClients.length === 0}
                    className={`whitespace-nowrap hover:cursor-pointer transition-colors duration-200 gap-2 ${selectedClients.length === filteredClients.length
                        ? "bg-slate-600 hover:bg-slate-700 text-white"
                        : "bg-[#055C9D] hover:bg-[#055C9D]/95 dark:text-white"
                      }`}
                  >
                    {selectedClients.length === filteredClients.length ? (
                      <>
                        <Square className="h-4 w-4" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Select All
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-3 sm:p-4 h-[250px] md:h-[480px] overflow-y-auto history-scrollbar">
                {clientsLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mr-2"></div>
                    Loading clients...
                  </div>
                ) : filteredClients.length > 0 ? (
                  <div className="space-y-3">
                    {filteredClients.map((client) => (
                      <div key={client._id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`client-${client._id}`}
                          checked={selectedClients.includes(client._id)}
                          onCheckedChange={() => toggleClientSelection(client._id)}
                          disabled={clientsLoading}
                        />
                        <Label htmlFor={`client-${client._id}`} className="font-normal text-sm cursor-pointer flex-1">
                          {client.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    {searchTerm ? "No matching clients found" : "No clients available"}
                  </div>
                )}
              </div>
            </div>

            {/* Date Selection and Selected Clients */}
            <div className="space-y-4 sm:space-y-6">
              {/* Date Selection */}
              <div className="space-y-4">
                <Label className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Select Period
                </Label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="month" className="text-sm">
                      Month
                    </Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger id="month" className="bg-background border-slate-500">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm">
                      Year
                    </Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger id="year" className="bg-background border-slate-500">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Selected Clients */}
              <div className="space-y-2">
                <Label className="font-medium text-sm">Selected RE Generator ({selectedClients.length})</Label>
                <div className="border rounded-lg p-3 max-h-[200px] sm:max-h-[380px] overflow-y-auto history-scrollbar bg-muted/30">
                  {selectedClients.length > 0 ? (
                    <div className="space-y-2">
                      {clients
                        .filter((client) => selectedClients.includes(client._id))
                        .map((client) => (
                          <div key={client._id} className="flex items-center text-sm">
                            <Check className="h-3 w-3 mr-2 text-green-500 flex-shrink-0" />
                            <span className="truncate">{client.name}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">No clients selected</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="text-xs text-muted-foreground sm:hidden text-center mb-2">
              {selectedClients.length} client{selectedClients.length !== 1 ? "s" : ""} selected
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="font-medium w-full sm:w-auto hover:cursor-pointer"
                  disabled={isLoading || selectedClients.length === 0 || clientsLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <>
                      Generate Report <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGeneratePDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generate Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>

      {/* Preview Section */}
      {selectedClientsData.length > 0 && (
        <Card className="shadow-lg mt-4 sm:mt-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Report Preview</CardTitle>
            <CardDescription className="text-sm">Preview of data that will be included in the report</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">RE Generator</TableHead>
                    <TableHead className="font-semibold">Month/Year</TableHead>
                    <TableHead className="font-semibold">Gross Injection</TableHead>
                    <TableHead className="font-semibold">Gross Drawl</TableHead>
                    <TableHead className="font-semibold">Net Generation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedClientsData.map((item) => (
                    <TableRow key={item.clientId}>
                      <TableCell className="font-medium">{item.clientName}</TableCell>
                      <TableCell>{`${item.month} ${item.year}`}</TableCell>
                      <TableCell>{item.grossInjection}</TableCell>
                      <TableCell>{item.grossDrawl}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                          {item.netGeneration}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {selectedClientsData.map((item) => (
                <PreviewCard key={item.clientId} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
