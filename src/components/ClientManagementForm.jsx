
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Initial empty states
const emptyMeterDetails = {
    meterNumber: "",
    modemNumber: "",
    mobileNumber: "",
    simNumber: "",
};

const emptyMainClient = {
    name: "",
    subTitle: "",
    abtMainMeter: { ...emptyMeterDetails },
    abtCheckMeter: { ...emptyMeterDetails },
    voltageLevel: "",
    ctptSrNo: "",
    ctRatio: "",
    ptRatio: "",
    mf: "",
    acCapacityKw: "",
    dcCapacityKwp: "",
    dcAcRatio: "",
    noOfModules: "",
    numbersOfInverter: "",
    sharingPercentage: "",
    contactNo: "",
    email: "",
};

const emptySubClient = {
    name: "",
    divisionName: "",
    consumerNo: "",
    modemSrNo: "",
    abtMainMeter: { ...emptyMeterDetails },
    abtCheckMeter: { ...emptyMeterDetails },
    voltageLevel: "",
    ctptSrNo: "",
    ctRatio: "",
    ptRatio: "",
    mf: "",
    acCapacityKw: "",
    dcCapacityKwp: "",
    dcAcRatio: "",
    noOfModules: "",
    moduleCapacityWp: "",
    inverterCapacityKw: "",
    numberOfInverters: "",
    makeOfInverter: "",
    sharingPercentage: "",
    contactNo: "",
    email: "",
    hasPartClients: false,
    partClients: [],
};

const emptyPartClient = {
    percentageSharing: "",
    divisionName: "",
    consumerNo: "",
};

