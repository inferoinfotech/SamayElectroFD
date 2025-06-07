import { useState, useCallback, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { uploadMeterCSV } from "@/api/meterData";
import norecord from "/images/No data-pana.webp";

export default function UploadMeterFile() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileChange({ target: { files: droppedFiles } });
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    // Validate file types
    const invalidFiles = selectedFiles.filter(
      (file) => !file.name.endsWith(".csv")
    );
    if (invalidFiles.length > 0) {
      toast.error("Invalid file format. Please upload only CSV files.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    toast.success(`${selectedFiles.length} new file(s) added.`);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAllFiles = () => {
    setFiles([]);
    setUploadResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatErrorMessage = (message) => {
    if (!message) return [];

    if (message.includes("The following files were not valid")) {
      const cleanedMessage = message.replace(
        /^The following files were not valid:\s*/,
        ""
      );
      const errors = cleanedMessage.split(/,\s*(?=Load Survey)/);
      return errors
        .map(
          (error) =>
            error
              .trim()
              .replace(/^Load Survey\s*-\s*/, "")
              .replace(
                /\s*-\s*Data already exists for this month and year$/,
                ""
              )
              .replace(
                /\s*-\s*[0-9]{2}-[0-9]{2}-[0-9]{2}\s*to\s*[0-9]{2}-[0-9]{2}-[0-9]{2}\s*-\s*Logger1\.csv$/,
                ""
              )
        )
        .filter((error) => error.length > 0);
    }

    toast.error(message);
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadResults(null);

    if (!month || !year) {
      toast.error("Missing information. Please select both month and year.");
      return;
    }

    if (files.length === 0) {
      toast.error(
        "No files selected. Please select at least one CSV file to upload."
      );
      return;
    }

    setIsUploading(true);

    try {
      const response = await uploadMeterCSV(
        files,
        parseInt(month),
        parseInt(year)
      );

      setUploadResults(response);

      if (response.successfulFiles && response.successfulFiles.length > 0) {
        const successCount = response.successfulFiles.length;
        const monthName = months.find((m) => m.value === month)?.label;

        toast.success(
          `${successCount} file(s) processed successfully for ${monthName} ${year}.`
        );

        const successfulFileNames = response.successfulFiles.map(
          (f) => f.fileName
        );
        setFiles((prevFiles) =>
          prevFiles.filter((file) => !successfulFileNames.includes(file.name))
        );

        if (response.invalidFiles && response.invalidFiles.length > 0) {
          toast.warning(
            `${response.invalidFiles.length} files failed to upload.`
          );
        }
      } else if (response.invalidFiles && response.invalidFiles.length > 0) {
        toast.error("All files failed to upload. Please check the errors.");
      }
    } catch (error) {
      toast.error("An error occurred during upload. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const extractFileName = (fileName) => {
    return fileName;
  };

  return (
    <div className="mx-auto py-4 px-4 flex flex-col lg:flex-row items-start gap-6">
      {/* Upload Section - Full width on mobile, half on larger screens */}
      <Card className="w-full lg:w-1/2 shadow-lg border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Bulk Meter File Upload
          </CardTitle>
          <CardDescription>
            Upload CSV files for data processing
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <CardContent className="space-y-6 flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month" className="font-medium">
                  Month
                </Label>
                <Select
                  value={month}
                  onValueChange={setMonth}
                  style={{ width: "100%" }}
                >
                  <SelectTrigger id="month" className="border-gray-600 bg-background">
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
                  <SelectTrigger id="year" className="border-gray-600 bg-background">
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
            <div className="space-y-3">
              <Label htmlFor="file-upload" className="font-medium">
                Upload Files (CSV only)
              </Label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${files.length > 0
                  ? "border-primary/50 bg-primary/5"
                  : isDragging
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 dark:border-gray-700"
                  }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-2 text-center">
                  <Upload
                    className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 ${files.length > 0 || isDragging
                      ? "text-primary"
                      : "text-gray-400"
                      }`}
                  />
                  <div className="flex flex-col sm:flex-row text-sm text-gray-600 dark:text-gray-400 items-center justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                    >
                      <span className="border-b border-primary/50 border-dashed duration-200 transition-all font-medium">
                        Upload files
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        onChange={handleFileChange}
                        multiple
                        ref={fileInputRef}
                      />
                    </label>
                    <p className="sm:pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    CSV files only
                  </p>
                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-md pointer-events-none">
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg">
                        <p className="text-sm font-medium text-primary">
                          Drop files here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Results display section */}
            {uploadResults && (
              <div className="mt-4 space-y-4">
                {uploadResults.successfulFiles &&
                  uploadResults.successfulFiles.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-md border border-green-200">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <h3 className="font-medium">
                          Successfully uploaded{" "}
                          {uploadResults.successfulFiles.length} file(s)
                        </h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {uploadResults.successfulFiles.map((file, index) => (
                          <li
                            key={`success-${index}`}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-800">
                                {extractFileName(file.fileName)}
                              </p>
                              <p className="text-green-600 text-xs">
                                {file.message}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {uploadResults.invalidFiles &&
                  uploadResults.invalidFiles.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-md border border-red-200">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <h3 className="font-medium">
                          Failed to upload {uploadResults.invalidFiles.length}{" "}
                          file(s)
                        </h3>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {uploadResults.invalidFiles.map((file, index) => (
                          <li
                            key={`error-${index}`}
                            className="flex items-start gap-2"
                          >
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-red-800">
                                {extractFileName(file.fileName)}
                              </p>
                              <p className="text-red-600 text-xs">
                                {file.reason}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="text-center text-sm text-gray-600">
                  Processed {uploadResults.summary.totalFiles} files:{" "}
                  <span className="text-green-600">
                    {uploadResults.summary.successful} succeeded
                  </span>
                  ,{" "}
                  <span className="text-red-600">
                    {uploadResults.summary.failed} failed
                  </span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              type="submit"
              className="w-full font-medium hover:cursor-pointer"
              disabled={isUploading || files.length === 0 || !month || !year}
            >
              {isUploading ? (
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
                  Uploading...
                </span>
              ) : (
                `Upload ${files.length > 1 ? `${files.length} Files` : "File"}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Uploaded Files List - Full width on mobile, half on larger screens */}
      <Card className="w-full lg:w-1/2 h-full shadow-lg border-t-4 border-t-secondary mt-4 lg:mt-0">
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>Review selected files before upload</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 overflow-y-auto history-scrollbar flex flex-col items-center justify-center flex-grow h-full">
          {files.length > 0 ? (
            <div className="mt-4 animate-in fade-in-50 duration-300 space-y-2 w-full">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">
                  Selected files ({files.length}):
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive bg-red-50 hover:bg-destructive/10 hover:text-destructive h-8 px-2 hover:cursor-pointer"
                  onClick={removeAllFiles}
                >
                  Clear all
                </Button>
              </div>
              <div className="space-y-2 overflow-y-auto history-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="bg-background border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center min-w-0 flex-1"> {/* Added flex-1 and min-w-0 */}
                        <div className="bg-[#e3f4fe] p-2 rounded-md flex-shrink-0">
                          <FileText className="h-5 w-5 text-[#44B7F7]" />
                        </div>
                        <div className="ml-3 overflow-hidden"> {/* Better text handling */}
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:cursor-pointer hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <img
                src={norecord}
                alt="No Records"
                className="w-64 h-64 sm:w-76 sm:h-80"
              />
              <p className="text-muted-foreground text-sm mt-2">
                No files uploaded
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}