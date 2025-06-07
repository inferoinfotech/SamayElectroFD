import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { getLoggerData, deleteLoggerData } from "@/api/meterData";

export default function ViewLoggerFile({
  months = [],
  years = [],
  initialMonth = "",
  initialYear = "",
  onFilterChange = () => { }
}) {
  const [loggerFiles, setLoggerFiles] = useState([]);
  const [filterMonth, setFilterMonth] = useState(initialMonth);
  const [filterYear, setFilterYear] = useState(initialYear);
  const [filterLoading, setFilterLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    if (!filterMonth || !filterYear) {
      toast.error("Please select month and year to filter");
      return;
    }

    setFilterLoading(true);
    try {
      const response = await getLoggerData(filterMonth, filterYear);
      const dataArray = Array.isArray(response) ? response : response?.data || [];

      const transformedData = dataArray.map((item) => ({
        id: item._id,
        fileName: item.fileName || "Logger Data",
        month: months.find((m) => m.value === item.month?.toString())?.label || item.month || "N/A",
        year: item.year || "N/A",
        uploadDate: new Date(item.createdAt).toLocaleDateString() || "N/A",
        recordsCount: item.recordsCount || 0,
      }));

      setLoggerFiles(transformedData);
      onFilterChange(filterMonth, filterYear);
      toast.success(`Found ${transformedData.length} logger records`);
    } catch (error) {
      console.error("Error fetching logger data:", error);
      toast.error(`No logger data found for ${months.find(m => m.value === filterMonth)?.label} ${filterYear}`);
      setLoggerFiles([]);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setFileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteLoggerFile = async () => {
    try {
      await deleteLoggerData(fileToDelete);
      setLoggerFiles(prev => prev.filter((file) => file.id !== fileToDelete));
      toast.success("Logger data deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete logger data: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  useEffect(() => {
    if (initialMonth && initialYear) {
      handleFilterSubmit({ preventDefault: () => { } });
    }
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Logger Data</CardTitle>
        <CardDescription>View and manage logger data files</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Logger Data</CardTitle>
              <CardDescription>Select criteria to find logger data</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filter-month">Month</Label>
                    <Select
                      value={filterMonth}
                      onValueChange={setFilterMonth}
                    >
                      <SelectTrigger id="filter-month" className={'border-slate-500'}>
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
                      <SelectTrigger id="filter-year " className={'border-slate-500'}>
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
                  <Button type="submit" disabled={filterLoading} className="cursor-pointer">
                    {filterLoading ? "Searching..." : "Search Data"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {loggerFiles.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Logger Data List</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {loggerFiles.length} records found for {months.find(m => m.value === filterMonth)?.label} {filterYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="whitespace-nowrap text-center">File Name</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Period</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Upload Date</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Records</TableHead>
                        <TableHead className="whitespace-nowrap text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loggerFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium max-w-[150px] sm:max-w-none truncate text-center">
                            {file.fileName}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">{`${file.month} ${file.year}`}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">{file.uploadDate}</TableCell>
                          <TableCell className="whitespace-nowrap text-center">{file.recordsCount}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-destructive/10 hover:cursor-pointer hover:text-destructive p-1 sm:p-2"
                              onClick={() => handleDeleteClick(file.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-0 sm:mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <FileDown className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 text-center">
                No logger data found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                Use the filter above to find logger data files
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the logger data file and all its records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLoggerFile}
              className="bg-red-600 hover:bg-red-700 hover:cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}