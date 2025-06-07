"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronLeft, Trash2, Edit, Save, Plus, FileDown, History, Asterisk, AlertCircle, AlertTriangle } from "lucide-react"
import {
  getMainClient,
  getAllSubClients,
  deleteSubClient,
  editMainClientField,
  editSubClientField,
  editPartClientField,
  addSubClient,
  getAllPartClients,
  addPartClientApi,
  deletePartClient,
} from "@/api/leadgenerator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientDetailsPDF } from "./ClientDetailsPDF"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
// import ClientDetailsPDF from "./ClientDetailsPDF";

const ClientDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mainClient, setMainClient] = useState(null)
  const [subClients, setSubClients] = useState([])
  const [partClients, setPartClients] = useState({})
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [editedData, setEditedData] = useState({
    mainClient: null,
    subClients: [],
    partClients: {},
  })
  const [activeTab, setActiveTab] = useState("details")
  const [subClientCount, setSubClientCount] = useState(1)
  const [errors, setErrors] = useState({})
  const [fieldHistory, setFieldHistory] = useState({
    main: {},
    sub: {},
    part: {},
  })

  // Field definitions with placeholders
  const allFields = [
    // Client Name (from Feeder Name in Excel)
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
      defaultValue: "DISCOM",
    },
    // Feeder Name (from first row in Excel)
    {
      id: "subTitle",
      label: "Feeder Name",
      type: "text",
      mainClient: true,
      subClient: false,
      partClient: false,
      required: false,
    },
    // Basic Information
    {
      id: "divisionName",
      label: "Division Name",
      type: "text",
      mainClient: false,
      subClient: true,
      partClient: true,
      required: true,
    },
    {
      id: "consumerNo",
      label: "Consumer No.",
      type: "number",
      mainClient: false,
      subClient: true,
      partClient: true,
      required: true,
    },
    // ABT Main Meter Details
    {
      id: "abtMainMeter.modemNumber",
      label: "Main Modem Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    {
      id: "abtMainMeter.meterNumber",
      label: "ABT MAIN METER Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    {
      id: "abtMainMeter.mobileNumber",
      label: "Main Mobile Number",
      type: "tel",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    {
      id: "abtMainMeter.simNumber",
      label: "Main SIM Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // ABT Check Meter Details
    {
      id: "abtCheckMeter.modemNumber",
      label: "Check Modem Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    {
      id: "abtCheckMeter.meterNumber",
      label: "ABT CHECK METER Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    {
      id: "abtCheckMeter.mobileNumber",
      label: "Check Mobile Number",
      type: "tel",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    {
      id: "abtCheckMeter.simNumber",
      label: "Check SIM Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Voltage Level
    {
      id: "voltageLevel",
      label: "Voltage Level",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    // CTPT Sr. No.
    {
      id: "ctptSrNo",
      label: "CTPT Sr. No.",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    {
      id: "ctRatio",
      label: "CT Ratio",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    {
      id: "ptRatio",
      label: "PT Ratio",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    {
      id: "mf",
      label: "MF",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
    },
    // Capacity Details
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
    {
      id: "dcCapacityKwp",
      label: "DC Capacity-Kwp",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
      isCalculated: true,
    },
    {
      id: "dcAcRatio",
      label: "DC/AC ratio",
      type: "number",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
      isCalculated: true,
      readOnly: true,
    },
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
    {
      id: "moduleCapacityWp",
      label: "Module Capacity-Wp",
      type: "number",
      mainClient: false,
      subClient: true,
      partClient: false,
      required: false,
    },
    {
      id: "inverterCapacityKw",
      label: "Inverter Capacity-Kw",
      type: "number",
      mainClient: false,
      subClient: true,
      partClient: false,
      required: false,
    },
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
    {
      id: "makeOfInverter",
      label: "Make of Inverter",
      type: "text",
      mainClient: false,
      subClient: true,
      partClient: false,
      required: false,
    },
    // Sharing and Contact Info
    {
      id: "sharingPercentage",
      label: "Sharing Percentage",
      type: "text",
      mainClient: true,
      subClient: true,
      partClient: true,
      required: true,
      isCalculated: true,
      readOnly: true,
    },
    {
      id: "pn",
      label: "PN Value",
      type: "select",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: true,
      options: [
        { label: "Positive (+1)", value: 1 },
        { label: "Negative (-1)", value: -1 },
      ],
      defaultValue: -1,
    },
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
    {
      id: "contactNo",
      label: "Contact No.",
      type: "tel",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      mainClient: true,
      subClient: true,
      partClient: false,
      required: false,
    },
  ]

  // Process history data when client data is loaded
  useEffect(() => {
    if (mainClient?.history) {
      const mainHistory = processHistory(mainClient.history)
      setFieldHistory((prev) => ({
        ...prev,
        main: mainHistory,
      }))
    }
  }, [mainClient])

  useEffect(() => {
    if (subClients.length > 0) {
      const subHistory = {}

      subClients.forEach((subClient) => {
        if (subClient.history) {
          subHistory[subClient._id] = processHistory(subClient.history)
        } else {
          subHistory[subClient._id] = {}
        }
      })

      setFieldHistory((prev) => ({
        ...prev,
        sub: subHistory,
      }))
    }
  }, [subClients])

  useEffect(() => {
    if (partClients && Object.keys(partClients).length > 0) {
      const partHistory = {}

      Object.values(partClients).forEach((parts) => {
        parts.forEach((part) => {
          if (part.history) {
            partHistory[part._id] = processHistory(part.history)
          } else {
            partHistory[part._id] = {}
          }
        })
      })

      setFieldHistory((prev) => ({
        ...prev,
        part: partHistory,
      }))
    }
  }, [partClients])

  // Helper function to process history array into a structured format
  const processHistory = (historyArray) => {
    const historyMap = {}

    historyArray?.forEach((item) => {
      // Normalize field names - keep the structure but lowercase the components
      const fieldName = item.fieldName
        .split(".")
        .map((part) => part.toLowerCase())
        .join(".")

      if (!historyMap[fieldName]) {
        historyMap[fieldName] = []
      }

      historyMap[fieldName].push({
        oldValue: item.oldValue,
        newValue: item.newValue,
        date: new Date(item.updatedAt).toLocaleString(),
      })
    })

    return historyMap
  }

  // Function to render history tooltip content
  const renderHistoryTooltip = (historyEntries) => {
    if (!historyEntries || historyEntries.length === 0) return null

    return (
      <div className="max-w-xs">
        <h4 className="font-semibold mb-1">Change History:</h4>
        <ul className="space-y-1">
          {historyEntries.map((entry, idx) => (
            <li key={idx} className="text-xs">
              <span className="font-medium">Changed on {entry.date}:</span>
              <br />
              From <span className="text-red-500">{entry.oldValue}</span> to{" "}
              <span className="text-green-500">{entry.newValue}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const getFieldHistory = (type, id, fieldId) => {
    if (!id || !fieldId) return null

    // Normalize fieldId by lowercasing each part of the path
    const normalizedFieldId = fieldId
      .split(".")
      .map((part) => part.toLowerCase())
      .join(".")

    if (type === "main") {
      return fieldHistory.main?.[normalizedFieldId] || null
    } else if (type === "sub") {
      return fieldHistory.sub?.[id]?.[normalizedFieldId] || null
    } else if (type === "part") {
      return fieldHistory.part?.[id]?.[normalizedFieldId] || null
    }
    return null
  }

  const calculateMainClientFields = (subClients) => {
    let totalAcCapacityKw = 0
    let totalDcCapacityKwp = 0
    let totalNoOfModules = 0
    let totalNumberOfInverters = 0

    subClients.forEach((subClient) => {
      totalAcCapacityKw += Number.parseFloat(subClient.acCapacityKw) || 0
      totalDcCapacityKwp += Number.parseFloat(subClient.dcCapacityKwp) || 0
      totalNoOfModules += Number.parseInt(subClient.noOfModules) || 0
      totalNumberOfInverters += Number.parseInt(subClient.numberOfInverters) || 0
    })

    return {
      acCapacityKw: totalAcCapacityKw,
      dcCapacityKwp: totalDcCapacityKwp,
      noOfModules: totalNoOfModules,
      numberOfInverters: totalNumberOfInverters,
    }
  }

  // Automatically update main client values based on subclient values
  // Replace your current useEffect with this:
  useEffect(() => {
    // Only recalculate in view mode (not in edit mode)
    if (!isEditing && subClients && subClients.length > 0) {
      const calculatedFields = calculateMainClientFields(subClients)

      setMainClient((prev) => {
        if (!prev) return prev

        const newMainClient = { ...prev }

        // Only update if the values actually changed
        if (calculatedFields.acCapacityKw !== Number.parseFloat(prev.acCapacityKw || 0)) {
          newMainClient.acCapacityKw = calculatedFields.acCapacityKw.toString()
        }

        if (calculatedFields.dcCapacityKwp !== Number.parseFloat(prev.dcCapacityKwp || 0)) {
          newMainClient.dcCapacityKwp = calculatedFields.dcCapacityKwp.toString()
        }

        // Recalculate DC/AC ratio only if both capacities exist
        if (newMainClient.acCapacityKw && newMainClient.dcCapacityKwp) {
          const newRatio = (
            Number.parseFloat(newMainClient.dcCapacityKwp) / Number.parseFloat(newMainClient.acCapacityKw)
          ).toFixed(2)

          if (newRatio !== prev.dcAcRatio) {
            newMainClient.dcAcRatio = newRatio
          }
        }

        // Update other calculated fields similarly
        const totalNoOfModules = subClients.reduce(
          (total, subClient) => total + (Number.parseInt(subClient.noOfModules) || 0),
          0,
        )
        if (totalNoOfModules !== Number.parseInt(prev.noOfModules || 0)) {
          newMainClient.noOfModules = totalNoOfModules.toString()
        }

        const totalNumberOfInverters = subClients.reduce(
          (total, subClient) => total + (Number.parseInt(subClient.numberOfInverters) || 0),
          0,
        )
        if (totalNumberOfInverters !== Number.parseInt(prev.numberOfInverters || 0)) {
          newMainClient.numberOfInverters = totalNumberOfInverters.toString()
        }

        return newMainClient
      })
    }
  }, [subClients, subClientCount, isEditing]) // Added isEditing to dependencies

  // Validation function

  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    // Validate main client
    const currentMainClient = isEditing ? editedData.mainClient : mainClient

    allFields.forEach((field) => {
      if (field.mainClient && field.required) {
        const value = getNestedValue(currentMainClient, field.id)

        // Skip validation for auto-calculated fields
        if (field.isCalculated) return

        if (field.type === "select") {
          // For select fields, check if value exists (can be 0, false, etc.)
          if (value === undefined || value === null || value === "") {
            newErrors[`main_${field.id}`] = `${field.label} is required`
            isValid = false
          }
        } else if (!value?.toString().trim()) {
          newErrors[`main_${field.id}`] = `${field.label} is required`
          isValid = false
        }
      }
    })

    // Validate sub clients
    const currentSubClients = isEditing ? editedData.subClients : subClients

    for (let i = 0; i < subClientCount; i++) {
      const subClient = currentSubClients[i] || {}
      const hasSubClientData = allFields.some(
        (field) => field.subClient && getNestedValue(subClient, field.id)?.toString().trim(),
      )

      if (hasSubClientData) {
        allFields.forEach((field) => {
          if (field.subClient && field.required) {
            // Skip validation for auto-calculated fields
            if (field.isCalculated) return

            const value = getNestedValue(subClient, field.id)

            if (field.type === "select") {
              // For select fields, check if value exists (can be 0, false, etc.)
              if (value === undefined || value === null || value === "") {
                newErrors[`sub_${i}_${field.id}`] = `${field.label} is required for Sub Client ${i + 1}`
                isValid = false
              }
            } else if (!value?.toString().trim()) {
              newErrors[`sub_${i}_${field.id}`] = `${field.label} is required for Sub Client ${i + 1}`
              isValid = false
            }
          }
        })
      }
    }

    setErrors(newErrors)
    return { isValid, errors: newErrors }
  }

  // Updated getNestedValue function to better handle nested objects
  const getNestedValue = (obj, path) => {
    if (!obj) return ""
    if (obj[path] !== undefined) return obj[path]

    try {
      return path.split(".").reduce((o, p) => {
        // Handle cases where intermediate objects might be null/undefined
        if (o === null || o === undefined) return ""
        return o[p] || ""
      }, obj)
    } catch (e) {
      console.error(`Error getting nested value for path ${path}:`, e)
      return ""
    }
  }

  // Fetch client data
  // Fetch initial data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)
        const [mainClientData, allSubClients] = await Promise.all([getMainClient(id), getAllSubClients()])

        const filteredSubClients = allSubClients.filter(
          (subClient) => subClient.mainClient === id || subClient.mainClient._id === id,
        )

        const partClientsData = {}
        if (filteredSubClients.length > 0) {
          try {
            const allPartClients = await getAllPartClients()

            filteredSubClients.forEach((subClient) => {
              const partsForSubClient = allPartClients.filter(
                (partClient) =>
                  partClient.subClient === subClient._id ||
                  (typeof partClient.subClient === "object" && partClient.subClient._id === subClient._id),
              )

              if (partsForSubClient.length > 0) {
                partClientsData[subClient._id] = partsForSubClient
              }
            })
          } catch (error) {
            console.error("Error fetching part clients:", error)
            // If part clients fetch fails, just continue with empty part clients
          }
        }

        setMainClient(mainClientData)
        setSubClients(filteredSubClients)
        setSubClientCount(filteredSubClients.length)
        setPartClients(partClientsData)

        setEditedData({
          mainClient: { ...mainClientData },
          subClients: [...filteredSubClients],
          partClients: { ...partClientsData },
        })
      } catch (error) {
        toast.error("No RE Generator added yet...")
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [id])

  const openDeleteDialog = (client, type = "sub") => {
    setClientToDelete({ ...client, type })
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setClientToDelete(null)
  }

  const handleDelete = async () => {
    if (!clientToDelete) return

    try {
      setDeletingId(clientToDelete._id)

      if (clientToDelete.type === "sub") {
        await deleteSubClient(clientToDelete._id)
        setSubClients((prev) => prev.filter((client) => client._id !== clientToDelete._id))
        setEditedData((prev) => ({
          ...prev,
          subClients: prev.subClients.filter((client) => client._id !== clientToDelete._id),
        }))
        setSubClientCount((prev) => prev - 1)
      } else if (clientToDelete.type === "part") {
        await deletePartClient(clientToDelete._id)
        setPartClients((prev) => {
          const updated = { ...prev }
          for (const subId in updated) {
            updated[subId] = updated[subId].filter((part) => part._id !== clientToDelete._id)
            if (updated[subId].length === 0) {
              delete updated[subId]
            }
          }
          return updated
        })

        setEditedData((prev) => {
          const updated = { ...prev }
          for (const subId in updated.partClients) {
            updated.partClients[subId] = updated.partClients[subId].filter((part) => part._id !== clientToDelete._id)
            if (updated.partClients[subId].length === 0) {
              delete updated.partClients[subId]
            }
          }
          return updated
        })
      }

      toast.success(`${clientToDelete.type === "sub" ? "Sub-client" : "Part client"} deleted successfully`)
    } catch (error) {
      toast.error(`Failed to delete ${clientToDelete.type === "sub" ? "sub-client" : "part-client"}: ${error.message}`)
    } finally {
      setDeletingId(null)
      closeDeleteDialog()
    }
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      // When entering edit mode, reset main client to its original values
      setEditedData({
        mainClient: { ...mainClient },
        subClients: [...subClients],
        partClients: { ...partClients },
      })
    }

    setIsEditing(!isEditing)
    setErrors({})

    if (isEditing) {
      // When cancelling edit, reset everything
      setEditedData({
        mainClient: { ...mainClient },
        subClients: [...subClients],
        partClients: { ...partClients },
      })
      setSubClientCount(subClients.length)
    }
  }

  const handleFieldChange = (type, id, value, subIndex = null, partIndex = null) => {

    if (type === "main") {
      setEditedData((prev) => {
        const updatedMainClient = { ...prev.mainClient }

        // Handle nested fields (e.g., "abtMainMeter.meterNumber")
        if (id.includes(".")) {
          const [parent, child] = id.split(".")
          updatedMainClient[parent] = {
            ...(updatedMainClient[parent] || {}), // Ensure parent exists
            [child]: value,
          }
        } else {
          updatedMainClient[id] = value
        }

        // Recalculate DC/AC ratio if needed (only for main client direct changes)
        if (id === "acCapacityKw" || id === "dcCapacityKwp") {
          const acCapacity = Number.parseFloat(updatedMainClient.acCapacityKw) || 0
          const dcCapacity = Number.parseFloat(updatedMainClient.dcCapacityKwp) || 0
          if (acCapacity && dcCapacity) {
            updatedMainClient.dcAcRatio = (dcCapacity / acCapacity).toFixed(2)
          }
        }

        return {
          ...prev,
          mainClient: updatedMainClient,
        }
      })
    } else if (type === "sub" && subIndex !== null) {
      setEditedData((prev) => {
        const updatedSubClients = [...prev.subClients]
        const updatedSubClient = { ...updatedSubClients[subIndex] }

        // Handle nested fields for subclient
        if (id.includes(".")) {
          const [parent, child] = id.split(".")
          updatedSubClient[parent] = {
            ...(updatedSubClient[parent] || {}),
            [child]: value,
          }
        } else {
          updatedSubClient[id] = value
        }

        // First handle DC/AC ratio calculation for subclient if either AC or DC capacity changes
        if (
          (id === "acCapacityKw" || id === "dcCapacityKwp") &&
          updatedSubClient.acCapacityKw &&
          updatedSubClient.dcCapacityKwp
        ) {
          const acCapacity = Number.parseFloat(updatedSubClient.acCapacityKw) || 0
          const dcCapacity = Number.parseFloat(updatedSubClient.dcCapacityKwp) || 0
          if (acCapacity && dcCapacity) {
            updatedSubClient.dcAcRatio = (dcCapacity / acCapacity).toFixed(2)
          }
        }

        // Then handle sharing percentage if AC capacity changes
        if (id === "acCapacityKw") {
          // Get all subclients including the current one being edited
          const allSubClients = [...updatedSubClients]
          allSubClients[subIndex] = updatedSubClient

          // Calculate total AC capacity of all subclients
          const totalAcCapacity = allSubClients.reduce(
            (sum, sub) => sum + (Number.parseFloat(sub.acCapacityKw) || 0),
            0,
          )

          // Update main client's AC capacity
          const updatedMainClient = { ...prev.mainClient }
          updatedMainClient.acCapacityKw = totalAcCapacity.toString()

          // Recalculate sharing percentage for all subclients
          allSubClients.forEach((sub, idx) => {
            const subAcCapacity = Number.parseFloat(sub.acCapacityKw) || 0
            const percentage = totalAcCapacity > 0 ? ((subAcCapacity / totalAcCapacity) * 100).toFixed(2) + "%" : "0%"
            sub.sharingPercentage = percentage

            // Update the subclient in the array if it's not the current one being edited
            if (idx !== subIndex) {
              updatedSubClients[idx] = { ...sub }
            }
          })

          updatedSubClient.sharingPercentage = allSubClients[subIndex].sharingPercentage

          // Recalculate DC/AC ratio for main client if both capacities exist
          if (updatedMainClient.dcCapacityKwp) {
            updatedMainClient.dcAcRatio = (
              Number.parseFloat(updatedMainClient.dcCapacityKwp) / Number.parseFloat(updatedMainClient.acCapacityKw)
            ).toFixed(2)
          }

          return {
            ...prev,
            mainClient: updatedMainClient,
            subClients: allSubClients,
          }
        }

        updatedSubClients[subIndex] = updatedSubClient

        // Only update main client totals when specific subclient fields change
        const capacityFields = ["acCapacityKw", "dcCapacityKwp"]

        if (capacityFields.includes(id)) {
          const updatedMainClient = { ...prev.mainClient }

          if (id === "acCapacityKw") {
            // Update only AC capacity for the main client
            const totalAcCapacityKw = updatedSubClients.reduce(
              (sum, sub) => sum + (Number.parseFloat(sub.acCapacityKw) || 0),
              0,
            )
            updatedMainClient.acCapacityKw = totalAcCapacityKw.toString()

            // Recalculate DC/AC ratio for main client if both capacities exist
            if (updatedMainClient.dcCapacityKwp) {
              updatedMainClient.dcAcRatio = (
                Number.parseFloat(updatedMainClient.dcCapacityKwp) / Number.parseFloat(updatedMainClient.acCapacityKw)
              ).toFixed(2)
            }
          } else if (id === "dcCapacityKwp") {
            // Update only DC capacity for the main client
            const totalDcCapacityKwp = updatedSubClients.reduce(
              (sum, sub) => sum + (Number.parseFloat(sub.dcCapacityKwp) || 0),
              0,
            )
            updatedMainClient.dcCapacityKwp = totalDcCapacityKwp.toString()

            // Recalculate DC/AC ratio for main client if both capacities exist
            if (updatedMainClient.acCapacityKw) {
              updatedMainClient.dcAcRatio = (
                Number.parseFloat(updatedMainClient.dcCapacityKwp) / Number.parseFloat(updatedMainClient.acCapacityKw)
              ).toFixed(2)
            }
          }

          return {
            ...prev,
            mainClient: updatedMainClient,
            subClients: updatedSubClients,
          }
        }

        // For other fields that affect main client (noOfModules, numberOfInverters)
        const otherFields = ["noOfModules", "numberOfInverters"]

        if (otherFields.includes(id)) {
          const updatedMainClient = { ...prev.mainClient }

          if (id === "noOfModules") {
            // Update only noOfModules for the main client
            const totalNoOfModules = updatedSubClients.reduce(
              (sum, sub) => sum + (Number.parseInt(sub.noOfModules) || 0),
              0,
            )
            updatedMainClient.noOfModules = totalNoOfModules.toString()
          } else if (id === "numberOfInverters") {
            // Update only numberOfInverters for the main client
            const totalNumberOfInverters = updatedSubClients.reduce(
              (sum, sub) => sum + (Number.parseInt(sub.numberOfInverters) || 0),
              0,
            )
            updatedMainClient.numberOfInverters = totalNumberOfInverters.toString()
          }

          return {
            ...prev,
            mainClient: updatedMainClient,
            subClients: updatedSubClients,
          }
        }

        // If the changed field doesn't affect main client, just return with updated subclients
        return {
          ...prev,
          subClients: updatedSubClients,
        }
      })
    } else if (type === "part" && subIndex !== null && partIndex !== null) {
      setEditedData((prev) => {
        const subClientId = prev.subClients[subIndex]?._id;
        if (!subClientId) return prev;

        const updatedPartClients = { ...prev.partClients };
        if (!updatedPartClients[subClientId]) return prev;

        const updatedParts = [...updatedPartClients[subClientId]];
        const updatedPart = { ...updatedParts[partIndex] };

        // Handle nested fields for part client
        if (id.includes(".")) {
          const [parent, child] = id.split(".");
          updatedPart[parent] = {
            ...(updatedPart[parent] || {}),
            [child]: value,
          };
        } else {
          updatedPart[id] = value;
        }

        // Update sharing percentage relationship between auto and manual part clients
        if (id === "sharingPercentage") {
          const manualValue = parseFloat(value) || 0;

          // Auto part client is index 0, manual is index 1
          if (partIndex === 1 && updatedParts[0]) {
            // When manual part client sharing changes, update auto part client
            updatedPart.sharingPercentage = manualValue.toString();
            updatedParts[0] = {
              ...updatedParts[0],
              sharingPercentage: (100 - manualValue).toString(),
            };
          } else if (partIndex === 0 && updatedParts[1]) {
            // When auto part client sharing changes, update manual part client
            updatedPart.sharingPercentage = manualValue.toString();
            updatedParts[1] = {
              ...updatedParts[1],
              sharingPercentage: (100 - manualValue).toString(),
            };
          }
        }

        updatedParts[partIndex] = updatedPart;

        return {
          ...prev,
          partClients: {
            ...updatedPartClients,
            [subClientId]: updatedParts,
          },
        };
      });
    }
  }

  const addNewSubClient = () => {
    try {
      // Initialize an empty subclient with all required fields
      const newSubClient = {
        REtype: "Solar", // Default value for REtype
        name: "",
        discom: "DGVCL",
        divisionName: "",
        consumerNo: "",
        abtMainMeter: {
          modemNumber: "",
          meterNumber: "",
          mobileNumber: "",
          simNumber: "",
        },
        abtCheckMeter: {
          modemNumber: "",
          meterNumber: "",
          mobileNumber: "",
          simNumber: "",
        },
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
        pn: -1,
        contactNo: "",
        email: "",
        hasPartClients: "no",
      }

      setSubClientCount((prev) => prev + 1)
      setEditedData((prev) => ({
        ...prev,
        subClients: [...prev.subClients, newSubClient],
      }))
    } catch (error) {
      toast.error("Failed to add sub-client: " + error.message)
    }
  }

  const addPartClient = (subIndex) => {
    const subClientId = editedData.subClients[subIndex]?._id
    if (!subClientId) return

    // Add a console log to check if the function is being called multiple times
    setEditedData((prev) => {
      // Check if we already have part clients for this sub client
      const currentPartClients = prev.partClients[subClientId] || []

      // Create a new part client
      const partClient = {}
      allFields.forEach((field) => {
        if (field.partClient) {
          partClient[field.id] = ""
        }
      })

      // Create a new object to avoid reference issues
      const updatedPartClients = { ...prev.partClients }

      // Set the part clients array with the new part client added
      updatedPartClients[subClientId] = [...currentPartClients, partClient]

      return {
        ...prev,
        partClients: updatedPartClients,
      }
    })
  }

  // 1. Update the togglePartClients function
  const togglePartClients = (subIndex, value) => {
    const subClientId = editedData.subClients[subIndex]?._id
    if (!subClientId) return

    setEditedData((prev) => {
      const updatedSubClients = [...prev.subClients]
      updatedSubClients[subIndex] = {
        ...updatedSubClients[subIndex],
        hasPartClients: value,
      }

      const updatedPartClients = { ...prev.partClients }

      if (value === "no") {
        // Remove all part clients
        if (updatedPartClients[subClientId]) {
          delete updatedPartClients[subClientId]
        }
      } else if (value === "yes" && !updatedPartClients[subClientId]) {
        // Create auto part client with inherited values (now first)
        const autoPartClient = {}
        allFields.forEach((field) => {
          if (field.partClient) {
            // Copy key fields from sub client
            if (['discom', 'divisionName', 'consumerNo'].includes(field.id)) {
              autoPartClient[field.id] = updatedSubClients[subIndex]?.[field.id] || ""
            } else if (field.id === "sharingPercentage") {
              autoPartClient[field.id] = "100" // Default to 100%
            } else {
              autoPartClient[field.id] = ""
            }
          }
        })
        autoPartClient.name = `PART CLIENT-01 (Auto)`

        // Create manual part client (now second)
        const manualPartClient = {}
        allFields.forEach((field) => {
          if (field.partClient) {
            manualPartClient[field.id] = ""
          }
        })
        manualPartClient.sharingPercentage = ""
        manualPartClient.name = `PART CLIENT-02`

        updatedPartClients[subClientId] = [autoPartClient, manualPartClient]
      }

      return {
        ...prev,
        subClients: updatedSubClients,
        partClients: updatedPartClients,
      }
    })
  }

  const removeSubClient = (index) => {
    if (subClientCount <= 1) return // Don't remove if it's the last one

    const clientToRemove = editedData.subClients[index]
    if (clientToRemove?._id) {
      // If it's an existing sub client, open delete dialog
      openDeleteDialog(clientToRemove, "sub")
    } else {
      // If it's a new sub client, just remove it locally
      setEditedData((prev) => {
        const updatedSubClients = [...prev.subClients]
        updatedSubClients.splice(index, 1)
        return {
          ...prev,
          subClients: updatedSubClients,
        }
      })
      setSubClientCount((prev) => prev - 1)
    }
  }

  const removePartClient = (subClientId, partIndex) => {
    const partClient = currentPartClients[subClientId]?.[partIndex]

    if (partClient?._id) {
      // If it's an existing part client, open delete dialog
      openDeleteDialog(partClient, "part")
    } else {
      // If it's a new part client, just remove it locally
      setEditedData((prev) => {
        const updated = { ...prev }
        if (!updated.partClients[subClientId]) return prev

        // Only remove the specified part client
        updated.partClients[subClientId] = updated.partClients[subClientId].filter((_, i) => i !== partIndex)

        // If no part clients left, remove the subClientId entry
        if (updated.partClients[subClientId].length === 0) {
          delete updated.partClients[subClientId]
        }

        return updated
      })
    }
  }

  const openSaveDialog = () => {
    setIsSaveDialogOpen(true)
  }

  const closeSaveDialog = () => {
    setIsSaveDialogOpen(false)
  }

  const handleSaveChanges = async () => {
    if (!editedData.mainClient || !editedData.subClients) {
      toast.error("Client data is not fully loaded yet")
      return
    }

    const { isValid, errors: validationErrors } = validateForm()

    if (!isValid) {
      setErrors(validationErrors)
      toast.error("Please fix all validation errors before saving")
      return
    }

    try {
      setLoading(true)
      closeSaveDialog()

      // Save main client changes
      for (const field of allFields.filter((f) => f.mainClient)) {
        const originalValue = getNestedValue(mainClient, field.id)
        const editedValue = getNestedValue(editedData.mainClient, field.id)

        if (originalValue !== editedValue) {
          await editMainClientField(mainClient._id, field.id, editedValue)
        }
      }

      // Save sub client changes
      for (const subClient of editedData.subClients) {
        if (!subClient._id) {
          const response = await addSubClient(subClient)
          continue
        }

        const originalSubClient = subClients.find((sc) => sc._id === subClient._id)

        for (const field of allFields.filter((f) => f.subClient)) {
          const originalValue = originalSubClient ? getNestedValue(originalSubClient, field.id) : ""
          const editedValue = getNestedValue(subClient, field.id)

          if (originalValue !== editedValue) {
            await editSubClientField(subClient._id, field.id, editedValue)
          }
        }
      }

      // Save part client changes
      for (const [subClientId, parts] of Object.entries(editedData.partClients)) {
        const originalParts = partClients[subClientId] || []

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]
          const originalPart = originalParts[i]

          if (!part._id) {
            await addPartClientApi({
              ...part,
              subClientId: subClientId,
            })
            continue
          }

          for (const field of allFields.filter((f) => f.partClient)) {
            const originalValue = originalPart ? originalPart[field.id] : ""
            const editedValue = part[field.id]

            if (originalValue !== editedValue) {
              await editPartClientField(part._id, field.id, editedValue)
            }
          }

          // Special handling for auto part client sharing percentage
          if (i === 1 && part.sharingPercentage !== originalPart?.sharingPercentage) {
            await editPartClientField(part._id, "sharingPercentage", part.sharingPercentage)
          }
        }
      }

      toast.success("All changes saved successfully")
      setIsEditing(false)

      // Refresh data
      const [mainClientData, allSubClients, allPartClients] = await Promise.all([
        getMainClient(id),
        getAllSubClients(),
        getAllPartClients(),
      ])

      const filteredSubClients = allSubClients.filter(
        (subClient) => subClient.mainClient === id || subClient.mainClient._id === id,
      )

      setMainClient(mainClientData)
      setSubClients(filteredSubClients)
      setSubClientCount(filteredSubClients.length)

      // Organize part clients by sub-client ID
      const partClientsData = {}
      filteredSubClients.forEach((subClient) => {
        const partsForSubClient = allPartClients.filter(
          (partClient) =>
            partClient.subClient === subClient._id ||
            (typeof partClient.subClient === "object" && partClient.subClient._id === subClient._id),
        )
        if (partsForSubClient.length > 0) {
          partClientsData[subClient._id] = partsForSubClient
        }
      })

      setPartClients(partClientsData)
      setEditedData({
        mainClient: { ...mainClientData },
        subClients: [...filteredSubClients],
        partClients: { ...partClientsData },
      })
    } catch (error) {
      console.error("Error saving changes:", error)
      toast.error("Failed to save changes: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const transformNestedFields = (data) => {
    if (!data) return {}

    const transformed = { ...data }

    // Handle all possible nested fields
    const nestedFields = [
      "abtMainMeter.meterNumber",
      "abtMainMeter.modemNumber",
      "abtMainMeter.mobileNumber",
      "abtMainMeter.simNumber",
      "abtCheckMeter.meterNumber",
      "abtCheckMeter.modemNumber",
      "abtCheckMeter.mobileNumber",
      "abtCheckMeter.simNumber",
    ]

    nestedFields.forEach((field) => {
      if (data[field] !== undefined) {
        const [parent, child] = field.split(".")
        transformed[parent] = transformed[parent] || {}
        transformed[parent][child] = data[field]
        delete transformed[field]
      }
    })

    return transformed
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!mainClient) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-md mt-2">Client not found</p>
      </div>
    )
  }

  const transformedMainClient = transformNestedFields(isEditing ? editedData.mainClient : mainClient)
  const transformedSubClients = (isEditing ? editedData.subClients : subClients).map(transformNestedFields)
  const currentPartClients = isEditing ? editedData.partClients : partClients
  const transformedPartClients = Object.keys(currentPartClients).reduce((acc, key) => {
    acc[key] = currentPartClients[key].map(transformNestedFields)
    return acc
  }, {})

  return (
    <div className="max-w-[1600px] mx-auto py-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Button
            variant="outline"
            className="gap-1 mb-4 hover:cursor-pointer border-gray-200 dark:text-white bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors shadow-sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to RE Generator</span>
          </Button>

          <h1 className="text-2xl font-bold mb-2">{transformedMainClient.name}</h1>
          {transformedMainClient.subTitle && (
            <p className="text-muted-foreground mb-4">{transformedMainClient.subTitle}</p>
          )}
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="default" className="gap-1 hover:cursor-pointer bg-[#055C9D] hover:bg-[#055C9D]/95 dark:text-white" onClick={openSaveDialog}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" className={'hover:cursor-pointer'} onClick={handleEditToggle}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="default" className="gap-2 hover:cursor-pointer font-bold" onClick={handleEditToggle}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <PDFDownloadLink
                document={
                  <ClientDetailsPDF
                    mainClient={transformedMainClient}
                    subClients={transformedSubClients}
                    partClients={transformedPartClients}
                    allFields={allFields}
                  />
                }
                fileName={`Lead_Generator_Report_of_${transformedMainClient.name}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    variant=""
                    className="gap-2 bg-[#ee264f] hover:bg-[#ee264ee1] text-white hover:cursor-pointer font-bold flex items-center"
                  >
                    <FileDown size={18} className="mr-1" />
                    Export PDF
                  </Button>
                )}
              </PDFDownloadLink>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="details">
          <div className="relative">
            <div className="overflow-x-auto">
              <Table className="border-collapse">
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
                    {Array.from({ length: subClientCount }).map((_, index) => {
                      const subClient = transformedSubClients[index]
                      return (
                        <TableHead
                          key={`sub-header-${index}`}
                          className="w-64 border border-border bg-purple-200 dark:text-black font-bold min-w-[14rem]"
                        >
                          <div className="flex justify-between items-center">
                            <span>
                              SUB RE GENERATOR-
                              {(index + 1).toString().padStart(2, "0")}
                            </span>
                            <div className="flex gap-1">
                              {isEditing && index === subClientCount - 1 && subClientCount < 50 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={addNewSubClient}
                                  className="h-6 w-6 p-0 hover:cursor-pointer"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                              {isEditing && subClientCount > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSubClient(index)}
                                  className="h-6 w-6 p-0 text-destructive hover:cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Client Name Row */}
                  <TableRow className="bg-muted">
                    <TableCell className="border border-border sticky left-0 z-10 bg-inherit">*</TableCell>
                    <TableCell className="border border-border sticky left-12 z-10 bg-inherit">
                      RE GENERATOR =&gt;
                    </TableCell>
                    <TableCell className="border border-border">
                      <Input
                        value={transformedMainClient.name || ""}
                        readOnly={!isEditing}
                        onChange={(e) => handleFieldChange("main", "name", e.target.value)}
                        placeholder={allFields.find((f) => f.id === "name")?.placeholder}
                        className={cn("h-8", {
                          "border-none bg-transparent": !isEditing,
                          "border-input": isEditing,
                          "border-destructive": errors["main_name"],
                        })}
                      />
                      {errors["main_name"] && (
                        <span className="text-xs text-destructive mt-1">{errors["main_name"]}</span>
                      )}
                    </TableCell>
                    {Array.from({ length: subClientCount }).map((_, index) => {
                      const subClient = transformedSubClients[index] || {}
                      return (
                        <TableCell key={`sub-name-${index}`} className="border border-border">
                          <Input
                            value={subClient.name || ""}
                            readOnly={!isEditing}
                            onChange={(e) => handleFieldChange("sub", "name", e.target.value, index)}
                            placeholder={allFields.find((f) => f.id === "name")?.placeholder}
                            className={cn("h-8", {
                              "border-none bg-transparent": !isEditing,
                              "border-input": isEditing,
                            })}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>

                  {/* Field Rows */}
                  {allFields.map((field, rowIndex) => {
                    if (field.id === "name") return null

                    return (
                      <TableRow key={field.id} className={rowIndex % 2 === 0 ? "bg-muted" : "bg-white"}>
                        <TableCell className="border border-border sticky left-0 z-10 bg-inherit">{rowIndex}</TableCell>
                        <TableCell className="border border-border sticky left-12 z-10 bg-inherit">
                          <div className="flex">
                            {field.label}
                            {field.required && <Asterisk className="h-3 w-3 ms-2 text-red-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="border border-border">
                          {field.mainClient ? (
                            <div className="relative">
                              {field.type === "select" ? (
                                <Select
                                  value={
                                    field.id.includes(".")
                                      ? getNestedValue(transformedMainClient, field.id) || field.defaultValue
                                      : transformedMainClient[field.id] || field.defaultValue
                                  }
                                  onValueChange={(value) => handleFieldChange("main", field.id, value)}
                                  disabled={!isEditing}
                                >
                                  <SelectTrigger
                                    className={cn("h-8", {
                                      "border-none bg-transparent": !isEditing,
                                      "border-input": isEditing,
                                      "pr-6": getFieldHistory("main", mainClient._id, field.id),
                                    })}
                                  >
                                    <SelectValue placeholder={`Select ${field.label}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={
                                    field.id.includes(".")
                                      ? getNestedValue(transformedMainClient, field.id)
                                      : transformedMainClient[field.id] || ""
                                  }
                                  readOnly={!isEditing}
                                  onChange={(e) => handleFieldChange("main", field.id, e.target.value)}
                                  placeholder={field.placeholder}
                                  className={cn("h-8", {
                                    "border-none bg-transparent": !isEditing,
                                    "border-input": isEditing,
                                    "pr-6": getFieldHistory("main", mainClient._id, field.id),
                                  })}
                                />
                              )}
                              {getFieldHistory("main", mainClient._id, field.id) && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <History className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="end">
                                      {renderHistoryTooltip(getFieldHistory("main", mainClient._id, field.id))}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          ) : (
                            <Input disabled className="border-none h-8 bg-gray-100 text-gray-400" placeholder="N/A" />
                          )}
                        </TableCell>

                        {Array.from({ length: subClientCount }).map((_, index) => {
                          const subClient = transformedSubClients[index] || {}
                          return (
                            <TableCell key={`sub-${index}-${field.id}`} className="border border-border">
                              {field.subClient ? (
                                <div className="relative">
                                  {field.type === "select" ? (
                                    <Select
                                      value={
                                        field.id.includes(".")
                                          ? getNestedValue(subClient, field.id) || field.defaultValue
                                          : subClient[field.id] || field.defaultValue
                                      }
                                      onValueChange={(value) => handleFieldChange("sub", field.id, value, index)}
                                      disabled={!isEditing}
                                    >
                                      <SelectTrigger
                                        className={cn("h-8", {
                                          "border-none bg-transparent": !isEditing,
                                          "border-input": isEditing,
                                          "pr-6": getFieldHistory("sub", subClient._id, field.id),
                                        })}
                                      >
                                        <SelectValue placeholder={`Select ${field.label}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options.map((option) => (
                                          <SelectItem key={option.value} value={option.value} className={"w-full"}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      type={field.type}
                                      value={
                                        field.id.includes(".")
                                          ? getNestedValue(subClient, field.id)
                                          : subClient[field.id] || ""
                                      }
                                      readOnly={!isEditing}
                                      onChange={(e) => handleFieldChange("sub", field.id, e.target.value, index)}
                                      placeholder={field.placeholder}
                                      className={cn("h-8", {
                                        "border-none bg-transparent": !isEditing,
                                        "border-input": isEditing,
                                        "pr-6": getFieldHistory("sub", subClient._id, field.id),
                                      })}
                                    />
                                  )}
                                  {getFieldHistory("sub", subClient._id, field.id) && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            <History className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="end">
                                          {renderHistoryTooltip(getFieldHistory("sub", subClient._id, field.id))}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              ) : (
                                <Input
                                  disabled
                                  className="border-none h-8 bg-gray-100 text-gray-400"
                                  placeholder="N/A"
                                />
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}

                  {/* Part Client Toggle Row */}
                  <TableRow className="bg-orange-50">
                    <TableCell className="border border-border sticky left-0 z-10 bg-inherit">*</TableCell>
                    <TableCell className="border border-border sticky left-12 z-10 bg-inherit">
                      Add Part Clients?
                    </TableCell>
                    <TableCell className="border border-border">
                      <div className="flex justify-center">
                        <span className="text-gray-500 italic">N/A</span>
                      </div>
                    </TableCell>

                    {Array.from({ length: subClientCount }).map((_, index) => {
                      const subClientId = editedData.subClients[index]?._id
                      const hasPartClients = transformedPartClients[subClientId]?.length > 0

                      return (
                        <TableCell key={`part-toggle-${index}`} className="border border-border">
                          {isEditing ? (
                            <div className="flex justify-center">
                              <Select
                                value={hasPartClients ? "yes" : "no"}
                                onValueChange={(value) => togglePartClients(index, value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors[`sub_${index}_partClients`] && (
                                <span className="text-xs text-destructive mt-1">
                                  {errors[`sub_${index}_partClients`]}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <Input
                                value={hasPartClients ? "Yes" : "No"}
                                readOnly
                                className="h-8 border-none bg-transparent text-center"
                              />
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            {subClientCount > 5 && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-900 pointer-events-none"></div>
            )}
          </div>

          {/* Part Client Tables */}
          {/* Part Client Tables */}
          {Array.from({ length: subClientCount }).map((_, subIndex) => {
            const subClient = editedData.subClients[subIndex]
            const subClientId = subClient?._id
            const partClientsForSub = transformedPartClients[subClientId] || []
            const partClientCount = partClientsForSub.length

            if (partClientCount === 0) {
              return null
            }

            return (
              <div key={`part-client-section-${subIndex}`} className="mt-8">
                <h3 className="text-lg font-semibold mb-2 px-4">
                  Part Clients for {subClient?.name || `Sub Client ${subIndex + 1}`}
                </h3>

                <div className="overflow-x-auto">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 border border-border bg-muted font-bold ">Sr. No.</TableHead>
                        <TableHead className="w-64 border border-border bg-muted font-bold">Field Name</TableHead>
                        {partClientsForSub.map((partClient, partIndex) => (
                          <TableHead key={`part-header-${subIndex}-${partIndex}`} className="border border-border bg-orange-100 dark:text-black font-bold">
                            <div className="flex justify-between items-center">
                              <span>
                                {partClient.name || `PART CLIENT-${(partIndex + 1).toString().padStart(2, "0")}`}
                                {partIndex === 0 ? " (Auto)" : ""}
                              </span>
                              {isEditing && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePartClient(subClientId, partIndex)}
                                  className="h-6 w-6 p-0 text-destructive hover:cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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
                            <TableCell className="border border-border">{rowIndex + 1}</TableCell>
                            <TableCell className="border border-border">
                              <div className="flex">
                                {field.label}
                                {field.required && <Asterisk className="h-3 w-3 ms-2 text-red-500" />}
                              </div>
                            </TableCell>
                            {partClientsForSub.map((partClient, partIndex) => (
                              <TableCell
                                key={`part-value-${subIndex}-${partIndex}-${field.id}`}
                                className="border border-border"
                              >
                                {partIndex === 0 ? ( // Auto part client (read-only)
                                  <div className="relative">
                                    <Input
                                      type={field.type}
                                      value={partClient[field.id] || ""}
                                      readOnly
                                      className="h-8 border-none bg-gray-100"
                                    />
                                    {getFieldHistory("part", partClient._id, field.id) && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                              <History className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" align="end">
                                            {renderHistoryTooltip(getFieldHistory("part", partClient._id, field.id))}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                ) : ( // Manual part client (editable)
                                  <div className="relative">
                                    <Input
                                      type={field.type}
                                      value={partClient[field.id] || ""}
                                      readOnly={!isEditing}
                                      onChange={(e) =>
                                        handleFieldChange("part", field.id, e.target.value, subIndex, partIndex)
                                      }
                                      placeholder={field.placeholder}
                                      className={cn("h-8", {
                                        "border-none bg-transparent": !isEditing,
                                        "border-input": isEditing,
                                        "pr-6": getFieldHistory("part", partClient._id, field.id),
                                      })}
                                    />
                                    {getFieldHistory("part", partClient._id, field.id) && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                              <History className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" align="end">
                                            {renderHistoryTooltip(getFieldHistory("part", partClient._id, field.id))}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Are you absolutely sure?
                </AlertDialogTitle>
              </div>
            </div>

            <AlertDialogDescription className="text-left text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              This will permanently delete the {clientToDelete?.type === "sub" ? "sub-client" : "part-client"}{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {clientToDelete?.name ||
                  clientToDelete?.divisionName ||
                  (clientToDelete?.type === "part" ? `Part Client (${clientToDelete?._id?.slice(-4)})` : "")}
              </span>{" "}
              from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
            <AlertDialogCancel disabled={deletingId === clientToDelete?._id} className="w-full sm:w-auto hover:cursor-pointer">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingId === clientToDelete?._id}
              className="w-full sm:w-auto bg-[#ee264f] hover:bg-[#ee264ee1] dark:text-white hover:cursor-pointer disabled:opacity-50"
            >
              {deletingId === clientToDelete?._id ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Save Changes Confirmation Dialog */}
      <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <AlertDialogContent className="border-0 bg-background dark:bg-background-dark rounded-lg shadow-xl dark:shadow-gray-800/50">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-500" /> {/* Warning icon */}
              <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirm Save Changes
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300 pl-9">
              Are you sure you want to save all changes to this client? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="hover:cursor-pointer border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveChanges}
              className="bg-gradient-to-r from-blue-500 hover:cursor-pointer to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ClientDetails
