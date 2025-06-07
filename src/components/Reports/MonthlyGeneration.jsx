import React, { useState, useEffect } from "react";
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
import ViewMeterFile from "../UploadFile/ViewMeterFile";
import { getAllMainClients } from "@/api/leadgenerator";
import {
  downloadLossesCalculation,
  generateLossesCalculation,
  getLossesDataLastFourMonths,
} from "@/api/lossCalculationApi";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight, ShieldAlert, Users } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MonthlyGeneration() {
  const [clientName, setClientName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [grossInjection, setGrossInjection] = useState("");
  const [grossDrawl, setGrossDrawl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [lastFourMonthsData, setLastFourMonthsData] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showNoMainMeterModal, setShowNoMainMeterModal] = useState(false);
  const [clientsWithoutMainMeter, setClientsWithoutMainMeter] = useState([]);
  const [showCheckMeterModal, setShowCheckMeterModal] = useState(false);
  const [clientsUsingCheckMeter, setClientsUsingCheckMeter] = useState([]);

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
        toast.error("Failed to load client list");
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const fetchLastFourMonthsData = async (
    clientId,
    selectedMonth,
    selectedYear
  ) => {
    try {
      const data = {
        mainClientId: clientId,
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
      };

      const response = await getLossesDataLastFourMonths(data);
      setLastFourMonthsData(response.data || []);
      setShowHistory(true);
    } catch (error) {
      console.error("Failed to fetch last four months data:", error);
      toast.error("Failed to load historical data");
    }
  };

  const handleDownload = async (id) => {
    try {
      const { data, headers } = await downloadLossesCalculation(id);

      // Extract filename from Content-Disposition header
      let filename = 'losses-calculation.xlsx'; // default fallback
      const contentDisposition = headers['content-disposition'];

      if (contentDisposition) {
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
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully");

      // Fetch last four months data after successful download
      if (clientName && month && year) {
        await fetchLastFourMonthsData(clientName, month, year);
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Download failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !month || !year) {
      toast.error("Please select RE Generator, month and year");
      return;
    }

    setIsLoading(true);
    setShowNoMainMeterModal(false);
    setShowCheckMeterModal(false);
    setClientsWithoutMainMeter([]);
    setClientsUsingCheckMeter([]);

    try {
      const data = {
        mainClientId: clientName,
        month: parseInt(month),
        year: parseInt(year),
        SLDCGROSSINJECTION: grossInjection ? parseFloat(grossInjection) : null,
        SLDCGROSSDRAWL: grossDrawl ? parseFloat(grossDrawl) : null,
      };

      // First generate the calculation
      const response = await generateLossesCalculation(data);

      // Check for missing subclients in both response.data and response directly
      let missingSubClients = [];
      if (response.data?.missingSubClients) {
        missingSubClients = response.data.missingSubClients;
      } else if (response.message?.includes("missing for subclients")) {
        const match = response.message.match(/subclients: (.+)$/);
        if (match && match[1]) {
          missingSubClients = match[1].split(',').map(s => s.trim());
        }
      }

      // Check for clients without main meter data
      if (response.data?.clientsUsingCheckMeter || response.clientsUsingCheckMeter) {
        const checkMeterClients = response.data?.clientsUsingCheckMeter || response.clientsUsingCheckMeter;
        setClientsUsingCheckMeter(checkMeterClients);
        setShowCheckMeterModal(true);
      }

      // Existing code for missing main meter data
      if (response.data?.clientsWithoutMainMeter) {
        setClientsWithoutMainMeter(response.data.clientsWithoutMainMeter);
        setShowNoMainMeterModal(true);
      }

      if (missingSubClients.length > 0) {
        toast.warning(
          <div className="border-2 border-red-500 bg-red-50 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="ml-3">
                <h3 className="text-lg font-bold text-red-800">
                  Missing Data Alert
                </h3>
                <div className="mt-2 text-red-700">
                  <p>Data is missing for the following subclients:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {missingSubClients.map((client, index) => (
                      <li key={index} className="font-medium">
                        {client}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-3 text-sm text-red-600">
                  Please upload the missing meter files to complete the calculation.
                </p>
              </div>
            </div>
          </div>,
          {
            duration: 10000,
            position: "top-center",
          }
        );
      } else if (!response.data?.clientsWithoutMainMeter) {
        toast.success("Loss calculation generated successfully");
      }

      // Then download the file using the ID from response
      if (response.data?._id) {
        await handleDownload(response.data._id);
      } else {
        throw new Error("No ID returned from calculation generation");
      }

      // Reset form
      setGrossInjection("");
      setGrossDrawl("");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(`Submission failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto py-4 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Monthly Analytics Report for DISCOM
      </h1>

      {/* 4 */}
      <Dialog open={showCheckMeterModal} onOpenChange={setShowCheckMeterModal}>
        <DialogContent className="sm:max-w-3xl bg-yellow-50 border-2 border-yellow-500">
          <DialogHeader>
            <DialogTitle className="text-yellow-800 text-2xl">
              Clients Using Check Meter Data
            </DialogTitle>
            <DialogDescription className="text-yellow-700">
              The following clients don't have main meter data available
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border border-yellow-200 bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-yellow-100">
                  <TableRow>
                    <TableHead className="font-bold text-yellow-900">Client Name</TableHead>
                    <TableHead className="font-bold text-yellow-900">Type</TableHead>
                    <TableHead className="font-bold text-yellow-900 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientsUsingCheckMeter.map((client, index) => {
                    const isMainClient = clients.some(c => c.name === client && c._id === clientName);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{client}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${isMainClient
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                            }`}>
                            {isMainClient ? 'Main Client' : 'Sub Client'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                            Using Check Meter
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowCheckMeterModal(false)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid bg-blue-100 w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="entry" className={"cursor-pointer text-base font-semibold"}>
            Report Calculation
          </TabsTrigger>
          <TabsTrigger value="history" className={"cursor-pointer text-base font-semibold"}>
            Meter Files List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Form Section */}
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">
                  Meter Data Entry
                </CardTitle>
                <CardDescription>
                  Enter meter data for processing
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* First Row - Client, Month, Year */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client" className="font-medium">
                        RE Generator
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

                  {/* Second Row - SLDC Injection and Drawl */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grossInjection" className="font-medium">
                        SLDC Gross Injection (Optional)
                      </Label>
                      <Input
                        id="grossInjection"
                        type="number"
                        step="0.01"
                        placeholder="Enter gross injection value"
                        value={grossInjection}
                        onChange={(e) => setGrossInjection(e.target.value)}
                        className="bg-background border-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grossDrawl" className="font-medium">
                        SLDC Gross Drawl (Optional)
                      </Label>
                      <Input
                        id="grossDrawl"
                        type="number"
                        step="0.01"
                        placeholder="Enter gross drawl value"
                        value={grossDrawl}
                        onChange={(e) => setGrossDrawl(e.target.value)}
                        className="bg-background border-slate-500"
                      />
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

            {/* Last Four Months Data Table */}
            {showHistory && (
              <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Historical data for{" "}
                    {clients.find((c) => c._id === clientName)?.name ||
                      "selected client"}
                  </CardTitle>
                  <CardDescription>Last Four Months Data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-primary/10">
                        <TableRow>
                          <TableHead className="w-[200px] font-bold border-r">
                            Sub Client Name
                          </TableHead>
                          {lastFourMonthsData.map((monthData, index) => (
                            <TableHead
                              key={index}
                              colSpan={2}
                              className="text-center font-bold border-x"
                            >
                              {new Date(
                                monthData.year,
                                monthData.month - 1
                              ).toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                              })}
                            </TableHead>
                          ))}
                        </TableRow>
                        <TableRow className="bg-primary/5">
                          <TableHead className="border-r"></TableHead>
                          {lastFourMonthsData.map((monthData, index) => (
                            <React.Fragment key={index}>
                              <TableHead className="font-medium border-r">
                                Gross Injection (MWh)
                              </TableHead>
                              <TableHead className="font-medium border-r">
                                Weightage (%)
                              </TableHead>
                            </React.Fragment>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lastFourMonthsData[0].subClients.map(
                          (subClient, subIndex) => {
                            const hasPartClients =
                              subClient.partClients?.length > 0;

                            return (
                              <React.Fragment key={subIndex}>
                                {/* Main Sub Client Row */}
                                <TableRow>
                                  <TableCell className="font-medium border-r">
                                    {subClient.name}
                                  </TableCell>
                                  {lastFourMonthsData.map(
                                    (monthData, monthIndex) => {
                                      const matchingSubClient =
                                        monthData.subClients.find(
                                          (sc) => sc.name === subClient.name
                                        );
                                      return (
                                        <React.Fragment key={monthIndex}>
                                          <TableCell className="border-r">
                                            {matchingSubClient?.grossInjectionMWHAfterLosses?.toFixed(
                                              2
                                            ) || "N/A"}
                                          </TableCell>
                                          <TableCell className="border-r">
                                            {matchingSubClient?.weightageGrossInjecting?.toFixed(
                                              2
                                            ) || "N/A"}
                                          </TableCell>
                                        </React.Fragment>
                                      );
                                    }
                                  )}
                                </TableRow>

                                {/* Part Clients Rows */}
                                {hasPartClients &&
                                  subClient.partClients.map(
                                    (partClient, partIndex) => (
                                      <TableRow key={partIndex}>
                                        <TableCell className="pl-8 border-r bg-muted/50">
                                          {partClient.divisionName}
                                        </TableCell>
                                        {lastFourMonthsData.map(
                                          (monthData, monthIndex) => {
                                            const matchingSubClient =
                                              monthData.subClients.find(
                                                (sc) =>
                                                  sc.name === subClient.name
                                              );
                                            const matchingPartClient =
                                              matchingSubClient?.partClients?.find(
                                                (pc) =>
                                                  pc.divisionName ===
                                                  partClient.divisionName
                                              );
                                            return (
                                              <React.Fragment key={monthIndex}>
                                                <TableCell className="border-r bg-muted/50">
                                                  {matchingPartClient?.grossInjectionMWHAfterLosses?.toFixed(
                                                    2
                                                  ) || "N/A"}
                                                </TableCell>
                                                <TableCell className="border-r bg-muted/50">
                                                  {matchingPartClient?.weightageGrossInjecting?.toFixed(
                                                    2
                                                  ) || "N/A"}
                                                </TableCell>
                                              </React.Fragment>
                                            );
                                          }
                                        )}
                                      </TableRow>
                                    )
                                  )}
                              </React.Fragment>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <ViewMeterFile
            initialClientId={clientName}
            initialMonth={month}
            initialYear={year}
            months={months}
            years={years}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}