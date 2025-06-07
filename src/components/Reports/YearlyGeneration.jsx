import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarDays, FileSpreadsheet, Download, User, Calendar } from "lucide-react"
import { getAllMainClients } from "@/api/leadgenerator"
import { generateYearlyReport } from "@/api/lossCalculationApi"

export default function YearlyGeneration() {
    const [clientName, setClientName] = useState("")
    const [startMonth, setStartMonth] = useState("")
    const [startYear, setStartYear] = useState("")
    const [endMonth, setEndMonth] = useState("")
    const [endYear, setEndYear] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [clients, setClients] = useState([])
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

    const handleDownload = async () => {
        if (!clientName || !startMonth || !startYear || !endMonth || !endYear) {
            toast.error("Please select all required fields")
            return
        }

        // Validate date range
        const startDate = new Date(Number.parseInt(startYear), Number.parseInt(startMonth) - 1)
        const endDate = new Date(Number.parseInt(endYear), Number.parseInt(endMonth) - 1)

        if (endDate < startDate) {
            toast.error("End date must be after start date")
            return
        }

        setIsLoading(true)

        try {
            const data = {
                mainClientId: clientName,
                startMonth: Number.parseInt(startMonth),
                startYear: Number.parseInt(startYear),
                endMonth: Number.parseInt(endMonth),
                endYear: Number.parseInt(endYear),
            }

            const { data: response, headers } = await generateYearlyReport(data)

            // Verify response
            if (!response || response.byteLength < 100) {
                throw new Error("Received empty or corrupted file from server")
            }

            // Extract filename from Content-Disposition header
            let filename = "Yearly_Report.xlsx" // default fallback
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

            // Create blob
            const blob = new Blob([response], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()

            // Cleanup
            setTimeout(() => {
                window.URL.revokeObjectURL(url)
                link.parentNode.removeChild(link)
            }, 100)

            toast.success("Yearly report downloaded successfully")
        } catch (error) {
            console.error("Download failed:", error)
            toast.error(`Download failed: ${error.message || error}`)
        } finally {
            setIsLoading(false)
        }
    }

    const getSelectedDateRange = () => {
        if (startMonth && startYear && endMonth && endYear) {
            const startMonthName = months.find((m) => m.value === startMonth)?.label
            const endMonthName = months.find((m) => m.value === endMonth)?.label
            return `${startMonthName} ${startYear} - ${endMonthName} ${endYear}`
        }
        return "No date range selected"
    }

    const isFormValid = clientName && startMonth && startYear && endMonth && endYear

    return (
        <div className="mx-auto py-3 sm:py-4 px-3 sm:px-4">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 mb-2">
                    <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                    <span className="leading-tight">Yearly Analytics Report for DISCOM</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Generate comprehensive yearly reports for selected RE Generator and time period
                </p>
            </div>

            {/* Form Section */}
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader className="pb-4 px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        Yearly Report Generation
                    </CardTitle>
                    <CardDescription className="text-sm">Generate yearly report for selected period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                    {/* Client Selection */}
                    <div className="space-y-3">
                        <Label htmlFor="client" className="font-medium flex items-center gap-2 text-sm sm:text-base">
                            <User className="h-4 w-4" />
                            RE Generator
                        </Label>
                        <Select value={clientName} onValueChange={setClientName} disabled={clientsLoading}>
                            <SelectTrigger id="client" className="bg-background border-slate-500">
                                <SelectValue placeholder={clientsLoading ? "Loading RE Generator..." : "Select RE Generator"} />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client._id} value={client._id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {clientsLoading && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-primary"></div>
                                Loading clients...
                            </div>
                        )}
                    </div>

                    {/* Date Range Selection */}
                    <div className="space-y-4">
                        <Label className="font-medium flex items-center gap-2 text-sm sm:text-base">
                            <Calendar className="h-4 w-4" />
                            Date Range Selection
                        </Label>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Start Date */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <Label className="font-medium text-sm">Start Date</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="startMonth" className="text-xs text-muted-foreground">
                                            Month
                                        </Label>
                                        <Select value={startMonth} onValueChange={setStartMonth}>
                                            <SelectTrigger id="startMonth" className="bg-background border-slate-500">
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
                                        <Label htmlFor="startYear" className="text-xs text-muted-foreground">
                                            Year
                                        </Label>
                                        <Select value={startYear} onValueChange={setStartYear}>
                                            <SelectTrigger id="startYear" className="bg-background border-slate-500">
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

                            {/* End Date */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <Label className="font-medium text-sm">End Date</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="endMonth" className="text-xs text-muted-foreground">
                                            Month
                                        </Label>
                                        <Select value={endMonth} onValueChange={setEndMonth}>
                                            <SelectTrigger id="endMonth" className="bg-background border-slate-500">
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
                                        <Label htmlFor="endYear" className="text-xs text-muted-foreground">
                                            Year
                                        </Label>
                                        <Select value={endYear} onValueChange={setEndYear}>
                                            <SelectTrigger id="endYear" className="bg-background border-slate-500">
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
                        </div>

                        {/* Date Range Preview */}
                        {isFormValid && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Selected Range:</span>
                                    <span className="text-primary font-semibold">{getSelectedDateRange()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selected Client Preview */}
                    {clientName && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">Selected Client:</span>
                                <span className="text-blue-600 font-semibold">
                                    {clients.find((c) => c._id === clientName)?.name || "Unknown Client"}
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4 px-4 sm:px-6">
                    {/* Form Status */}
                    <div className="w-full text-center text-xs text-muted-foreground">
                        {!isFormValid && "Please fill all fields to generate report"}
                        {isFormValid && !isLoading && "Ready to generate report"}
                    </div>

                    {/* Download Button */}
                    <Button
                        onClick={handleDownload}
                        className="w-full font-medium text-sm sm:text-base hover:cursor-pointer"
                        disabled={isLoading || clientsLoading || !isFormValid}
                        size="lg"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Generating Report...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Generate & Download Report
                            </span>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
