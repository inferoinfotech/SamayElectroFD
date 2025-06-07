import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Search, Trash2, Eye, FileSpreadsheet, UserPlus, AlertTriangle } from "lucide-react";
import { getAllMainClients, deleteMainClient } from "@/api/leadgenerator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import norecord from "/images/No data-pana.webp";

const ViewClients = () => {
    const [mainClients, setMainClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMainClients = async () => {
            try {
                setLoading(true);
                const clients = await getAllMainClients();
                setMainClients(clients);
                setFilteredClients(clients);
            } catch (error) {
                toast.error("No RE Generators Added Yet...");
            } finally {
                setLoading(false);
            }
        };

        fetchMainClients();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredClients(mainClients);
        } else {
            const filtered = mainClients.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.abtMainMeter?.meterNumber && client.abtMainMeter.meterNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (client.abtCheckMeter?.meterNumber && client.abtCheckMeter.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredClients(filtered);
        }
    }, [searchTerm, mainClients]);

    const openDeleteDialog = (client) => {
        setClientToDelete(client);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setClientToDelete(null);
    };

    const handleDelete = async () => {
        if (!clientToDelete) return;

        try {
            setDeletingId(clientToDelete._id);
            await deleteMainClient(clientToDelete._id);
            setMainClients(prev => prev.filter(client => client._id !== clientToDelete._id));
            toast.success("RE Generator deleted successfully");
        } catch (error) {
            toast.error("Failed to delete RE Generator: " + error.message);
        } finally {
            setDeletingId(null);
            closeDeleteDialog();
        }
    };

    const navigateToDetails = (clientId) => {
        navigate(`/admin/clients/${clientId}/details`);
    };

    const navigateToLead = () => {
        navigate("/admin/lead");
    };

    return (
        <div className="mx-auto py-4 sm:py-6 px-3 sm:px-4">
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6" />
                        View RE Generator
                    </h1>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search RE Generator..."
                                className="pl-10 border-slate-400 text-sm sm:text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="default"
                            className="gap-1 hover:cursor-pointer text-sm bg-[#055C9D] hover:bg-[#055C9D]/95 dark:text-white"
                            onClick={navigateToLead}
                        >
                            <UserPlus className="h-4 w-4" />
                            <span className="whitespace-nowrap">Add New RE Generator</span>
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <img
                        src={norecord}
                        alt="No Records"
                        className="w-48 h-48 sm:w-72 sm:h-72 opacity-75"
                    />
                    <p className="text-muted-foreground text-sm sm:text-md mt-2 text-center">
                        {searchTerm ? "No clients match your search." : "No clients found."}
                    </p>
                    <Button
                        variant="default"
                        className="gap-1 mt-4 hover:cursor-pointer text-sm bg-[#055C9D] hover:bg-[#055C9D]/95 dark:text-white"
                        onClick={navigateToLead}
                    >
                        <UserPlus className="h-4 w-4" />
                        Add New RE Generator
                    </Button>
                </div>
            ) : (
                <div className="rounded-md border overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader className="bg-gray-100 dark:bg-gray-800">
                            <TableRow>
                                <TableHead className="min-w-[150px] text-center sm:w-[200px] font-semibold whitespace-nowrap">
                                    RE Generator
                                </TableHead>
                                <TableHead className="font-semibold text-center whitespace-nowrap">
                                    Sub Title
                                </TableHead>
                                <TableHead className="font-semibold text-center whitespace-nowrap">
                                    ABT Main Meter
                                </TableHead>
                                <TableHead className="font-semibold text-center whitespace-nowrap">
                                    ABT Check Meter
                                </TableHead>
                                <TableHead className="font-semibold text-center whitespace-nowrap">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow key={client._id}>
                                    <TableCell className="font-medium text-left whitespace-nowrap">
                                        {client.name}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-center">
                                        {client.subTitle || "-"}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-center">
                                        {client.abtMainMeter?.meterNumber || "Not specified"}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-center">
                                        {client.abtCheckMeter?.meterNumber || "Not specified"}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-center">
                                        <div className="flex gap-1 sm:gap-2 justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 hover:cursor-pointer font-semibold px-2 sm:px-3"
                                                onClick={() => navigateToDetails(client._id)}
                                            >
                                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 text-destructive hover:text-destructive font-semibold hover:cursor-pointer px-2 sm:px-3"
                                                onClick={() => openDeleteDialog(client)}
                                                disabled={deletingId === client._id}
                                            >
                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="max-w-[95%] sm:max-w-md border-0 shadow-2xl">
                    <AlertDialogHeader className="space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Delete RE Generator
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                            This action cannot be undone. This will permanently delete{" "}
                            <span className="font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                {clientToDelete?.name}
                            </span>{" "}
                            and all its associated <span className="font-bold"> sub-clients </span> and <span className="font-bold"> part-clients </span> from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
                        <AlertDialogCancel className="w-full sm:w-auto hover:cursor-pointer border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 text-sm  font-medium">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deletingId === clientToDelete?._id}
                            className="w-full sm:w-auto hover:cursor-pointer bg-[#ee264f] hover:bg-[#ee264ee1] text-white border-0 text-sm  font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deletingId === clientToDelete?._id ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Client
                                </span>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ViewClients;