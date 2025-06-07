"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Upload, Download, Star, Asterisk } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addMainClient,
  addSubClient,
  addPartClientApi,
} from "@/api/leadgenerator";
import { toast } from "sonner";

export default function ClientTableUI() {
  // Field definitions
  const allFields = [
    // Client Name (from Feeder Name in Excel) - Mandatory (yellow)
    {
      id: "name",
      label: "Client Name",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // Wheeling DISCOM - Optional (green)
    {
      id: "discom",
      label: "Wheeling DISCOM",
      type: "text",
      mainClient: false,
      subClient: true,
      partClient: true,
      required: true,
      defaultValue: "DGVCL",
    },
    // Feeder Name (from first row in Excel) - Optional (green)
    {
      id: "subTitle",
      label: "Feeder Name",
      type: "text",
      mainClient: true,
      subClient: false,
      partClient: false,
      required: false,
    },
    // Division Name - Mandatory (yellow)
    {
      id: "divisionName",
      label: "Division Name",
      type: "text",
      mainClient: false,
      subClient: true,
      partClient: true,
      required: true,
    },
    // Consumer No. - Mandatory (yellow)
    {
      id: "consumerNo",
      label: "Consumer No.",
      type: "number",
      mainClient: false,
      subClient: true,
      partClient: true,
      required: true,
    },
    // Modem Sr. No. - Mandatory (yellow)
    {
      id: "abtMainMeter.modemNumber",
      label: "Main Modem Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // ABT MAIN METER Sr. No. - Mandatory (yellow)
    {
      id: "abtMainMeter.meterNumber",
      label: "ABT MAIN METER Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // Mobile Number (Main Meter) - Mandatory (yellow)
    {
      id: "abtMainMeter.mobileNumber",
      label: "Main Mobile Number",
      type: "tel",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // SIM Sr. No. (Main Meter) - Optional (green)
    {
      id: "abtMainMeter.simNumber",
      label: "Main SIM Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Check Meter Modem Sr. No. - Mandatory (yellow)
    {
      id: "abtCheckMeter.modemNumber",
      label: "Check Modem Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // ABT CHECK METER Sr. No. - Mandatory (yellow)
    {
      id: "abtCheckMeter.meterNumber",
      label: "ABT CHECK METER Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Mobile Number (Check Meter) - Mandatory (yellow)
    {
      id: "abtCheckMeter.mobileNumber",
      label: "Check Mobile Number",
      type: "tel",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // SIM Sr. No. (Check Meter) - Optional (green)
    {
      id: "abtCheckMeter.simNumber",
      label: "Check SIM Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Voltage Level - Mandatory (yellow)
    {
      id: "voltageLevel",
      label: "Voltage Level",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // CTPT Sr. No. - Mandatory (yellow)
    {
      id: "ctptSrNo",
      label: "CTPT Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // CT Ratio - Mandatory (yellow)
    {
      id: "ctRatio",
      label: "CT Ratio",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // PT Ratio - Mandatory (yellow)
    {
      id: "ptRatio",
      label: "PT Ratio",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // MF - Mandatory (yellow)
    {
      id: "mf",
      label: "MF",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // AC Capacity-Kw - Mandatory (yellow)
    {
      id: "acCapacityKw",
      label: "AC Capacity-Kw",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
      isCalculated: true,
    },
    // DC Capacity-Kwp - Mandatory (yellow)
    {
      id: "dcCapacityKwp",
      label: "DC Capacity-Kwp",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
      isCalculated: true,
      readOnly: true,
    },
    // DC/AC ratio - Optional (green)
    {
      id: "dcAcRatio",
      label: "DC/AC ratio",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
      isCalculated: true,
    },
    // No. of Modules - Optional (green)
    {
      id: "noOfModules",
      label: "No. of Modules",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
      isCalculated: true,
    },
    // Module Capacity-Wp - Optional (green)
    {
      id: "moduleCapacityWp",
      label: "Module Capacity-Wp",
      type: "number",
      mainClient: false,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Inverter Capacity-Kw - Optional (green)
    {
      id: "inverterCapacityKw",
      label: "Inverter Capacity-Kw",
      type: "number",
      mainClient: false,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Numbers of Inverter - Optional (green)
    {
      id: "numberOfInverters",
      label: "Numbers of Inverter",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
      isCalculated: true,
    },
    // Make of Inverter - Optional (green)
    {
      id: "makeOfInverter",
      label: "Make of Inverter",
      type: "text",
      mainClient: false,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Sharing Percentage - Mandatory (yellow)
    {
      id: "sharingPercentage",
      label: "Sharing Percentage",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: true,
      required: true,
      isCalculated: true,
    },
    // PN Value - Mandatory (yellow)
    {
      id: "pn",
      label: "PN Value",
      type: "select",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
      options: [
        { label: "Positive (+1)", value: "1" },
        { label: "Negative (-1)", value: "-1" },
      ],
      defaultValue: "-1",
    },
    // RE Type - Mandatory (yellow)
    {
      id: "REtype",
      label: "RE Type",
      type: "select",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
      options: [
        { label: "Solar", value: "Solar" },
        { label: "Wind", value: "Wind" },
        { label: "Hybrid", value: "Hybrid" },
      ],
      defaultValue: "Solar",
    },
    // Contact No. - Optional (green)
    {
      id: "contactNo",
      label: "Contact No.",
      type: "tel",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Email - Optional (green)
    {
      id: "email",
      label: "Email",
      type: "email",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
  ];
  // State management
  const [mainClient, setMainClient] = useState({});
  const [subClients, setSubClients] = useState([]);
  const [partClients, setPartClients] = useState({});
  const [subClientCount, setSubClientCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mainClientsList, setMainClientsList] = useState([]);
  const [selectedMainClientId, setSelectedMainClientId] = useState(null);
  const [currentMode, setCurrentMode] = useState("createMain"); // 'createMain', 'selectMain', 'createSub'
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Add this line

  const getInitialFormData = () => {
    // Try to load from localStorage first
    const savedData = loadFromLocalStorage();
    if (savedData) {
      return savedData;
    }

    // Initialize main client with empty values
    const initialMainClient = {};
    allFields.forEach((field) => {
      if (field.mainClient) {
        initialMainClient[field.id] =
          field.defaultValue !== undefined ? field.defaultValue : "";
      }
    });

    // Initialize sub clients
    const initialSubClients = [];
    for (let i = 0; i < 25; i++) {
      const subClient = {};
      allFields.forEach((field) => {
        if (field.subClient) {
          subClient[field.id] =
            field.defaultValue !== undefined ? field.defaultValue : "";
        }
      });
      subClient.hasPartClients = "no";
      initialSubClients.push(subClient);
    }

    return {
      mainClient: initialMainClient,
      subClients: initialSubClients,
      partClients: {},
      subClientCount: 1,
    };
  };

  const manualOverridesRef = useRef({
    acCapacityKw: false,
    dcCapacityKwp: false,
  });

  const STORAGE_KEY = "clientHierarchyData";

  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };
  // Fix the issue with the initializeSubClient function to properly handle pn and REtype values
  const initializeSubClient = (index, savedData = {}) => {
    const subClient = {};
    allFields.forEach((field) => {
      if (field.subClient) {
        // For select fields, ensure we handle them specially
        if (field.id === "pn") {
          subClient[field.id] = savedData[field.id] === "1" ? "1" : "-1";
        } else if (field.id === "REtype") {
          subClient[field.id] = ["Solar", "Wind", "Hybrid"].includes(
            savedData[field.id]
          )
            ? savedData[field.id]
            : "Solar";
        } else {
          subClient[field.id] =
            savedData[field.id] !== undefined
              ? savedData[field.id]
              : field.defaultValue !== undefined
                ? field.defaultValue
                : "";
        }
      }
    });

    subClient.hasPartClients = savedData.hasPartClients || "no";
    subClient.name = savedData.name;

    return subClient;
  };

  // New code: Updated loadFromLocalStorage with fix for SUB RE GENERATOR-01
  const loadFromLocalStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      const parsedData = JSON.parse(data);

      // Ensure select fields have proper values in main client
      if (parsedData.mainClient) {
        parsedData.mainClient.pn =
          parsedData.mainClient.pn === "1" ? "1" : "-1";
        parsedData.mainClient.REtype = ["Solar", "Wind", "Hybrid"].includes(
          parsedData.mainClient.REtype
        )
          ? parsedData.mainClient.REtype
          : "Solar";
      }

      // Ensure select fields have proper values in sub clients
      if (parsedData.subClients) {
        parsedData.subClients = parsedData.subClients.map((subClient) => ({
          ...subClient,
          pn: subClient.pn === "1" ? "1" : "-1",
          REtype: ["Solar", "Wind", "Hybrid"].includes(subClient.REtype)
            ? subClient.REtype
            : "Solar",
          hasPartClients: subClient.hasPartClients || "no",
        }));
      }

      return parsedData;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return null;
    }
  };

  // Helper function to create a default sub client
  const createDefaultSubClient = (index) => {
    const subClient = {};
    allFields.forEach((field) => {
      if (field.subClient) {
        subClient[field.id] =
          field.defaultValue !== undefined ? field.defaultValue : "";
      }
    });
    subClient.hasPartClients = "no";
    subClient.name = `SUB RE GENERATOR-${(index + 1)
      .toString()
      .padStart(2, "0")}`;
    return subClient;
  };

  // Update your initialization useEffect
  useEffect(() => {
    const initializeForm = async () => {
      const savedData = loadFromLocalStorage();
      if (savedData) {
        // Ensure select fields are properly initialized for main client
        const processedMainClient = {
          ...getInitialFormData().mainClient,
          ...savedData.mainClient,
          // Explicitly set these values
          pn: savedData.mainClient?.pn === "1" ? "1" : "-1",
          REtype: ["Solar", "Wind", "Hybrid"].includes(
            savedData.mainClient?.REtype
          )
            ? savedData.mainClient.REtype
            : "Solar",
        };

        // Process subclients with proper initialization
        const processedSubClients =
          savedData.subClients?.length > 0
            ? savedData.subClients.map((subClient, index) =>
              initializeSubClient(index, subClient)
            )
            : [initializeSubClient(0)];

        setMainClient(processedMainClient);
        setSubClients(processedSubClients);
        setPartClients(savedData.partClients || {});
        setSubClientCount(
          savedData.subClientCount || processedSubClients.length
        );
        setIsInitialLoad(false);
        return;
      }

      // Default initialization
      const initialData = getInitialFormData();
      setMainClient(initialData.mainClient);
      setSubClients(initialData.subClients);
      setPartClients(initialData.partClients);
      setSubClientCount(initialData.subClientCount);
      setIsInitialLoad(false);
    };

    initializeForm();
  }, []);

  const clearLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Update the useEffect that saves to localStorage to ensure proper format for select fields
  useEffect(() => {
    if (isInitialLoad) return;

    const saveData = {
      mainClient: {
        ...mainClient,
        // Explicitly set these values to ensure they're saved correctly
        pn: mainClient.pn === "1" ? "1" : "-1",
        REtype: ["Solar", "Wind", "Hybrid"].includes(mainClient.REtype)
          ? mainClient.REtype
          : "Solar",
      },
      subClients: subClients.map((subClient) => ({
        ...subClient,
        // Explicitly set these values for each subclient
        pn: subClient.pn === "1" ? "1" : "-1",
        REtype: ["Solar", "Wind", "Hybrid"].includes(subClient.REtype)
          ? subClient.REtype
          : "Solar",
        hasPartClients: subClient.hasPartClients || "no",
      })),
      partClients,
      subClientCount,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, [mainClient, subClients, partClients, subClientCount, isInitialLoad]);

  // Add this useEffect for calculations
  useEffect(() => {
    if (isInitialLoad) return;

    const calculatedFields = calculateMainClientFields(
      subClients,
      subClientCount
    );

    setMainClient((prev) => {
      const newMainClient = { ...prev };

      // Preserve select fields
      newMainClient.pn = prev.pn || "-1";
      newMainClient.REtype = prev.REtype || "Solar";

      if (
        !manualOverridesRef.current.acCapacityKw ||
        prev.acCapacityKw === ""
      ) {
        newMainClient.acCapacityKw = calculatedFields.acCapacityKw.toString();
      }

      if (
        !manualOverridesRef.current.dcCapacityKwp ||
        prev.dcCapacityKwp === ""
      ) {
        newMainClient.dcCapacityKwp = calculatedFields.dcCapacityKwp.toFixed(2);
      }

      if (newMainClient.acCapacityKw && newMainClient.dcCapacityKwp) {
        newMainClient.dcAcRatio = (
          Number.parseFloat(newMainClient.dcCapacityKwp) /
          Number.parseFloat(newMainClient.acCapacityKw)
        ).toFixed(2);
      }

      newMainClient.noOfModules = subClients.reduce(
        (total, subClient) =>
          total + (Number.parseInt(subClient.noOfModules) || 0),
        0
      );

      newMainClient.numberOfInverters = subClients.reduce(
        (total, subClient) =>
          total + (Number.parseInt(subClient.numberOfInverters) || 0),
        0
      );

      // Set the Sharing Percentage for Main Client to 100%
      newMainClient.sharingPercentage = "100%";

      return newMainClient;
    });

    // Update subclients with sharing percentages and other calculated fields
    const newSubClients = subClients.map((subClient) => {
      const updatedSubClient = { ...subClient };
      updatedSubClient.pn = updatedSubClient.pn || "-1";
      updatedSubClient.REtype = updatedSubClient.REtype || "Solar";

      if (updatedSubClient.dcCapacityKwp && updatedSubClient.acCapacityKw) {
        updatedSubClient.dcAcRatio = (
          Number.parseFloat(updatedSubClient.dcCapacityKwp) /
          Number.parseFloat(updatedSubClient.acCapacityKw)
        ).toFixed(1);
      }

      if (updatedSubClient.acCapacityKw && mainClient.acCapacityKw) {
        updatedSubClient.sharingPercentage =
          (
            (Number.parseFloat(updatedSubClient.acCapacityKw) /
              Number.parseFloat(mainClient.acCapacityKw)) *
            100
          ).toFixed(2) + "%";
      }

      return updatedSubClient;
    });

    // Update subclients if they've changed
    if (JSON.stringify(newSubClients) !== JSON.stringify(subClients)) {
      setSubClients(newSubClients);
    }
  }, [subClients, subClientCount, isInitialLoad, mainClient.acCapacityKw]);

  // calculateMainClientFields function definition
  const calculateMainClientFields = (subClients, subClientCount) => {
    let totalAcCapacityKw = 0;
    let totalDcCapacityKwp = 0;
    let totalNoOfModules = 0;
    let totalNumberOfInverters = 0;

    for (let i = 0; i < subClientCount; i++) {
      const subClient = subClients[i];
      if (subClient) {
        totalAcCapacityKw += Number.parseFloat(subClient.acCapacityKw) || 0;
        totalDcCapacityKwp += Number.parseFloat(subClient.dcCapacityKwp) || 0;
        totalNoOfModules += Number.parseInt(subClient.noOfModules) || 0;
        totalNumberOfInverters +=
          Number.parseInt(subClient.numberOfInverters) || 0; // Sum Numbers of Inverters
      }
    }

    return {
      acCapacityKw: totalAcCapacityKw,
      dcCapacityKwp: totalDcCapacityKwp,
      noOfModules: totalNoOfModules,
      numberOfInverters: totalNumberOfInverters, // Return the sum of Inverters
    };
  };

  // Validation function
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate main client
    allFields.forEach((field) => {
      if (
        field.mainClient &&
        field.required &&
        !mainClient[field.id]?.toString().trim()
      ) {
        newErrors[`main_${field.id}`] = `${field.label} is required`;
        isValid = false;
      }
    });

    // Validate sub clients
    for (let i = 0; i < subClientCount; i++) {
      const subClient = subClients[i];

      if (subClient?.name?.trim()) {
        allFields.forEach((field) => {
          if (
            field.subClient &&
            field.required &&
            !subClient[field.id]?.toString().trim()
          ) {
            newErrors[`sub_${i}_${field.id}`] = `${field.label
              } is required for Sub Client ${i + 1}`;
            isValid = false;
          }
        });

        if (subClient.hasPartClients === "yes" && partClients[i]?.length > 0) {
          partClients[i].forEach((partClient, partIndex) => {
            allFields.forEach((field) => {
              if (
                field.partClient &&
                field.required &&
                !partClient[field.id]?.toString().trim()
              ) {
                newErrors[`part_${i}_${partIndex}_${field.id}`] = `${field.label
                  } is required for Part Client ${partIndex + 1} of Sub Client ${i + 1
                  }`;
                isValid = false;
              }
            });
          });
        }
      }
    }

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  };

  // Handle main client input changes
  const handleMainClientChange = (field, value) => {
    // Check if this is a field we track for manual overrides (AC/DC capacity)
    if (field === "acCapacityKw" || field === "dcCapacityKwp") {
      manualOverridesRef.current[field] = value !== "";
    }

    setMainClient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle sub client input changes
  const handleSubClientChange = (index, field, value) => {
    setSubClients((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      // Only calculate DC Capacity if either module field changes
      if (field === "noOfModules" || field === "moduleCapacityWp") {
        const noOfModules = Number.parseFloat(updated[index].noOfModules) || 0;
        const moduleCapacity =
          Number.parseFloat(updated[index].moduleCapacityWp) || 0;

        // Only update if both fields have valid numbers
        if (
          !isNaN(noOfModules) &&
          !isNaN(moduleCapacity) &&
          moduleCapacity > 0
        ) {
          const dcCapacity = (noOfModules * moduleCapacity) / 1000;
          updated[index].dcCapacityKwp = dcCapacity.toFixed(2);

          // Track if this was a manual override
          manualOverridesRef.current.dcCapacityKwp = false;
        }
      }

      return updated;
    });

    // Recalculate if AC/DC capacity changed
    if (field === "acCapacityKw" || field === "dcCapacityKwp") {
      const calculatedFields = calculateMainClientFields(
        subClients,
        subClientCount
      );

      // Update AC Capacity and DC Capacity automatically unless manually overridden
      setSubClients((prevSubClients) => {
        const updated = [...prevSubClients];
        updated[index] = {
          ...updated[index],
          dcAcRatio: (
            Number.parseFloat(updated[index].dcCapacityKwp) /
            Number.parseFloat(updated[index].acCapacityKw)
          ).toFixed(1), // Calculate DC/AC ratio for the subclient
        };
        return updated;
      });

      setMainClient((prev) => {
        const newMainClient = { ...prev };

        // Update AC Capacity automatically unless manually overridden
        if (
          !manualOverridesRef.current.acCapacityKw ||
          prev.acCapacityKw === ""
        ) {
          newMainClient.acCapacityKw = Number.parseFloat(
            calculatedFields.acCapacityKw
          );
        }

        // Update DC Capacity automatically unless manually overridden
        if (
          !manualOverridesRef.current.dcCapacityKwp ||
          prev.dcCapacityKwp === ""
        ) {
          newMainClient.dcCapacityKwp =
            calculatedFields.dcCapacityKwp.toFixed(2);
        }

        // Calculate DC/AC ratio automatically for Main Client
        if (newMainClient.acCapacityKw && newMainClient.dcCapacityKwp) {
          newMainClient.dcAcRatio = (
            Number.parseFloat(newMainClient.dcCapacityKwp) /
            Number.parseFloat(newMainClient.acCapacityKw)
          ).toFixed(2);
        }

        return newMainClient;
      });
    }

    // Handle "Add Part Clients?" field
    if (field === "hasPartClients") {
      if (value === "no") {
        setPartClients((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      } else if (!partClients[index] || partClients[index].length === 0) {
        addPartClient(index);
      }
    }
  };

  // 1. Update the addPartClient function
  const addPartClient = (subClientIndex) => {
    setPartClients((prev) => {
      const updated = { ...prev };

      if (!updated[subClientIndex]) {
        updated[subClientIndex] = [];
      }

      // Auto part client (now first)
      const autoPartClient = {};
      allFields.forEach((field) => {
        if (field.partClient) {
          // Copy key fields from sub client
          if (['discom', 'divisionName', 'consumerNo'].includes(field.id)) {
            autoPartClient[field.id] = subClients[subClientIndex]?.[field.id] || "";
          } else if (field.id === "sharingPercentage") {
            autoPartClient[field.id] = "100"; // Default to 100%
          } else {
            autoPartClient[field.id] = "";
          }
        }
      });
      autoPartClient.name = `PART CLIENT-01 (Auto)`;

      // Manual part client (now second)
      const manualPartClient = {};
      allFields.forEach((field) => {
        if (field.partClient) {
          manualPartClient[field.id] = "";
        }
      });
      manualPartClient.sharingPercentage = "";
      manualPartClient.name = `PART CLIENT-02`;

      updated[subClientIndex] = [autoPartClient, manualPartClient];
      return updated;
    });

    // Update subclient flag
    setSubClients(prev => {
      const updated = [...prev];
      updated[subClientIndex] = {
        ...updated[subClientIndex],
        hasPartClients: "yes"
      };
      return updated;
    });
  };

  // 2. Update handlePartClientChange to maintain the complementary sharing percentage
  const handlePartClientChange = (subClientIndex, partClientIndex, field, value) => {
    // Validate sharing percentage
    if (field === "sharingPercentage") {
      const numValue = parseFloat(value) || 0;
      value = Math.min(100, Math.max(0, numValue)).toString();
    }

    setPartClients((prev) => {
      const updated = { ...prev };
      if (!updated[subClientIndex]) updated[subClientIndex] = [];
      if (!updated[subClientIndex][partClientIndex]) {
        updated[subClientIndex][partClientIndex] = {};
      }

      updated[subClientIndex][partClientIndex] = {
        ...updated[subClientIndex][partClientIndex],
        [field]: value
      };

      // Auto-update complementary sharing percentage
      if (field === "sharingPercentage" && partClientIndex === 1 && updated[subClientIndex][0]) {
        // When manual part client (index 1) changes, update auto part client (index 0)
        const manualPercentage = parseFloat(value) || 0;
        const autoPercentage = (100 - manualPercentage).toFixed(0);
        updated[subClientIndex][0].sharingPercentage = autoPercentage;
      } else if (field === "sharingPercentage" && partClientIndex === 0 && updated[subClientIndex][1]) {
        // When auto part client (index 0) changes, update manual part client (index 1)
        const autoPercentage = parseFloat(value) || 0;
        const manualPercentage = (100 - autoPercentage).toFixed(0);
        updated[subClientIndex][1].sharingPercentage = manualPercentage;
      }

      return updated;
    });
  };

  // Remove a part client
  // 3. Update removePartClient to remove both part clients
  const removePartClient = (subClientIndex) => {
    setPartClients((prev) => {
      const updated = { ...prev };
      delete updated[subClientIndex];
      return updated;
    });

    setSubClients(prev => {
      const updated = [...prev];
      updated[subClientIndex] = {
        ...updated[subClientIndex],
        hasPartClients: "no"
      };
      return updated;
    });
  };

  // Remove a sub client
  const removeSubClient = (index) => {
    if (subClientCount <= 1) return; // Don't remove if it's the last one

    setSubClients((prev) => {
      const updated = [...prev];
      // Remove the sub client at the index
      updated.splice(index, 1);
      // Add an empty one at the end to maintain the array size
      const emptySubClient = {};
      allFields.forEach((field) => {
        if (field.subClient) {
          emptySubClient[field.id] = "";
        }
      });
      emptySubClient.hasPartClients = "no";
      updated.push(emptySubClient);
      return updated;
    });

    // Remove any part clients for this sub client
    setPartClients((prev) => {
      const updated = { ...prev };
      delete updated[index];

      // Adjust indices for part clients after the deleted one
      const newPartClients = {};
      Object.keys(updated).forEach((key) => {
        const keyNum = Number.parseInt(key);
        if (keyNum > index) {
          newPartClients[keyNum - 1] = updated[key];
        } else {
          newPartClients[key] = updated[key];
        }
      });

      return newPartClients;
    });

    setSubClientCount((prev) => prev - 1);
  };

  // Initialize form
  const initializeForm = () => {
    // Initialize main client with empty values
    const initialMainClient = {};
    allFields.forEach((field) => {
      if (field.mainClient) {
        initialMainClient[field.id] = field.defaultValue || "";
      }
    });
    setMainClient(initialMainClient);

    // Initialize sub clients
    const initialSubClients = [];
    for (let i = 0; i < 50; i++) {
      const subClient = {};
      allFields.forEach((field) => {
        if (field.subClient) {
          subClient[field.id] = field.defaultValue || "";
        }
      });
      subClient.hasPartClients = "no";
      initialSubClients.push(subClient);
    }
    setSubClients(initialSubClients);

    // Initialize part clients
    setPartClients({});
    setSubClientCount(1);
    setSelectedMainClientId(null);
    manualOverridesRef.current = {
      acCapacityKw: false,
      dcCapacityKwp: false,
    };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const { isValid, errors } = validateForm();
    if (!isValid) {
      toast.error("Please check and complete the missing fields.");
      return;
    }

    setLoading(true);

    try {
      // Transform and save Main Client
      const transformedMainClient = transformNestedFields(mainClient);
      const mainClientResponse = await addMainClient(transformedMainClient);
      const mainClientId = mainClientResponse?.client?._id;

      if (!mainClientId)
        throw new Error("Main client ID missing from response");

      // Process Each SubClient
      for (let i = 0; i < subClientCount; i++) {
        const rawSubClient = subClients[i];
        if (!rawSubClient?.name?.trim()) continue; // Skip empty subclients

        // Transform nested fields for sub client
        const transformedSubClient = transformNestedFields(rawSubClient);
        transformedSubClient.mainClient = mainClientId;

        const subClientResponse = await addSubClient(transformedSubClient);
        const subClientId = subClientResponse?.subClient?._id;

        if (!subClientId)
          throw new Error(`Sub client ID missing at index ${i}`);

        // Save Part Clients if needed
        if (
          rawSubClient.hasPartClients === "yes" &&
          partClients[i]?.length > 0
        ) {
          for (let j = 0; j < partClients[i].length; j++) {
            const partClientData = transformNestedFields(partClients[i][j]);
            partClientData.subClientId = subClientId;
            await addPartClientApi(partClientData);
          }
        }
      }

      toast.success("All clients saved successfully!");
      // Reset form after successful save
      const initialData = getInitialFormData();
      setMainClient(initialData.mainClient);
      setSubClients(initialData.subClients);
      setPartClients(initialData.partClients);
      setSubClientCount(initialData.subClientCount);
      setSubmitted(false);
      setErrors({});
      manualOverridesRef.current = {
        acCapacityKw: false,
        dcCapacityKwp: false,
      };

      clearLocalStorage();
      initializeForm();
    } catch (error) {
      toast.error(`Failed to save hierarchy: ${error.message}`);
      console.error("Error saving hierarchy:", error);
    } finally {
      setLoading(false);
    }
  };
  // Helper function to transform nested fields (e.g., "abtMainMeter.meterNumber")
  const transformNestedFields = (data) => {
    const transformed = { ...data };

    // Convert pn to number if it exists
    if (transformed.pn !== undefined) {
      transformed.pn = Number(transformed.pn); // This will convert "-1" to -1 and "1" to 1
    }

    // Define all possible nested field mappings
    const nestedFieldMappings = [
      {
        prefix: "abtMainMeter",
        fields: ["meterNumber", "modemNumber", "mobileNumber", "simNumber"],
      },
      {
        prefix: "abtCheckMeter",
        fields: ["meterNumber", "modemNumber", "mobileNumber", "simNumber"],
      },
    ];

    // Process each nested field group
    nestedFieldMappings.forEach(({ prefix, fields }) => {
      fields.forEach((field) => {
        const flatField = `${prefix}.${field}`;
        if (data[flatField] !== undefined) {
          transformed[prefix] = transformed[prefix] || {};
          transformed[prefix][field] = data[flatField];
          delete transformed[flatField];
        }
      });
    });

    return transformed;
  };

  // Helper function to check if a field has error
  const hasError = (type, index, fieldId, partIndex) => {
    if (type === "main") return !!errors[`main_${fieldId}`];
    if (type === "sub") return !!errors[`sub_${index}_${fieldId}`];
    if (type === "part")
      return !!errors[`part_${index}_${partIndex}_${fieldId}`];
    return false;
  };

  const updateFormData = (processedData) => {
    // Initialize with default values first
    const initialData = getInitialFormData();

    // Helper function to deeply merge objects
    const deepMerge = (target, source) => {
      if (!source) return target;

      for (const key in source) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
          target[key] = deepMerge(target[key] || {}, source[key]);
        } else if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
      return target;
    };

    // Safely update main client
    if (processedData.mainClient) {
      setMainClient(
        deepMerge({ ...initialData.mainClient }, processedData.mainClient)
      );
    } else {
      setMainClient(initialData.mainClient);
    }

    // Update sub clients
    const updatedSubClients = [...initialData.subClients];
    for (let i = 0; processedData.subClients?.length || 0; i++) {
      if (i < updatedSubClients.length) {
        updatedSubClients[i] = deepMerge(
          { ...updatedSubClients[i] },
          processedData.subClients[i] || {}
        );
      } else {
        const newSubClient = {};
        allFields.forEach((field) => {
          if (field.subClient) {
            newSubClient[field.id] = field.defaultValue || "";
          }
        });
        newSubClient.hasPartClients = "no";
        updatedSubClients.push(
          deepMerge(newSubClient, processedData.subClients[i] || {})
        );
      }
    }
    setSubClients(updatedSubClients);

    // Update sub client count
    setSubClientCount(processedData.subClients?.length || 1);

    // Update part clients if any
    setPartClients(processedData.partClients || {});
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const content = await readFileAsText(file);
      const processedData = processCSVData(content);

      // Transform the processed data to match the form state structure
      const transformedData = transformProcessedData(processedData);

      // Update the form state
      updateFormState(transformedData);

      // Force calculations by resetting manual overrides
      manualOverridesRef.current = {
        acCapacityKw: false,
        dcCapacityKwp: false,
      };

      // Trigger a state update to recalculate everything
      setSubClients(prev => [...prev]);

      toast.success("Data imported successfully!");
    } catch (error) {
      console.error("Error importing file:", error);
      toast.error(`Error importing file: ${error.message}`);
    } finally {
      setLoading(false);
      e.target.value = ""; // Reset file input
    }
  };

  // Helper function to transform processed data to match form state structure
  const transformProcessedData = (processedData) => {
    // Transform main client data
    const transformedMainClient = {};
    allFields.forEach((field) => {
      if (field.mainClient) {
        if (
          field.id === "pn" &&
          processedData.mainClient[field.id] !== undefined
        ) {
          // Ensure PN value is either -1 or 1
          transformedMainClient[field.id] =
            processedData.mainClient[field.id] === "-1" ? "-1" : "1";
        } else if (field.id.includes(".")) {
          // Handle nested fields
          const [parent, child] = field.id.split(".");
          if (processedData.mainClient[parent]?.[child] !== undefined) {
            transformedMainClient[field.id] =
              processedData.mainClient[parent][child];
          }
        } else if (processedData.mainClient[field.id] !== undefined) {
          transformedMainClient[field.id] = processedData.mainClient[field.id];
        } else if (field.defaultValue !== undefined) {
          transformedMainClient[field.id] = field.defaultValue;
        }
      }
    });

    // Transform sub clients data
    const transformedSubClients = Array(50)
      .fill()
      .map((_, i) => {
        const subClient = {};
        allFields.forEach((field) => {
          if (field.subClient) {
            if (
              field.id === "pn" &&
              processedData.subClients[i]?.[field.id] !== undefined
            ) {
              // Ensure PN value is either -1 or 1
              subClient[field.id] =
                processedData.subClients[i][field.id] === "-1" ? "-1" : "1";
            } else if (field.id.includes(".")) {
              // Handle nested fields
              const [parent, child] = field.id.split(".");
              if (
                processedData.subClients[i]?.[parent]?.[child] !== undefined
              ) {
                subClient[field.id] =
                  processedData.subClients[i][parent][child];
              } else {
                subClient[field.id] = field.defaultValue || "";
              }
            } else if (processedData.subClients[i]?.[field.id] !== undefined) {
              subClient[field.id] = processedData.subClients[i][field.id];
            } else {
              subClient[field.id] = field.defaultValue || "";
            }
          }
        });
        subClient.hasPartClients = "no"; // Default value

        // Ensure name is set
        if (processedData.subClients[i]?.name) {
          subClient.name = processedData.subClients[i].name;
        } else if (i < processedData.subClientCount) {
          subClient.name = `SUB RE GENERATOR-${(i + 1)
            .toString()
            .padStart(2, "0")}`;
        }

        // Calculate DC Capacity if module fields are present
        if (
          (subClient.noOfModules || subClient.moduleCapacityWp) &&
          !subClient.dcCapacityKwp
        ) {
          const noOfModules = Number.parseFloat(subClient.noOfModules) || 0;
          const moduleCapacity = Number.parseFloat(subClient.moduleCapacityWp) || 0;
          if (!isNaN(noOfModules) && !isNaN(moduleCapacity) && moduleCapacity > 0) {
            subClient.dcCapacityKwp = ((noOfModules * moduleCapacity) / 1000).toFixed(2);
          }
        }

        // Calculate DC/AC ratio if both fields are present
        if (subClient.dcCapacityKwp && subClient.acCapacityKw) {
          subClient.dcAcRatio = (
            Number.parseFloat(subClient.dcCapacityKwp) /
            Number.parseFloat(subClient.acCapacityKw))
            .toFixed(2);
        }

        return subClient;
      });

    return {
      mainClient: transformedMainClient,
      subClients: transformedSubClients,
      subClientCount: processedData.subClientCount || 1,
      partClients: {},
    };
  };

  // Update form state with transformed data
  const updateFormState = (transformedData) => {
    setMainClient(transformedData.mainClient);
    setSubClients(transformedData.subClients);
    setSubClientCount(transformedData.subClientCount);
    setPartClients(transformedData.partClients);
  };

  // Improved CSV data processing
  const processCSVData = (content) => {
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return { mainClient: {}, subClients: [] };

    // Parse CSV with proper handling of quoted fields
    const parsedLines = lines.map((line) => {
      const result = [];
      let inQuotes = false;
      let currentField = "";

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(currentField.trim());
          currentField = "";
        } else {
          currentField += char;
        }
      }
      result.push(currentField.trim());
      return result;
    });

    const headers = parsedLines[0];
    const result = {
      mainClient: {},
      subClients: [],
      subClientCount: 0,
    };

    // Get all sub client headers (SUB RE GENERATOR-01, etc.)
    const subClientHeaders = headers.filter((h) =>
      h.startsWith("SUB RE GENERATOR-")
    );
    result.subClientCount = subClientHeaders.length;

    // Initialize sub clients array
    result.subClients = Array(result.subClientCount)
      .fill()
      .map((_, i) => ({}));

    // Process each data row
    for (let row = 1; row < parsedLines.length; row++) {
      const cells = parsedLines[row];
      const fieldName = cells[0];
      if (!fieldName) continue;

      // Find matching field definition (case-insensitive)
      const fieldDef = allFields.find(
        (f) => f.label.toLowerCase() === fieldName.toLowerCase()
      );

      if (!fieldDef) continue;

      // Special handling for Client Name and Feeder Name
      if (fieldName.toLowerCase() === "client name") {
        // Main client name (LEAD GENERATOR column)
        if (cells[1] && cells[1] !== "N/A") {
          result.mainClient.name = cells[1];
        }
        // Sub client names
        for (let i = 0; i < result.subClientCount; i++) {
          if (cells[2 + i] && cells[2 + i] !== "N/A") {
            result.subClients[i].name =
              cells[2 + i] ||
              `SUB RE GENERATOR-${(i + 1).toString().padStart(2, "0")}`;
          }
        }
        continue;
      }

      if (fieldName.toLowerCase() === "feeder name") {
        // Feeder Name maps to mainClient.subTitle
        if (cells[1] && cells[1] !== "N/A") {
          result.mainClient.subTitle = cells[1];
        }
        continue;
      }

      // Handle RE Type specially (since it's a select field)
      if (fieldName.toLowerCase() === "re type") {
        // Main client RE Type
        if (cells[1] && cells[1] !== "N/A") {
          const reTypeValue = cells[1].trim();
          // Map numeric values to string options
          if (reTypeValue === "-1") {
            result.mainClient.REtype = ""; // Default value
          } else {
            // Try to match with available options
            const reTypeOption = fieldDef.options.find(
              (opt) =>
                opt.label.toLowerCase() === reTypeValue.toLowerCase() ||
                opt.value.toLowerCase() === reTypeValue.toLowerCase()
            );
            result.mainClient.REtype = reTypeOption ? reTypeOption.value : "";
          }
        }

        // Sub client RE Types
        for (let i = 0; i < result.subClientCount; i++) {
          if (cells[2 + i] && cells[2 + i] !== "N/A") {
            const reTypeValue = cells[2 + i].trim();
            if (reTypeValue === "-1") {
              result.subClients[i].REtype = "";
            } else {
              const reTypeOption = fieldDef.options.find(
                (opt) =>
                  opt.label.toLowerCase() === reTypeValue.toLowerCase() ||
                  opt.value.toLowerCase() === reTypeValue.toLowerCase()
              );
              result.subClients[i].REtype = reTypeOption
                ? reTypeOption.value
                : "";
            }
          }
        }
        continue;
      }

      if (fieldName.toLowerCase() === "pn value") {
        // Main client PN value
        if (cells[1] && cells[1] !== "N/A") {
          const pnValue = cells[1].trim();
          result.mainClient.pn = pnValue === "1" ? "1" : "-1"; // Default to -1 if not 1
        }

        // Sub client PN values
        for (let i = 0; i < result.subClientCount; i++) {
          if (cells[2 + i] && cells[2 + i] !== "N/A") {
            const pnValue = cells[2 + i].trim();
            result.subClients[i].pn = pnValue === "1" ? "1" : "-1";
          }
        }
        continue;
      }

      // Process other fields normally
      // Process main client value (second column)
      if (fieldDef.mainClient && cells[1] && cells[1] !== "N/A") {
        const value = parseValue(cells[1], fieldDef.type);
        if (fieldDef.id.includes(".")) {
          const [parent, child] = fieldDef.id.split(".");
          result.mainClient[parent] = result.mainClient[parent] || {};
          result.mainClient[parent][child] = value;
        } else {
          result.mainClient[fieldDef.id] = value;
        }
      }

      // Process sub client values
      for (let i = 0; i < result.subClientCount; i++) {
        const cellIndex = 2 + i;
        if (
          fieldDef.subClient &&
          cells[cellIndex] &&
          cells[cellIndex] !== "N/A"
        ) {
          const value = parseValue(cells[cellIndex], fieldDef.type);
          if (fieldDef.id.includes(".")) {
            const [parent, child] = fieldDef.id.split(".");
            result.subClients[i][parent] = result.subClients[i][parent] || {};
            result.subClients[i][parent][child] = value;
          } else {
            result.subClients[i][fieldDef.id] = value;
          }
        }
      }
    }

    // Calculate DC Capacity for subclients if module fields are present
    result.subClients.forEach((subClient) => {
      if (
        (subClient.noOfModules || subClient.moduleCapacityWp) &&
        !subClient.dcCapacityKwp
      ) {
        const noOfModules = Number.parseFloat(subClient.noOfModules) || 0;
        const moduleCapacity = Number.parseFloat(subClient.moduleCapacityWp) || 0;
        if (!isNaN(noOfModules) && !isNaN(moduleCapacity) && moduleCapacity > 0) {
          subClient.dcCapacityKwp = ((noOfModules * moduleCapacity) / 1000).toFixed(2);
        }
      }
    });

    // Calculate DC/AC ratio for subclients if both fields are present
    result.subClients.forEach((subClient) => {
      if (subClient.dcCapacityKwp && subClient.acCapacityKw) {
        subClient.dcAcRatio = (
          Number.parseFloat(subClient.dcCapacityKwp) /
          Number.parseFloat(subClient.acCapacityKw)
            .toFixed(2));
      }
    });

    // Calculate sharing percentages for subclients
    const totalAcCapacity = result.subClients.reduce((sum, subClient) => {
      return sum + (Number.parseFloat(subClient.acCapacityKw) || 0);
    }, 0);

    if (totalAcCapacity > 0) {
      result.subClients.forEach((subClient) => {
        if (subClient.acCapacityKw) {
          subClient.sharingPercentage = (
            (Number.parseFloat(subClient.acCapacityKw) / totalAcCapacity) *
            100
          ).toFixed(2) + "%";
        }
      });
    }

    // Calculate main client totals
    const calculatedFields = calculateMainClientFields(result.subClients, result.subClientCount);
    result.mainClient = {
      ...result.mainClient,
      acCapacityKw: result.mainClient.acCapacityKw || calculatedFields.acCapacityKw.toString(),
      dcCapacityKwp: result.mainClient.dcCapacityKwp || calculatedFields.dcCapacityKwp.toFixed(2),
      noOfModules: result.mainClient.noOfModules || calculatedFields.noOfModules,
      numberOfInverters: result.mainClient.numberOfInverters || calculatedFields.numberOfInverters,
      sharingPercentage: "100%"
    };

    // Calculate DC/AC ratio for main client if both fields are present
    if (result.mainClient.dcCapacityKwp && result.mainClient.acCapacityKw) {
      result.mainClient.dcAcRatio = (
        Number.parseFloat(result.mainClient.dcCapacityKwp) /
        Number.parseFloat(result.mainClient.acCapacityKw)
          .toFixed(2));
    }

    return result;
  };
  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const lines = content.split("\n");
          const headers = lines[0].split(",").map((h) => h.trim());

          // Process the CSV data
          const processedData = processCSVData(lines, headers);

          // Update state with the processed data
          updateFormData(processedData);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading CSV file"));
      };

      reader.readAsText(file);
    });
  };

  // Improved value parsing
  const parseValue = (value, type) => {
    if (!value || value === "N/A" || value === "null") return "";

    value = value.toString().trim();

    // Handle scientific notation for numbers
    if (value.includes("E") && (type === "tel" || type === "number")) {
      const num = Number.parseFloat(value);
      return isNaN(num) ? "" : num.toString();
    }

    switch (type) {
      case "number":
        const num = Number.parseFloat(value.replace(/,/g, ""));
        return isNaN(num) ? "" : num;
      case "tel":
        // Remove any non-digit characters
        return value.replace(/\D/g, "");
      case "email":
        return value.toLowerCase();
      case "select":
        // Special handling for PN Value
        if (value === "-1" || value === "1") {
          return value; // Keep as string to match select options
        }
        // Convert to number if the value is numeric
        if (!isNaN(value)) {
          return Number(value);
        }
        return value;
      default:
        return value;
    }
  };

  const exportTemplate = () => {
    // Create CSV header rows
    const headers = [
      [
        "Field Name",
        "LEAD RE GENERATOR",
        "SUB RE GENERATOR-01",
        "SUB RE GENERATOR-02",
        "SUB RE GENERATOR-03",
      ],
    ];

    // Add all field rows including name, subTitle, and discom
    allFields.forEach((field, index) => {
      const row = [field.label];

      // Add main client cell
      row.push(field.mainClient ? "" : "N/A");

      // Add sub client cells
      for (let i = 0; i < 3; i++) {
        row.push(field.subClient ? "" : "N/A");
      }

      headers.push(row);
    });

    // Convert to CSV string
    const csvContent = headers.map((row) => row.join(",")).join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "client_data_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputBorderStyle = "border-1 border-gray-400 dark:border-gray-600";

  // Render the table UI
  return (
    <div className="max-w-[1600px] mx-auto py-4">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                Client Management System
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex items-center  gap-1 hover:cursor-pointer"
                  disabled={loading}
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save All"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-1 border-destructive text-destructive hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer"
                  onClick={() => {
                    clearLocalStorage();
                    initializeForm();
                    setSubmitted(false); // Reset submitted state
                    setErrors({}); // Clear all errors
                    toast.success("Cleared Table form data.");
                  }}
                >
                  Clear Data
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-1 hover:cursor-pointer border-slate-500"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Excel/CSV
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-1 hover:cursor-pointer border-slate-500"
                  onClick={exportTemplate}
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <div className={`overflow-x-auto`}>
                <Table
                  className={`border-collapse ${subClientCount > 5
                    ? "min-w-[calc(1000px + (14rem * (subClientCount - 5)))]"
                    : ""
                    }`}
                >
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-12 border border-border bg-muted font-bold sticky left-0 z-20">
                        Sr. No.
                      </TableHead>
                      <TableHead className="w-64 border border-border bg-muted font-bold sticky left-12 z-20">
                        Field Name
                      </TableHead>
                      <TableHead className="w-64 border border-border bg-sky-200 dark:text-black font-bold min-w-[16rem]">
                        LEAD RE GENERATOR
                      </TableHead>
                      {Array.from({ length: subClientCount }).map(
                        (_, index) => (
                          <TableHead
                            key={`sub-header-${index}`}
                            className={`w-64 border border-border bg-purple-200 dark:text-black font-bold min-w-[14rem]`}
                          >
                            <div className="flex justify-between items-center">
                              <span>
                                SUB RE GENERATOR-
                                {(index + 1).toString().padStart(2, "0")}
                              </span>
                              <div className="flex gap-1">
                                {index === subClientCount - 1 &&
                                  subClientCount < 50 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setSubClientCount((prev) =>
                                          Math.min(prev + 1, 50)
                                        )
                                      }
                                      className="h-6 w-6 p-0 hover:cursor-pointer"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  )}
                                {subClientCount > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSubClient(index)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableHead>
                        )
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Client Name Row */}
                    <TableRow className="bg-muted">
                      <TableCell className="border border-border sticky left-0 z-10 bg-inherit">
                        *
                      </TableCell>
                      <TableCell className="border border-border sticky left-12 z-10 bg-inherit">
                        RE GENERATOR =&gt;
                      </TableCell>
                      <TableCell className="border border-border">
                        <Input
                          value={mainClient.name || ""}
                          onChange={(e) =>
                            handleMainClientChange("name", e.target.value)
                          }
                          placeholder="Enter RE Generator name"
                          className={cn("h-8 border", {
                            "border-border": !(
                              submitted && !mainClient.name?.trim()
                            ),
                            "border border-red-400":
                              submitted && !mainClient.name?.trim(),
                          })}
                        />
                      </TableCell>
                      {Array.from({ length: subClientCount }).map(
                        (_, index) => {
                          return (
                            <TableCell
                              key={`sub-name-${index}`}
                              className="border border-border"
                            >
                              <Input
                                value={subClients[index]?.name || ""}
                                onChange={(e) =>
                                  handleSubClientChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder={`Enter Sub RE Generator ${index + 1
                                  } name`}
                              />
                            </TableCell>
                          );
                        }
                      )}
                    </TableRow>

                    {/* Field Rows */}
                    {allFields.map((field, rowIndex) => {
                      if (field.id === "name") return null;

                      return (
                        <TableRow
                          key={field.id}
                          className={
                            rowIndex % 2 === 0
                              ? "bg-muted border border-r-2"
                              : "bg-white border border-r-2"
                          }
                        >
                          <TableCell className="border border-border sticky left-0 z-10 bg-inherit">
                            {rowIndex}
                          </TableCell>
                          <TableCell className="border border-border sticky left-12 z-10 bg-inherit">
                            <div className="flex">
                              {field.label}
                              {field.required && <Asterisk className="h-3 w-3 ms-2 text-red-500" />}
                            </div>
                          </TableCell>

                          <TableCell className="border border-border">
                            {field.mainClient ? (
                              field.type === "select" && field.id === "pn" ? (
                                <Select
                                  value={mainClient[field.id] || ""}
                                  onValueChange={(value) =>
                                    handleMainClientChange(field.id, value)
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue
                                      placeholder={`Select ${field.label.toLowerCase()}`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === "select" &&
                                field.id === "REtype" ? (
                                <Select
                                  value={mainClient[field.id] || ""}
                                  onValueChange={(value) =>
                                    handleMainClientChange(field.id, value)
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue
                                      placeholder={`Select ${field.label.toLowerCase()}`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === "select" ? (
                                <Select
                                  value={mainClient[field.id] || ""}
                                  onValueChange={(value) =>
                                    handleMainClientChange(field.id, value)
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue
                                      placeholder={`Select ${field.label.toLowerCase()}`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  type={field.type}
                                  value={mainClient[field.id] || ""}
                                  onChange={(e) =>
                                    handleMainClientChange(
                                      field.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  className={cn(`h-8 ${inputBorderStyle}`, {
                                    "border-border": !(
                                      submitted &&
                                      field.required &&
                                      !mainClient[field.id]?.toString().trim()
                                    ),
                                    "border-destructive":
                                      submitted &&
                                      field.required &&
                                      !mainClient[field.id]?.toString().trim(),
                                  })}
                                />
                              )
                            ) : (
                              <Input
                                disabled
                                className="border-none h-8 bg-gray-100 text-gray-400"
                                placeholder="N/A"
                              />
                            )}
                          </TableCell>

                          {Array.from({ length: subClientCount }).map(
                            (_, index) => (
                              <TableCell
                                key={`${field.id}-sub-${index}`}
                                className="border border-border"
                              >
                                {field.subClient ? (
                                  field.type === "select" &&
                                    field.id === "pn" ? (
                                    <Select
                                      value={
                                        subClients[index]?.[field.id] || ""
                                      }
                                      onValueChange={(value) =>
                                        handleSubClientChange(
                                          index,
                                          field.id,
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue
                                          placeholder={`Select ${field.label.toLowerCase()}`}
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options.map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={option.value}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : field.type === "select" &&
                                    field.id === "REtype" ? (
                                    <Select
                                      value={
                                        subClients[index]?.[field.id] || ""
                                      }
                                      onValueChange={(value) =>
                                        handleSubClientChange(
                                          index,
                                          field.id,
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue
                                          placeholder={`Select ${field.label.toLowerCase()}`}
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options.map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={option.value}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : field.type === "select" ? (
                                    <Select
                                      value={
                                        subClients[index]?.[field.id] || ""
                                      }
                                      onValueChange={(value) =>
                                        handleSubClientChange(
                                          index,
                                          field.id,
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue
                                          placeholder={`Select ${field.label.toLowerCase()}`}
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options.map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={option.value}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      type={field.type}
                                      value={
                                        subClients[index]?.[field.id] || ""
                                      }
                                      onChange={(e) =>
                                        handleSubClientChange(
                                          index,
                                          field.id,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Enter ${field.label.toLowerCase()}`}
                                      className={cn(`h-8 ${inputBorderStyle}`, {
                                        "border-border": !(
                                          submitted &&
                                          field.required &&
                                          subClients[index]?.name?.trim() &&
                                          !subClients[index]?.[field.id]
                                            ?.toString()
                                            .trim()
                                        ),
                                        "border border-destructive":
                                          submitted &&
                                          field.required &&
                                          subClients[index]?.name?.trim() &&
                                          !subClients[index]?.[field.id]
                                            ?.toString()
                                            .trim(),
                                      })}
                                    />
                                  )
                                ) : (
                                  <Input
                                    disabled
                                    className="border-none h-8 bg-gray-100 text-gray-400"
                                    placeholder="N/A"
                                  />
                                )}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      );
                    })}

                    {/* Part Client Toggle Row */}
                    <TableRow className="bg-orange-50">
                      <TableCell className="border border-border sticky left-0 z-10 bg-inherit">
                        *
                      </TableCell>
                      <TableCell className="border border-border sticky left-12 z-10 bg-inherit">
                        Add Part Clients?
                      </TableCell>
                      <TableCell className="border border-border">
                        <div className="flex justify-center">
                          <span className="text-gray-500 italic">N/A</span>
                        </div>
                      </TableCell>

                      {Array.from({ length: subClientCount }).map(
                        (_, index) => (
                          <TableCell
                            key={`part-toggle-${index}`}
                            className="border border-border"
                          >
                            <div className="flex justify-center items-center gap-2">
                              <Select
                                value={
                                  subClients[index]?.hasPartClients || "no"
                                }
                                onValueChange={(value) =>
                                  handleSubClientChange(
                                    index,
                                    "hasPartClients",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-24 h-8 border-none">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              {subClientCount > 5 && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-900 pointer-events-none"></div>
              )}
            </div>

            {/* Part Client Tables */}
            {Object.entries(partClients).map(
              ([subIndexStr, subPartClients]) => {
                const subIndex = Number.parseInt(subIndexStr);
                if (
                  subClients[subIndex]?.hasPartClients !== "yes" ||
                  subPartClients.length === 0
                )
                  return null;

                return (
                  <div
                    key={`part-client-section-${subIndex}`}
                    className="mt-6 border-t-2 border-primary/20 pt-4"
                  >
                    <h3 className="text-lg font-semibold mb-2 px-4">
                      Part Clients for{" "}
                      {subClients[subIndex]?.name ||
                        `Sub RE Generator ${subIndex + 1}`}
                    </h3>

                    <Table className="border-collapse">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 border border-border bg-muted font-bold ">
                            Sr. No.
                          </TableHead>
                          <TableHead className="w-64 border border-border bg-muted font-bold ">
                            Field Name
                          </TableHead>

                          {subPartClients.map((_, partIndex) => (
                            <TableHead
                              key={`part-header-${subIndex}-${partIndex}`}
                              className="w-64 border border-border bg-orange-100 dark:text-black font-bold"
                            >
                              <div className="flex justify-between items-center">
                                <span>
                                  PART CLIENT-
                                  {(partIndex + 1).toString().padStart(2, "0")}
                                  {partIndex === 0 ? " (Auto)" : ""}
                                </span>
                                <div className="flex gap-1">
                                  {partIndex === subPartClients.length - 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => addPartClient(subIndex)}
                                      className="h-6 w-6 p-0 hover:cursor-pointer hover:bg-white hover:text-primary"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removePartClient(subIndex)
                                    }
                                    className="h-6 w-6 p-0 text-destructive hover:bg-white hover:text-destructive hover:cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allFields
                          .filter((field) => field.partClient)
                          .map((field, rowIndex) => (
                            <TableRow
                              key={`part-field-${subIndex}-${field.id}`}
                              className={rowIndex % 2 === 0 ? "bg-muted" : ""}
                            >
                              <TableCell className="border border-border">
                                {rowIndex + 1}
                              </TableCell>
                              <TableCell className="border border-border">
                                <div className="flex">
                                  {field.label}
                                  {field.required && <Asterisk className="h-3 w-3 ms-2 text-red-500" />}
                                </div>
                              </TableCell>

                              {subPartClients.map((partClient, partIndex) => (
                                <TableCell key={`part-value-${subIndex}-${partIndex}-${field.id}`} className="border border-border">
                                  {partIndex === 0 ? ( // First part client (auto-generated)
                                    <Input
                                      type={field.type}
                                      value={partClient[field.id] || ""}
                                      readOnly
                                      className={`h-8 ${inputBorderStyle} bg-gray-100`}
                                    />
                                  ) : (
                                    <Input
                                      type={field.type}
                                      value={partClient[field.id] || ""}
                                      onChange={(e) =>
                                        handlePartClientChange(
                                          subIndex,
                                          partIndex,
                                          field.id,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Enter ${field.label.toLowerCase()}`}
                                      className={cn(`h-8 ${inputBorderStyle}`, {
                                        "border-border": !(
                                          submitted &&
                                          field.required &&
                                          !partClient[field.id]?.toString().trim()
                                        ),
                                        "border-destructive":
                                          submitted &&
                                          field.required &&
                                          !partClient[field.id]?.toString().trim(),
                                      })}
                                    />
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
