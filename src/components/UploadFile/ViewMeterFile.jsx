import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteMeterData, getMeterData } from "@/api/meterData";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllMainClients } from "@/api/leadgenerator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ViewMeterFile({
  initialClientId = "",
  initialMonth = "",
  initialYear = "",
  months = [],
  years = [],
}) {
  const [meterFiles, setMeterFiles] = useState([]);
  const [clients, setClients] = useState([]);
  const [filterClient, setFilterClient] = useState(initialClientId);
  const [filterMonth, setFilterMonth] = useState(initialMonth);
  const [filterYear, setFilterYear] = useState(initialYear);
  const [filterLoading, setFilterLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

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

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    if (!filterClient || !filterMonth || !filterYear) {
      toast.error("Please select RE Generator, month and year to filter");
      return;
    }

    setFilterLoading(true);
    try {
      const response = await getMeterData(filterClient, filterMonth, filterYear);
      const dataArray = Array.isArray(response) ? response : response?.data || [];

      const transformedData = dataArray.map((item) => ({
        id: item._id,
        name: item.client?.name || "Meter Data",
        meterNumber: item.meterNumber || "N/A",
        month: months.find((m) => m.value === item.month?.toString())?.label || item.month || "N/A",
        year: item.year || "N/A",
        clientName: item.client?.name || "Unknown Client",
        clientType: item.clientType || "N/A",
        meterType: item.meterType || "N/A",
      }));

      setMeterFiles(transformedData);
      toast.success(`Found ${transformedData.length} meter records`);
    } catch (error) {
      console.error("Error in handleFilterSubmit:", error);
      toast.error("No meter file found, Upload meter file first");
      setMeterFiles([]);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setFileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteMeterFile = async () => {
    try {
      await deleteMeterData(fileToDelete);
      toast.success("Meter data deleted successfully");

      // Refetch the meter data with current filters after deletion
      const response = await getMeterData(filterClient, filterMonth, filterYear);
      const dataArray = Array.isArray(response) ? response : response?.data || [];

      const transformedData = dataArray.map((item) => ({
        id: item._id,
        name: item.client?.name || "Meter Data",
        meterNumber: item.meterNumber || "N/A",
        month: months.find((m) => m.value === item.month?.toString())?.label || item.month || "N/A",
        year: item.year || "N/A",
        clientName: item.client?.name || "Unknown Client",
        clientType: item.clientType || "N/A",
        meterType: item.meterType || "N/A",
      }));

      setMeterFiles(transformedData);
    } catch (error) {
      toast.error(`Failed to delete meter data: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  useEffect(() => {
    if (initialClientId && initialMonth && initialYear) {
      handleFilterSubmit({ preventDefault: () => { } });
    }
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Meter Data</CardTitle>
        <CardDescription>View and manage meter reading data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Filter Meter Data</CardTitle>
              <CardDescription>Select criteria to find meter data</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filter-client">Client Name</Label>
                    <Select
                      value={filterClient}
                      onValueChange={setFilterClient}
                      disabled={clientsLoading}
                    >
                      <SelectTrigger id="filter-client" className="w-full border-slate-500">
                        {clientsLoading ? "Loading RE Generator..." : <SelectValue placeholder="Select RE Generator" />}
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
                    <Label htmlFor="filter-month">Month</Label>
                    <Select
                      value={filterMonth}
                      onValueChange={setFilterMonth}
                    >
                      <SelectTrigger id="filter-month" className="w-full border-slate-500">
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
                    <Label htmlFor="filter-year">Year</Label>
                    <Select
                      value={filterYear}
                      onValueChange={setFilterYear}
                    >
                      <SelectTrigger id="filter-year" className="w-full border-slate-500">
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
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={filterLoading}
                    className="cursor-pointer w-full sm:w-auto"
                  >
                    {filterLoading ? "Searching..." : "Search Data"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {meterFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Meter Data List</CardTitle>
                <CardDescription>
                  {meterFiles.length} records found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-black/20">
                        <TableHead className="whitespace-nowrap text-center">Client Name</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Meter Number</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Client Type</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Meter Type</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Period</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meterFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {file.clientName}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">{file.meterNumber}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            {file.clientType == 'MainClient' ? 'Main Client' : 'Sub Client'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium ${file.meterType === 'abtCheckMeter'
                              ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                              : 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                              }`}>
                              {file.meterType === 'abtCheckMeter' ? 'CHECK METER' : 'MAIN METER'}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">{`${file.month} ${file.year}`}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              onClick={() => handleDeleteClick(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="ml-1 hidden sm:inline">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {meterFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <FileDown className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                No meter data found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                Use the filter above to find meter reading data
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the meter data record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMeterFile}
              className="bg-red-600 hover:bg-red-700 cursor-pointer text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}