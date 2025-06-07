import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllMainClients } from "@/api/leadgenerator";
import { downloadDailyReport, generateDailyReport } from "@/api/lossCalculationApi";
import ViewLoggerFile from "../UploadFile/ViewLoggerFile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DailyGeneration() {
  const [clientName, setClientName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [showCheckMeterModal, setShowCheckMeterModal] = useState(false);
  const [showNoMeterModal, setShowNoMeterModal] = useState(false);
  const [clientsUsingCheckMeter, setClientsUsingCheckMeter] = useState([]);
  const [clientsWithoutMeters, setClientsWithoutMeters] = useState([]);
  // const [showMeterDataModal, setShowMeterDataModal] = useState(false);
  // const [meterDataIssues, setMeterDataIssues] = useState({
  //   title: '',
  //   description: '',
  //   clients: [],
  //   subClientName: '',
  //   date: ''
  // });
  // Add this state near your other state declarations
  const [loggerDataIssues, setLoggerDataIssues] = useState({
    title: '',
    description: '',
    problematicClients: [], // Will contain both main and subclients with their issues
    issueType: '' // 'no-meter' or 'no-logger'
  });

  const [showLoggerDataModal, setShowLoggerDataModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 13 }, (_, i) =>
    (currentYear - 2 + i).toString()
  );

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
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientList = await getAllMainClients();
        setClients(clientList);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        toast.error("Failed to load client list", error.me);
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDownload = async (id) => {
    try {
      const { data, headers } = await downloadDailyReport(id);

      // Extract filename from Content-Disposition header
      let filename = 'daily-report.xlsx'; // default fallback
      const contentDisposition = headers['content-disposition'];

      if (contentDisposition) {
        // First try to handle RFC 5987 encoded filenames (with filename*=)
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        } else {
          // Fallback for simpler filename extraction
          const simpleMatch = contentDisposition.match(/filename="(.+?)"/);
          if (simpleMatch && simpleMatch[1]) {
            filename = simpleMatch[1];
          }
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Download failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !month || !year) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setShowCheckMeterModal(false);
    setShowNoMeterModal(false);
    setClientsUsingCheckMeter([]);
    setClientsWithoutMeters([]);

    try {
      const data = {
        mainClientId: clientName,
        month: month,
        year: year
      };

      // First generate the report
      const response = await generateDailyReport(data);

      // Check for clients using check meters
      if (response.data?.clientsUsingCheckMeter || response.clientsUsingCheckMeter) {
        const checkMeterClients = response.data?.clientsUsingCheckMeter || response.clientsUsingCheckMeter;
        setClientsUsingCheckMeter(checkMeterClients);
        setShowCheckMeterModal(true);
      }

      // Check for clients without any meter data
      if (response.data?.clientsWithoutMeters || response.clientsWithoutMeters) {
        const noMeterClients = response.data?.clientsWithoutMeters || response.clientsWithoutMeters;
        setClientsWithoutMeters(noMeterClients);
        setShowNoMeterModal(true);
      }

      // Only show success if we're not showing a warning modal
      if (!response.data?.clientsWithoutMeters && !response.clientsWithoutMeters) {
        toast.success("Daily report generated successfully");
      }

      // Then download the file using the ID from response
      if (response.data?._id) {
        await handleDownload(response.data._id);
      } else {
        throw new Error("No ID returned from report generation");
      }

      // Reset form
      setMonth("");
      setYear("");
    } catch (error) {
      console.error("Submission failed:", error);
      // Handle specific error cases
      if (error.message?.includes("Meter data missing")) {
        setLoggerDataIssues({
          title: "Missing Meter Data",
          description: "The following clients are missing meter data:",
          problematicClients: error.clientsWithoutMeters || [],
          issueType: 'no-meter'
        });
        setShowLoggerDataModal(true);
      }
      else if (error.message?.includes("Logger data not available for subclient") ||
        error.message?.includes("Logger data missing for")) {
        // Create array of problematic clients from error response
        const problematicClients = [];

        // Add main client if it has issues
        if (error.clientsWithoutMeters) {
          problematicClients.push(...error.clientsWithoutMeters);
        }

        // Add subclient with logger issues
        if (error.subClientName) {
          problematicClients.push({
            name: error.subClientName,
            type: 'Sub Client',
            issue: 'Missing Logger Data'
          });
        }

        setLoggerDataIssues({
          title: "No Logger Data Available",
          description: "The following clients have No Logger data available:",
          problematicClients,
          issueType: 'no-logger'
        });
        setShowLoggerDataModal(true);
      } else {
        toast.error(`Submission failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto py-4 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Daily Generation Report
      </h1>

      {/* No Meter Data Modal */}
      <Dialog open={showLoggerDataModal} onOpenChange={setShowLoggerDataModal}>
        <DialogContent className="sm:max-w-3xl bg-red-50 border-2 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-red-800 text-2xl">
              {loggerDataIssues.title}
            </DialogTitle>
            <DialogDescription className="text-red-700">
              {loggerDataIssues.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loggerDataIssues.problematicClients.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-white overflow-hidden mb-4">
                <Table>
                  <TableHeader className="bg-red-100">
                    <TableRow>
                      <TableHead className="font-bold text-red-900">Client Name</TableHead>
                      <TableHead className="font-bold text-red-900">Type</TableHead>
                      <TableHead className="font-bold text-red-900">Issue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loggerDataIssues.problematicClients.map((client, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${client.type === 'Main Client'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                            }`}>
                            {client.type || 'Sub Client'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                            {loggerDataIssues.issueType === 'no-meter'
                              ? 'Missing Meter Data'
                              : 'Missing Logger Data'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <p className="mt-3 text-sm text-red-600">
              {loggerDataIssues.issueType === 'no-meter'
                ? "Please upload the missing meter data files to generate the report."
                : "Please upload the missing logger data files to generate the report."}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowLoggerDataModal(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid w-full bg-blue-100 max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="entry" className="cursor-pointer text-base font-semibold">Report Calculation</TabsTrigger>
          <TabsTrigger value="logger" className="cursor-pointer text-base font-semibold">Logger Data</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Form Section */}
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">
                  Daily Data Entry
                </CardTitle>
                <CardDescription>
                  Enter daily data for processing
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* First Row - Client and Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client" className="font-medium">
                        Client
                      </Label>
                      <Select
                        value={clientName}
                        onValueChange={setClientName}
                        disabled={clientsLoading}
                      >
                        <SelectTrigger id="client" className="bg-background border-slate-500">
                          <SelectValue
                            placeholder={
                              clientsLoading
                                ? "Loading RE Generator..."
                                : "Select RE Generator"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client._id} value={client._id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Second Row - Month and Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month" className="font-medium">
                        Month
                      </Label>
                      <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger id="month" className="bg-background border-slate-500">
                          <SelectValue placeholder="Select month" />
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
                      <Label htmlFor="year" className="font-medium">
                        Year
                      </Label>
                      <Select value={year} onValueChange={setYear}>
                        <SelectTrigger id="year" className="bg-background border-slate-500">
                          <SelectValue placeholder="Select year" />
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
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    className="w-full font-medium cursor-pointer"
                    disabled={isLoading || clientsLoading}
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
                        Processing...
                      </span>
                    ) : (
                      "Generate & Download"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logger">
          <ViewLoggerFile
            months={months}
            years={years}
            initialMonth={month}
            initialYear={year}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}