export default function ClientManagementForm() {
    const [mainClient, setMainClient] = useState({ ...emptyMainClient });
    const [subClients, setSubClients] = useState([]);
    const [activeTab, setActiveTab] = useState("main-client");

    // Handle main client input changes
    const handleMainClientChange = (field, value) => {
        setMainClient((prev) => {
            const updated = { ...prev };

            // Handle nested fields
            if (field.includes(".")) {
                const [parent, child] = field.split(".");
                updated[parent] = {
                    ...updated[parent],
                    [child]: value,
                };
            } else {
                updated[field] = value;
            }

            return updated;
        });
    };


    // Add a new sub client
    const addSubClient = () => {
        setSubClients((prev) => [...prev, { ...emptySubClient }])
        setActiveTab(`sub-client-${subClients.length}`)
    }

    // Handle sub client input changes
    const handleSubClientChange = (index, field, value) => {
        setSubClients((prev) => {
            const updated = [...prev];

            // Handle nested fields
            if (field.includes(".")) {
                const [parent, child] = field.split(".");
                updated[index][parent] = {
                    ...updated[index][parent],
                    [child]: value,
                };
            } else {
                updated[index][field] = value;
            }

            return updated;
        });
    };


    // Remove a sub client
    const removeSubClient = (index) => {
        setSubClients((prev) => prev.filter((_, i) => i !== index))
        setActiveTab("main-client")
    }

    // Add a part client to a sub client
    const addPartClient = (subClientIndex) => {
        setSubClients((prev) => {
            const updated = [...prev]
            updated[subClientIndex].partClients = [...updated[subClientIndex].partClients, { ...emptyPartClient }]
            return updated
        })
    }

    // Handle part client input changes
    const handlePartClientChange = (subClientIndex, partClientIndex, field, value) => {
        setSubClients((prev) => {
            const updated = [...prev];
            updated[subClientIndex].partClients[partClientIndex][field] = value;
            return updated;
        });
    };


    // Remove a part client
    const removePartClient = (subClientIndex, partClientIndex) => {
        setSubClients((prev) => {
            const updated = [...prev]
            updated[subClientIndex].partClients = updated[subClientIndex].partClients.filter((_, i) => i !== partClientIndex)
            return updated
        })
    }

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault()
        alert("Form submitted successfully!")
    }

    return (
        <div className="container mx-auto py-8">
            <form onSubmit={handleSubmit}>
                <Card className="mb-8">
                    <CardHeader className={"bg-transparent"}>
                        <CardTitle className="text-2xl font-bold text-center">Client Management System</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-6 grid grid-cols-12">
                                <TabsTrigger value="main-client" className="col-span-3">
                                    Main Client
                                </TabsTrigger>
                                {subClients.map((_, index) => (
                                    <TabsTrigger key={`sub-client-tab-${index}`} value={`sub-client-${index}`} className="col-span-3">
                                        Sub Client {index + 1}
                                    </TabsTrigger>
                                ))}
                                {subClients.length < 3 && (
                                    <div className="col-span-3 flex justify-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSubClient}
                                            className="flex items-center hover:cursor-pointer gap-1"
                                        >
                                            <Plus className="h-4 w-4" /> Add Sub Client
                                        </Button>
                                    </div>
                                )}
                            </TabsList>

                            {/* Main Client Form */}
                            <TabsContent value="main-client">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Client Name</Label>
                                            <Input
                                                id="name"
                                                value={mainClient.name}
                                                onChange={(e) => handleMainClientChange("name", e.target.value)}
                                                placeholder="Enter client name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subTitle">Sub Title</Label>
                                            <Input
                                                id="subTitle"
                                                value={mainClient.subTitle}
                                                onChange={(e) => handleMainClientChange("subTitle", e.target.value)}
                                                placeholder="Enter sub title"
                                            />
                                        </div>
                                    </div>

                                    {/* ABT Main Meter Section */}
                                    <div className="border rounded-md p-4">
                                        <h3 className="text-lg font-medium mb-4">ABT Main Meter Details</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Meter Number</TableHead>
                                                    <TableHead>Modem Number</TableHead>
                                                    <TableHead>Mobile Number</TableHead>
                                                    <TableHead>SIM Number</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.abtMainMeter.meterNumber}
                                                            onChange={(e) => handleMainClientChange("abtMainMeter.meterNumber", e.target.value)}
                                                            placeholder="Enter meter number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.abtMainMeter.modemNumber}
                                                            onChange={(e) => handleMainClientChange("abtMainMeter.modemNumber", e.target.value)}
                                                            placeholder="Enter modem number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.abtMainMeter.mobileNumber}
                                                            onChange={(e) => handleMainClientChange("abtMainMeter.mobileNumber", e.target.value)}
                                                            placeholder="Enter mobile number"
                                                            type="tel"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.abtMainMeter.simNumber}
                                                            onChange={(e) => handleMainClientChange("abtMainMeter.simNumber", e.target.value)}
                                                            placeholder="Enter SIM number"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* ABT Check Meter Section */}
                                    <div className="border rounded-md p-4">
                                        <h3 className="text-lg font-medium mb-4">ABT Check Meter Details</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Meter Number</TableHead>
                                                    <TableHead>Modem Number</TableHead>
                                                    <TableHead>Mobile Number</TableHead>
                                                    <TableHead>SIM Number</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.abtCheckMeter.meterNumber}
                                                            onChange={(e) => handleMainClientChange("abtCheckMeter.meterNumber", e.target.value)}
                                                            placeholder="Enter meter number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.abtCheckMeter.modemNumber}
                                                            onChange={(e) => handleMainClientChange("abtCheckMeter.modemNumber", e.target.value)}
                                                            placeholder="Enter modem number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.abtCheckMeter.mobileNumber}
                                                            onChange={(e) => handleMainClientChange("abtCheckMeter.mobileNumber", e.target.value)}
                                                            placeholder="Enter mobile number"
                                                            type="tel"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.abtCheckMeter.simNumber}
                                                            onChange={(e) => handleMainClientChange("abtCheckMeter.simNumber", e.target.value)}
                                                            placeholder="Enter SIM number"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Voltage and Capacity Data */}
                                    <div className="border rounded-md p-4">
                                        <h3 className="text-lg font-medium mb-4">Voltage and Capacity Data</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Voltage Level</TableHead>
                                                    <TableHead>CTPT Sr No</TableHead>
                                                    <TableHead>CT Ratio</TableHead>
                                                    <TableHead>PT Ratio</TableHead>
                                                    <TableHead>MF</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.voltageLevel}
                                                            onChange={(e) => handleMainClientChange("voltageLevel", e.target.value)}
                                                            placeholder="Enter voltage level"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.ctptSrNo}
                                                            onChange={(e) => handleMainClientChange("ctptSrNo", e.target.value)}
                                                            placeholder="Enter CTPT Sr No"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.ctRatio}
                                                            onChange={(e) => handleMainClientChange("ctRatio", e.target.value)}
                                                            placeholder="Enter CT Ratio"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.ptRatio}
                                                            onChange={(e) => handleMainClientChange("ptRatio", e.target.value)}
                                                            placeholder="Enter PT Ratio"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.mf}
                                                            onChange={(e) => handleMainClientChange("mf", e.target.value)}
                                                            placeholder="Enter MF"
                                                            type="number"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Capacity Data */}
                                    <div className="border rounded-md p-4">
                                        <h3 className="text-lg font-medium mb-4">Capacity Data</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>AC Capacity (kW)</TableHead>
                                                    <TableHead>DC Capacity (kWp)</TableHead>
                                                    <TableHead>DC/AC Ratio</TableHead>
                                                    <TableHead>No. of Modules</TableHead>
                                                    <TableHead>No. of Inverters</TableHead>
                                                    <TableHead>Sharing Percentage</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.acCapacityKw}
                                                            onChange={(e) => handleMainClientChange("acCapacityKw", e.target.value)}
                                                            placeholder="Enter AC Capacity"
                                                            type="number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.dcCapacityKwp}
                                                            onChange={(e) => handleMainClientChange("dcCapacityKwp", e.target.value)}
                                                            placeholder="Enter DC Capacity"
                                                            type="number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.dcAcRatio}
                                                            onChange={(e) => handleMainClientChange("dcAcRatio", e.target.value)}
                                                            placeholder="Enter DC/AC Ratio"
                                                            type="number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.noOfModules}
                                                            onChange={(e) => handleMainClientChange("noOfModules", e.target.value)}
                                                            placeholder="Enter No. of Modules"
                                                            type="number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.numbersOfInverter}
                                                            onChange={(e) => handleMainClientChange("numbersOfInverter", e.target.value)}
                                                            placeholder="Enter No. of Inverters"
                                                            type="number"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={mainClient.sharingPercentage}
                                                            onChange={(e) => handleMainClientChange("sharingPercentage", e.target.value)}
                                                            placeholder="Enter Sharing %"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="border rounded-md p-4">
                                        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contactNo">Contact Number</Label>
                                                <Input
                                                    id="contactNo"
                                                    value={mainClient.contactNo}
                                                    onChange={(e) => handleMainClientChange("contactNo", e.target.value)}
                                                    placeholder="Enter contact number"
                                                    type="tel"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    value={mainClient.email}
                                                    onChange={(e) => handleMainClientChange("email", e.target.value)}
                                                    placeholder="Enter email address"
                                                    type="email"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Sub Client Forms */}
                            {subClients.map((subClient, subIndex) => (
                                <TabsContent key={`sub-client-${subIndex}`} value={`sub-client-${subIndex}`}>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-semibold">Sub Client {subIndex + 1}</h3>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeSubClient(subIndex)}
                                                className="flex items-center hover:cursor-pointer gap-1"
                                            >
                                                <Trash2 className="h-4 w-4" /> Remove
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`sub-name-${subIndex}`}>Name</Label>
                                                <Input
                                                    id={`sub-name-${subIndex}`}
                                                    value={subClient.name}
                                                    onChange={(e) => handleSubClientChange(subIndex, "name", e.target.value)}
                                                    placeholder="Enter name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`sub-division-${subIndex}`}>Division Name</Label>
                                                <Input
                                                    id={`sub-division-${subIndex}`}
                                                    value={subClient.divisionName}
                                                    onChange={(e) => handleSubClientChange(subIndex, "divisionName", e.target.value)}
                                                    placeholder="Enter division name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`sub-consumer-${subIndex}`}>Consumer No</Label>
                                                <Input
                                                    id={`sub-consumer-${subIndex}`}
                                                    value={subClient.consumerNo}
                                                    onChange={(e) => handleSubClientChange(subIndex, "consumerNo", e.target.value)}
                                                    placeholder="Enter consumer number"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`sub-modem-${subIndex}`}>Modem Sr No</Label>
                                            <Input
                                                id={`sub-modem-${subIndex}`}
                                                value={subClient.modemSrNo}
                                                onChange={(e) => handleSubClientChange(subIndex, "modemSrNo", e.target.value)}
                                                placeholder="Enter modem serial number"
                                            />
                                        </div>

                                        {/* ABT Main Meter Section for Sub Client */}
                                        <div className="border rounded-md p-4">
                                            <h3 className="text-lg font-medium mb-4">ABT Main Meter Details</h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Meter Number</TableHead>
                                                        <TableHead>Modem Number</TableHead>
                                                        <TableHead>Mobile Number</TableHead>
                                                        <TableHead>SIM Number</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Input
                                                                value={subClient.abtMainMeter.meterNumber}
                                                                onChange={(e) =>
                                                                    handleSubClientChange(subIndex, "abtMainMeter.meterNumber", e.target.value)
                                                                }
                                                                placeholder="Enter meter number"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={subClient.abtMainMeter.modemNumber}
                                                                onChange={(e) =>
                                                                    handleSubClientChange(subIndex, "abtMainMeter.modemNumber", e.target.value)
                                                                }
                                                                placeholder="Enter modem number"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={subClient.abtMainMeter.mobileNumber}
                                                                onChange={(e) =>
                                                                    handleSubClientChange(subIndex, "abtMainMeter.mobileNumber", e.target.value)
                                                                }
                                                                placeholder="Enter mobile number"
                                                                type="tel"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={subClient.abtMainMeter.simNumber}
                                                                onChange={(e) =>
                                                                    handleSubClientChange(subIndex, "abtMainMeter.simNumber", e.target.value)
                                                                }
                                                                placeholder="Enter SIM number"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* ABT Check Meter Section for Sub Client */}
                                        <div className="border rounded-md p-4">
                                            <h3 className="text-lg font-medium mb-4">ABT Check Meter Details</h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Meter Number</TableHead>
                                                        <TableHead>Modem Number</TableHead>
                                                        <TableHead>Mobile Number</TableHead>
                                                        <TableHead>SIM Number</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Input
                                                                value={subClient.abtCheckMeter.meterNumber}
                                                                onChange={(e) =>
                                                                    handleSubClientChange(subIndex, "abtCheckMeter.meterNumber", e.target.value)
                                                                }
                                                                placeholder="Enter meter number"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={subClient.abtCheckMeter.modemNumber}
                                                                onChange={(e) =>
                                                                    handleSubClientChange(subIndex, "abtCheckMeter.modemNumber", e.target.value)
                                                                }
                                                                placeholder="Enter modem number"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={subClient.abtCheckMeter.mobileNumber}
                                                                onChange={(e) =>
                                                                    handleSubClientChange(subIndex, "abtCheckMeter.mobileNumber", e.target.value)
                                                                }
                                                                placeholder="Enter mobile number"
                                                                type="tel"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={subClient.abtCheckMeter.simNumber}
                                                                onChange={(e) =>
                                                                    handleSubClientChange(subIndex, "abtCheckMeter.simNumber", e.target.value)
                                                                }
                                                                placeholder="Enter SIM number"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Technical Details for Sub Client */}
                                        <div className="border rounded-md p-4">
                                            <h3 className="text-lg font-medium mb-4">Technical Details</h3>
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-voltage-${subIndex}`}>Voltage Level</Label>
                                                    <Input
                                                        id={`sub-voltage-${subIndex}`}
                                                        value={subClient.voltageLevel}
                                                        onChange={(e) => handleSubClientChange(subIndex, "voltageLevel", e.target.value)}
                                                        placeholder="Enter voltage level"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-ctpt-${subIndex}`}>CTPT Sr No</Label>
                                                    <Input
                                                        id={`sub-ctpt-${subIndex}`}
                                                        value={subClient.ctptSrNo}
                                                        onChange={(e) => handleSubClientChange(subIndex, "ctptSrNo", e.target.value)}
                                                        placeholder="Enter CTPT Sr No"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-ctratio-${subIndex}`}>CT Ratio</Label>
                                                    <Input
                                                        id={`sub-ctratio-${subIndex}`}
                                                        value={subClient.ctRatio}
                                                        onChange={(e) => handleSubClientChange(subIndex, "ctRatio", e.target.value)}
                                                        placeholder="Enter CT Ratio"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-ptratio-${subIndex}`}>PT Ratio</Label>
                                                    <Input
                                                        id={`sub-ptratio-${subIndex}`}
                                                        value={subClient.ptRatio}
                                                        onChange={(e) => handleSubClientChange(subIndex, "ptRatio", e.target.value)}
                                                        placeholder="Enter PT Ratio"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-mf-${subIndex}`}>MF</Label>
                                                    <Input
                                                        id={`sub-mf-${subIndex}`}
                                                        value={subClient.mf}
                                                        onChange={(e) => handleSubClientChange(subIndex, "mf", e.target.value)}
                                                        placeholder="Enter MF"
                                                        type="number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Capacity Data for Sub Client */}
                                        <div className="border rounded-md p-4">
                                            <h3 className="text-lg font-medium mb-4">Capacity Data</h3>
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-ac-${subIndex}`}>AC Capacity (kW)</Label>
                                                    <Input
                                                        id={`sub-ac-${subIndex}`}
                                                        value={subClient.acCapacityKw}
                                                        onChange={(e) => handleSubClientChange(subIndex, "acCapacityKw", e.target.value)}
                                                        placeholder="Enter AC Capacity"
                                                        type="number"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-dc-${subIndex}`}>DC Capacity (kWp)</Label>
                                                    <Input
                                                        id={`sub-dc-${subIndex}`}
                                                        value={subClient.dcCapacityKwp}
                                                        onChange={(e) => handleSubClientChange(subIndex, "dcCapacityKwp", e.target.value)}
                                                        placeholder="Enter DC Capacity"
                                                        type="number"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-ratio-${subIndex}`}>DC/AC Ratio</Label>
                                                    <Input
                                                        id={`sub-ratio-${subIndex}`}
                                                        value={subClient.dcAcRatio}
                                                        onChange={(e) => handleSubClientChange(subIndex, "dcAcRatio", e.target.value)}
                                                        placeholder="Enter DC/AC Ratio"
                                                        type="number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-modules-${subIndex}`}>No. of Modules</Label>
                                                    <Input
                                                        id={`sub-modules-${subIndex}`}
                                                        value={subClient.noOfModules}
                                                        onChange={(e) => handleSubClientChange(subIndex, "noOfModules", e.target.value)}
                                                        placeholder="Enter No. of Modules"
                                                        type="number"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-module-capacity-${subIndex}`}>Module Capacity (Wp)</Label>
                                                    <Input
                                                        id={`sub-module-capacity-${subIndex}`}
                                                        value={subClient.moduleCapacityWp}
                                                        onChange={(e) => handleSubClientChange(subIndex, "moduleCapacityWp", e.target.value)}
                                                        placeholder="Enter Module Capacity"
                                                        type="number"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-inverter-capacity-${subIndex}`}>Inverter Capacity (kW)</Label>
                                                    <Input
                                                        id={`sub-inverter-capacity-${subIndex}`}
                                                        value={subClient.inverterCapacityKw}
                                                        onChange={(e) => handleSubClientChange(subIndex, "inverterCapacityKw", e.target.value)}
                                                        placeholder="Enter Inverter Capacity"
                                                        type="number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inverter Details for Sub Client */}
                                        <div className="border rounded-md p-4">
                                            <h3 className="text-lg font-medium mb-4">Inverter Details</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-num-inverters-${subIndex}`}>Number of Inverters</Label>
                                                    <Input
                                                        id={`sub-num-inverters-${subIndex}`}
                                                        value={subClient.numberOfInverters}
                                                        onChange={(e) => handleSubClientChange(subIndex, "numberOfInverters", e.target.value)}
                                                        placeholder="Enter Number of Inverters"
                                                        type="number"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-make-inverter-${subIndex}`}>Make of Inverter</Label>
                                                    <Input
                                                        id={`sub-make-inverter-${subIndex}`}
                                                        value={subClient.makeOfInverter}
                                                        onChange={(e) => handleSubClientChange(subIndex, "makeOfInverter", e.target.value)}
                                                        placeholder="Enter Make of Inverter"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information for Sub Client */}
                                        <div className="border rounded-md p-4">
                                            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-sharing-${subIndex}`}>Sharing Percentage</Label>
                                                    <Input
                                                        id={`sub-sharing-${subIndex}`}
                                                        value={subClient.sharingPercentage}
                                                        onChange={(e) => handleSubClientChange(subIndex, "sharingPercentage", e.target.value)}
                                                        placeholder="Enter Sharing Percentage"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-contact-${subIndex}`}>Contact No</Label>
                                                    <Input
                                                        id={`sub-contact-${subIndex}`}
                                                        value={subClient.contactNo}
                                                        onChange={(e) => handleSubClientChange(subIndex, "contactNo", e.target.value)}
                                                        placeholder="Enter Contact Number"
                                                        type="tel"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sub-email-${subIndex}`}>Email</Label>
                                                    <Input
                                                        id={`sub-email-${subIndex}`}
                                                        value={subClient.email}
                                                        onChange={(e) => handleSubClientChange(subIndex, "email", e.target.value)}
                                                        placeholder="Enter Email"
                                                        type="email"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Part Client Section */}
                                        <div className="border rounded-md p-4">
                                            <h3 className="text-lg font-medium mb-4">Part Client Information</h3>
                                            <div className="mb-4">
                                                <Label className="mb-2 block">Add Part Clients?</Label>
                                                <RadioGroup
                                                    value={subClient.hasPartClients ? "yes" : "no"}
                                                    onValueChange={(value) => handleSubClientChange(subIndex, "hasPartClients", value === "yes")}
                                                    className="flex space-x-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="yes" id={`part-yes-${subIndex}`} />
                                                        <Label htmlFor={`part-yes-${subIndex}`}>Yes</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="no" id={`part-no-${subIndex}`} />
                                                        <Label htmlFor={`part-no-${subIndex}`}>No</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            {subClient.hasPartClients && (
                                                <div className="space-y-4">
                                                    {subClient.partClients.map((partClient, partIndex) => (
                                                        <div key={`part-client-${subIndex}-${partIndex}`} className="border p-4 rounded-md">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="font-medium">Part Client {partIndex + 1}</h4>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => removePartClient(subIndex, partIndex)}
                                                                    className="flex items-center hover:cursor-pointer gap-1"
                                                                >
                                                                    <Trash2 className="h-4 w-4" /> Remove
                                                                </Button>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`part-percentage-${subIndex}-${partIndex}`}>Percentage Sharing</Label>
                                                                    <Input
                                                                        id={`part-percentage-${subIndex}-${partIndex}`}
                                                                        value={partClient.percentageSharing}
                                                                        onChange={(e) =>
                                                                            handlePartClientChange(subIndex, partIndex, "percentageSharing", e.target.value)
                                                                        }
                                                                        placeholder="Enter Percentage Sharing"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`part-division-${subIndex}-${partIndex}`}>Division Name</Label>
                                                                    <Input
                                                                        id={`part-division-${subIndex}-${partIndex}`}
                                                                        value={partClient.divisionName}
                                                                        onChange={(e) =>
                                                                            handlePartClientChange(subIndex, partIndex, "divisionName", e.target.value)
                                                                        }
                                                                        placeholder="Enter Division Name"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`part-consumer-${subIndex}-${partIndex}`}>Consumer No</Label>
                                                                    <Input
                                                                        id={`part-consumer-${subIndex}-${partIndex}`}
                                                                        value={partClient.consumerNo}
                                                                        onChange={(e) =>
                                                                            handlePartClientChange(subIndex, partIndex, "consumerNo", e.target.value)
                                                                        }
                                                                        placeholder="Enter Consumer No"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => addPartClient(subIndex)}
                                                        className="flex items-center hover:cursor-pointer gap-1"
                                                    >
                                                        <Plus className="h-4 w-4" /> Add Part Client
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" className="flex items-center hover:cursor-pointer gap-2">
                        <Save className="h-4 w-4" /> Save All Client Data
                    </Button>
                </div>
            </form>
        </div>
    )
}

