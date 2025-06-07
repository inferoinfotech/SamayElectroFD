"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Edit2, Trash2, Settings, Users, FileText, Save, AlertTriangle, Download, Loader2 } from "lucide-react"

// Import API functions
import { getAllMainClients } from "@/api/leadgenerator"
import { createClientProgressField, deleteClientFromProgressField, getAllClientProgressField, updateClientProgressField } from "@/api/clientProgressField"
import { createClientProgress, updateClientProgress, getClientProgressByMonthYear, downloadClientProgressExcel } from "@/api/clientProgress"

export default function ClientProgressManagement() {
  const [activeTab, setActiveTab] = useState("report")
  const [allClients, setAllClients] = useState([])
  const [configuredClients, setConfiguredClients] = useState([])
  const [fieldConfiguration, setFieldConfiguration] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Dynamic field management states - Start with empty array, all fields added by user
  const [availableFields, setAvailableFields] = useState([])

  // Client-specific field selection - FIXED: Use unique field identifiers
  const [clientFieldSelections, setClientFieldSelections] = useState({})

  // Progress report states
  const [month, setMonth] = useState(null)
  const [year, setYear] = useState(null)
  const [existingReport, setExistingReport] = useState(null)
  const [taskStatus, setTaskStatus] = useState({})
  const [remarks, setRemarks] = useState({})
  const [isCreating, setIsCreating] = useState(false)

  // Dialog states
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false)
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false)
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldCategory, setNewFieldCategory] = useState("stageOne")
  const [editingField, setEditingField] = useState(null)

  // Add these new state variables
  const [draggedItem, setDraggedItem] = useState(null)
  const [deleteClientDialog, setDeleteClientDialog] = useState({ open: false, client: null })
  const [deleteFieldDialog, setDeleteFieldDialog] = useState({ open: false, field: null })

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 13 }, (_, i) => (currentYear - 2 + i).toString())

  // FIXED: Create unique field identifier that includes both name and category
  const createFieldKey = (name, category) => `${name}__${category}`
  const parseFieldKey = (fieldKey) => {
    const parts = fieldKey.split("__")
    return {
      name: parts[0],
      category: parts[1],
    }
  }

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setDataLoaded(false)


      // Fetch all main clients FIRST
      const clientsResponse = await getAllMainClients()
      setAllClients(clientsResponse)

      // Fetch existing field configuration
      try {
        const configData = await getAllClientProgressField()
        // const configData = await configResponse.json()

        if (configData && configData.data && configData.data.length > 0) {
          const config = configData.data[0]
          setFieldConfiguration(config)

          // FIXED: Create unique field identifiers using name + category
          const configuredFields = new Set()
          config.clients.forEach((client) => {
            client.stageOne?.forEach((task) => configuredFields.add(createFieldKey(task.name, "stageOne")))
            client.stageTwo?.forEach((task) => configuredFields.add(createFieldKey(task.name, "stageTwo")))
            client.stageThree?.forEach((task) => configuredFields.add(createFieldKey(task.name, "stageThree")))
            client.stageBilling?.forEach((task) => configuredFields.add(createFieldKey(task.name, "stageBilling")))
            client.otherTasks?.forEach((task) => configuredFields.add(createFieldKey(task.name, "other")))
          })

          const updatedAvailableFields = []
          let fieldIdCounter = 0

          configuredFields.forEach((fieldKey) => {
            const { name, category } = parseFieldKey(fieldKey)
            updatedAvailableFields.push({
              id: `field_${fieldIdCounter++}`,
              name: name,
              category: category,
              uniqueKey: fieldKey, // Store the unique key for reference
            })
          })

          setAvailableFields(updatedAvailableFields)

          // 2. Set configured clients using the client data from the API response
          const configuredClientData = config.clients.map((clientConfig) => {
            const clientData = clientConfig.clientId
            return {
              _id: clientData._id,
              name: clientData.name,
              configuredAt: new Date().toISOString(),
            }
          })

          setConfiguredClients(configuredClientData)

          // FIXED: Restore Client Field Selections using unique field keys
          const initialClientFieldSelections = {}
          config.clients.forEach((clientConfig) => {
            const clientId = clientConfig.clientId._id
            initialClientFieldSelections[clientId] = {}

            // Initialize all fields as false first
            updatedAvailableFields.forEach((field) => {
              initialClientFieldSelections[clientId][field.id] = false
            })

            // Set selected stage one tasks based on status from API
            clientConfig.stageOne?.forEach((task) => {
              const fieldKey = createFieldKey(task.name, "stageOne")
              const field = updatedAvailableFields.find((f) => f.uniqueKey === fieldKey)
              if (field) {
                initialClientFieldSelections[clientId][field.id] = task.status
              }
            })

            // Set selected stage two tasks based on status from API
            clientConfig.stageTwo?.forEach((task) => {
              const fieldKey = createFieldKey(task.name, "stageTwo")
              const field = updatedAvailableFields.find((f) => f.uniqueKey === fieldKey)
              if (field) {
                initialClientFieldSelections[clientId][field.id] = task.status
              }
            })

            // Set selected stage three tasks based on status from API
            clientConfig.stageThree?.forEach((task) => {
              const fieldKey = createFieldKey(task.name, "stageThree")
              const field = updatedAvailableFields.find((f) => f.uniqueKey === fieldKey)
              if (field) {
                initialClientFieldSelections[clientId][field.id] = task.status
              }
            })

            // Set selected billing stage tasks based on status from API
            clientConfig.stageBilling?.forEach((task) => {
              const fieldKey = createFieldKey(task.name, "stageBilling")
              const field = updatedAvailableFields.find((f) => f.uniqueKey === fieldKey)
              if (field) {
                initialClientFieldSelections[clientId][field.id] = task.status
              }
            })

            // Handle other tasks if they exist
            if (clientConfig.otherTasks) {
              clientConfig.otherTasks.forEach((task) => {
                const fieldKey = createFieldKey(task.name, "other")
                const field = updatedAvailableFields.find((f) => f.uniqueKey === fieldKey)
                if (field) {
                  initialClientFieldSelections[clientId][field.id] = task.status
                }
              })
            }
          })

          setClientFieldSelections(initialClientFieldSelections)

          toast.success(`Configuration loaded: ${configuredClientData.length} clients configured`)
        } else {
          setFieldConfiguration(null)
          setConfiguredClients([])
          setClientFieldSelections({})
        }
      } catch (configError) {
        setFieldConfiguration(null)
        setConfiguredClients([])
        setClientFieldSelections({})
      }
    } catch (error) {
      console.error("❌ Failed to load initial data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
      setDataLoaded(true)
    }
  }

  // Field management functions
  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      toast.error("Please enter a field name")
      return
    }

    // FIXED: Create unique field with proper key
    const fieldKey = createFieldKey(newFieldName.trim(), newFieldCategory)
    const newField = {
      id: `custom_${Date.now()}`,
      name: newFieldName.trim(),
      category: newFieldCategory,
      uniqueKey: fieldKey,
    }

    setAvailableFields((prev) => [...prev, newField])
    setNewFieldName("")
    setIsAddFieldDialogOpen(false)
    toast.success("Field added successfully")
  }

  const handleEditField = (field) => {
    setEditingField({ ...field })
    setIsEditFieldDialogOpen(true)
  }

  const handleUpdateField = () => {
    if (!editingField.name.trim()) {
      toast.error("Please enter a field name")
      return
    }

    // FIXED: Update field with new unique key
    const newFieldKey = createFieldKey(editingField.name.trim(), editingField.category)

    setAvailableFields((prev) =>
      prev.map((f) =>
        f.id === editingField.id ? { ...f, name: editingField.name.trim(), uniqueKey: newFieldKey } : f,
      ),
    )

    setEditingField(null)
    setIsEditFieldDialogOpen(false)
    toast.success("Field updated successfully")
  }

  const handleDeleteFieldConfirm = (field) => {
    setDeleteFieldDialog({ open: true, field })
  }

  const handleDeleteField = async () => {
    const { field } = deleteFieldDialog

    try {
      setLoading(true)

      setAvailableFields((prev) => prev.filter((f) => f.id !== field.id))

      // Remove field from all client selections
      setClientFieldSelections((prev) => {
        const newSelections = { ...prev }
        Object.keys(newSelections).forEach((clientId) => {
          delete newSelections[clientId][field.id]
        })
        return newSelections
      })

      setDeleteFieldDialog({ open: false, field: null })
      toast.success("Field deleted successfully")
    } catch (error) {
      console.error("Failed to delete field:", error)
      toast.error("Failed to delete field")
    } finally {
      setLoading(false)
    }
  }

  // NEW: Handle adding a new client to configuration
  const handleAddClientToConfiguration = (clientId) => {
    const clientToAdd = allClients.find((c) => c._id === clientId)
    if (!clientToAdd) return

    // Add to configured clients at the beginning (first row)
    setConfiguredClients((prev) => [{ ...clientToAdd, configuredAt: new Date().toISOString() }, ...prev])

    // Initialize field selections for new client with all fields unchecked
    setClientFieldSelections((prev) => {
      const newClientSelections = {}
      availableFields.forEach((field) => {
        newClientSelections[field.id] = false
      })
      return {
        ...prev,
        [clientId]: newClientSelections,
      }
    })

    toast.success(`${clientToAdd.name} added to configuration`)
  }

  const handleClientFieldToggle = (clientId, fieldId, enabled) => {
    setClientFieldSelections((prev) => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        [fieldId]: enabled,
      },
    }))
  }

  const handleRemoveClientConfirm = (client) => {
    setDeleteClientDialog({ open: true, client })
  }

  const handleRemoveClient = async () => {
    const clientId = deleteClientDialog.client._id

    try {
      setLoading(true)

      // Call API to remove client from progress field
      await deleteClientFromProgressField(clientId)

      // Remove from configured clients
      setConfiguredClients((prev) => prev.filter((client) => client._id !== clientId))

      // Remove all field statuses for this client from local state
      setClientFieldSelections((prev) => {
        const newSelections = { ...prev }
        delete newSelections[clientId]
        return newSelections
      })

      setDeleteClientDialog({ open: false, client: null })
      toast.success("Client removed from configuration")

      // Re-load initial data to ensure UI is consistent with backend
      loadInitialData()
    } catch (error) {
      console.error("Failed to remove client:", error)
      toast.error("Failed to remove client")
    } finally {
      setLoading(false)
    }
  }

  // Drag and drop functions
  const handleDragStart = (e, fieldId, category, index) => {
    setDraggedItem({ fieldId, category, index })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, targetCategory, targetIndex) => {
    e.preventDefault()

    if (!draggedItem || draggedItem.category !== targetCategory) {
      setDraggedItem(null)
      return
    }

    const sourceIndex = draggedItem.index
    const targetIdx = targetIndex

    if (sourceIndex === targetIdx) {
      setDraggedItem(null)
      return
    }

    setAvailableFields((prev) => {
      const categoryFields = prev.filter((f) => f.category === targetCategory)
      const otherFields = prev.filter((f) => f.category !== targetCategory)

      const [movedField] = categoryFields.splice(sourceIndex, 1)
      categoryFields.splice(targetIdx, 0, movedField)

      return [...otherFields, ...categoryFields]
    })

    setDraggedItem(null)
    toast.success("Field position updated")
  }

  const handleSaveConfiguration = async () => {
    try {
      setLoading(true)

      const configData = {
        clients: configuredClients.map((client) => {
          const clientId = client._id
          const clientSelections = clientFieldSelections[clientId] || {}

          return {
            clientName: client.name,
            clientId: clientId,
            stageOne: availableFields
              .filter((f) => f.category === "stageOne")
              .map((f) => ({
                name: f.name,
                status: clientSelections[f.id] === true, // true for selected, false for unselected
                enabled: clientSelections[f.id] === true,
              })),
            stageTwo: availableFields
              .filter((f) => f.category === "stageTwo")
              .map((f) => ({
                name: f.name,
                status: clientSelections[f.id] === true, // true for selected, false for unselected
                enabled: clientSelections[f.id] === true,
              })),
            stageThree: availableFields
              .filter((f) => f.category === "stageThree")
              .map((f) => ({
                name: f.name,
                status: clientSelections[f.id] === true,
                enabled: clientSelections[f.id] === true,
              })),
            stageBilling: availableFields
              .filter((f) => f.category === "stageBilling")
              .map((f) => ({
                name: f.name,
                status: clientSelections[f.id] === true,
                enabled: clientSelections[f.id] === true,
              })),
            otherTasks: availableFields
              .filter((f) => f.category === "other")
              .map((f) => ({
                name: f.name,
                status: clientSelections[f.id] === true,
                enabled: clientSelections[f.id] === true,
              })),
            remark: "",
          }
        }),
      }

      if (fieldConfiguration) {
        const updatedConfig = await updateClientProgressField(fieldConfiguration._id, configData)
        // const updatedConfig = await response.json()
        setFieldConfiguration(updatedConfig)
        toast.success("Configuration updated successfully")
      } else {
        const newConfig = await createClientProgressField(configData)
        // const newConfig = await response.json()
        setFieldConfiguration(newConfig)
        toast.success("Configuration saved successfully")
      }

      // Re-load initial data to ensure UI is consistent with backend
      loadInitialData()
    } catch (error) {
      console.error("Failed to save configuration:", error)
      toast.error("Failed to save configuration")
    } finally {
      setLoading(false)
    }
  }

  // Progress report functions
  const handleSearchReport = async () => {
    if (!month || !year) {
      toast.error("Please select both month and year")
      return
    }

    try {
      setLoading(true)
      const response = await getClientProgressByMonthYear(month, year)

      if (response && response.length > 0) {
        setExistingReport(response[0])
        initializeFormData(response[0])
        setIsCreating(false)
      } else {
        setExistingReport(null)
        resetFormData()
        setIsCreating(true)
        initializeEmptyFormData()
      }
    } catch (error) {
      console.error("Failed to fetch report:", error)
      if (error.response?.status !== 404) {
        toast.error("Failed to load report data")
      } else {
        setExistingReport(null)
        resetFormData()
        setIsCreating(true)
        initializeEmptyFormData()
      }
    } finally {
      setLoading(false)
    }
  }

  const initializeFormData = (report) => {
    const newTaskStatus = {}
    const newRemarks = {}

    report.clients.forEach((client) => {
      const clientId = client.clientId._id || client.clientId

      // FIXED: Use unique field keys for matching
      client.stageOne?.forEach((task) => {
        const fieldKey = createFieldKey(task.name, "stageOne")
        const field = availableFields.find((f) => f.uniqueKey === fieldKey)
        if (field) {
          newTaskStatus[`${clientId}-${field.id}`] = task.status
        }
      })

      client.stageTwo?.forEach((task) => {
        const fieldKey = createFieldKey(task.name, "stageTwo")
        const field = availableFields.find((f) => f.uniqueKey === fieldKey)
        if (field) {
          newTaskStatus[`${clientId}-${field.id}`] = task.status
        }
      })

      client.stageThree?.forEach((task) => {
        const fieldKey = createFieldKey(task.name, "stageThree")
        const field = availableFields.find((f) => f.uniqueKey === fieldKey)
        if (field) {
          newTaskStatus[`${clientId}-${field.id}`] = task.status
        }
      })

      client.stageBilling?.forEach((task) => {
        const fieldKey = createFieldKey(task.name, "stageBilling")
        const field = availableFields.find((f) => f.uniqueKey === fieldKey)
        if (field) {
          newTaskStatus[`${clientId}-${field.id}`] = task.status
        }
      })

      if (client.otherTasks) {
        client.otherTasks.forEach((task) => {
          const fieldKey = createFieldKey(task.name, "other")
          const field = availableFields.find((f) => f.uniqueKey === fieldKey)
          if (field) {
            newTaskStatus[`${clientId}-${field.id}`] = task.status
          }
        })
      }

      newRemarks[clientId] = client.remark || ""
    })

    setTaskStatus(newTaskStatus)
    setRemarks(newRemarks)
  }

  const initializeEmptyFormData = () => {
    const newTaskStatus = {}
    const newRemarks = {}

    configuredClients.forEach((client) => {
      const clientId = client._id
      const clientSelections = clientFieldSelections[clientId] || {}

      availableFields.forEach((field) => {
        // Only initialize tasks for fields that are enabled for this client
        if (clientSelections[field.id]) {
          newTaskStatus[`${clientId}-${field.id}`] = false // Default to pending
        }
      })

      newRemarks[clientId] = ""
    })

    setTaskStatus(newTaskStatus)
    setRemarks(newRemarks)
  }

  const resetFormData = () => {
    setTaskStatus({})
    setRemarks({})
  }

  const handleTaskChange = (clientId, fieldId, checked) => {
    setTaskStatus((prev) => ({
      ...prev,
      [`${clientId}-${fieldId}`]: checked,
    }))
  }

  const handleRemarkChange = (clientId, value) => {
    setRemarks((prev) => ({
      ...prev,
      [clientId]: value,
    }))
  }

  const handleSaveReport = async () => {
    try {
      setLoading(true)

      const reportData = {
        month: Number.parseInt(month),
        year: Number.parseInt(year),
        clients: configuredClients.map((client) => {
          const clientId = client._id
          const clientSelections = clientFieldSelections[clientId] || {}

          return {
            clientName: client.name,
            clientId: clientId,
            stageOne: availableFields
              .filter((f) => f.category === "stageOne" && clientSelections[f.id])
              .map((f) => ({
                name: f.name,
                status: taskStatus[`${clientId}-${f.id}`] || false,
              })),
            stageTwo: availableFields
              .filter((f) => f.category === "stageTwo" && clientSelections[f.id])
              .map((f) => ({
                name: f.name,
                status: taskStatus[`${clientId}-${f.id}`] || false,
              })),
            stageThree: availableFields
              .filter((f) => f.category === "stageThree" && clientSelections[f.id])
              .map((f) => ({
                name: f.name,
                status: taskStatus[`${clientId}-${f.id}`] || false,
              })),
            stageBilling: availableFields
              .filter((f) => f.category === "stageBilling" && clientSelections[f.id])
              .map((f) => ({
                name: f.name,
                status: taskStatus[`${clientId}-${f.id}`] || false,
              })),
            otherTasks: availableFields
              .filter((f) => f.category === "other" && clientSelections[f.id])
              .map((f) => ({
                name: f.name,
                status: taskStatus[`${clientId}-${f.id}`] || false,
              })),
            remark: remarks[clientId] || "",
          }
        }),
      }

      if (existingReport) {
        await updateClientProgress(existingReport._id, reportData)
        toast.success("Report updated successfully")
      } else {
        await createClientProgress(reportData)
        toast.success("Report created successfully")
      }

      // Re-fetch the report after saving
      await handleSearchReport()
    } catch (error) {
      console.error("Failed to save report:", error)
      toast.error("Failed to save report")
    } finally {
      setLoading(false)
    }
  }

  const getStageOneFields = () => availableFields.filter((f) => f.category === "stageOne")
  const getStageTwoFields = () => availableFields.filter((f) => f.category === "stageTwo")
  const getStageThreeFields = () => availableFields.filter((f) => f.category === "stageThree")
  const getStageBillingFields = () => availableFields.filter((f) => f.category === "stageBilling")
  const getOtherFields = () => availableFields.filter((f) => f.category === "other")

  const isFieldEnabledForClient = (clientId, fieldId) => {
    return clientFieldSelections[clientId]?.[fieldId] || false
  }

  // Get available clients for adding (exclude already configured ones)
  const getAvailableClientsForAdding = () => {
    const configuredClientIds = configuredClients.map((c) => c._id)
    return allClients.filter((client) => !configuredClientIds.includes(client._id))
  }

  // Add this function inside your component (but outside the return statement)
  const handleDownloadExcel = async () => {
    if (!month || !year) {
      toast.error("Please select both month and year first");
      return;
    }

    try {
      const response = await downloadClientProgressExcel(month, year);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from headers or use default
      const fileName = decodeURIComponent(response.filename.replace(/"/g, ''));
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      // Revoke the object URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error("Failed to download Excel report");
    }
  };

  return (
    <div className="flex flex-col max-w-[1600px] mx-auto min-h-screen">
      <div className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-4">
        <div className="w-full mx-auto grid gap-2">
          <h1 className="font-semibold text-3xl">Client Progress Management</h1>
          <div className="flex items-center text-sm gap-2">
            <span className="text-muted-foreground">Configure fields and track client task progress</span>
            <Badge variant="outline" className="ml-4 bg-purple-100 dark:text-black">
              {configuredClients.length} clients configured
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full bg-blue-100 max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="report" className="flex items-center text-base hover:cursor-pointer font-semibold gap-2">
              <Settings className="h-4 w-4" />
              Progress Report
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center text-base hover:cursor-pointer font-semibold gap-2">
              <FileText className="h-4 w-4" />
              Field Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-6">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl gap-2">
                  <Settings className="h-5 w-5" />
                  Field Configuration & Client Selection
                </CardTitle>
                <CardDescription>
                  Configure fields for progress tracking and select which clients to include in reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Selection Dropdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Add Client to Report
                    </h3>
                  </div>

                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="clientSelect">Select Client</Label>
                      <Select
                        value=""
                        className=""
                        onValueChange={(clientId) => {
                          handleAddClientToConfiguration(clientId)
                        }}
                      >
                        <SelectTrigger className={"max-w-lg border-slate-500"}>
                          <SelectValue placeholder="Choose a client to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableClientsForAdding().map((client) => (
                            <SelectItem key={client._id} value={client._id}>
                              {client.name}
                            </SelectItem>
                          ))}
                          {getAvailableClientsForAdding().length === 0 && (
                            <SelectItem value="no-clients" disabled>
                              All clients are already configured
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Field Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Field Management</h3>
                    <div className="flex gap-2">
                      <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="default" className={'bg-[#055C9D] hover:bg-[#055C9D]/95 dark:text-white hover:text-white hover:cursor-pointer text-white font-semibold'} size="sm">
                            <Plus className="h-4 w-4" />
                            Add Field
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Field</DialogTitle>
                            <DialogDescription>Add a new field to track in progress reports</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="fieldName">Field Name</Label>
                              <Input
                                id="fieldName"
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                                placeholder="Enter field name"
                                className={'border-slate-500'}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fieldCategory">Field Category</Label>
                              <Select value={newFieldCategory} onValueChange={setNewFieldCategory}>
                                <SelectTrigger className={'border-slate-500'}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="stageOne">1st Stage</SelectItem>
                                  <SelectItem value="stageTwo">2nd Stage</SelectItem>
                                  <SelectItem value="stageThree">3rd Stage</SelectItem>
                                  <SelectItem value="stageBilling">Billing Stage</SelectItem>
                                  <SelectItem value="other">Other Tasks</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" className={'hover:cursor-pointer'} onClick={() => setIsAddFieldDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button className={'hover:cursor-pointer'} onClick={handleAddField}>Add Field</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Configuration Table - ALWAYS SHOW CONFIGURED CLIENTS */}
                  {!dataLoaded ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                      <p className="mt-4 text-muted-foreground">Loading configuration data...</p>
                    </div>
                  ) : (
                    <>
                      {configuredClients.length > 0 ? (
                        <Card className="border rounded-lg shadow-none">
                          <ScrollArea className="w-full" type="always">
                            <div className="min-w-[1500px]">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr>
                                    <th
                                      className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-left font-medium text-gray-900 dark:text-gray-100 sticky left-0 z-20"
                                      rowSpan={2}
                                    >
                                      Sr. No
                                    </th>
                                    <th
                                      className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-left font-medium text-gray-900 dark:text-gray-100 sticky left-[38px] z-20"
                                      rowSpan={2}
                                    >
                                      Client Name
                                    </th>
                                    {getStageOneFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getStageOneFields().length}
                                      >
                                        1st Stage
                                      </th>
                                    )}
                                    {getStageTwoFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getStageTwoFields().length}
                                      >
                                        2nd Stage
                                      </th>
                                    )}
                                    {getStageThreeFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getStageThreeFields().length}
                                      >
                                        3rd Stage
                                      </th>
                                    )}
                                    {getStageBillingFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getStageBillingFields().length}
                                      >
                                        Billing Stage
                                      </th>
                                    )}
                                    {getOtherFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getOtherFields().length}
                                      >
                                        Other Tasks
                                      </th>
                                    )}
                                    <th
                                      className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100 "
                                      rowSpan={2}
                                    >
                                      Actions
                                    </th>
                                  </tr>
                                  <tr>
                                    {getStageOneFields().map((field, index) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100 relative group cursor-move"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, field.id, "stageOne", index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, "stageOne", index)}
                                      >
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-center leading-tight">{field.name}</span>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-blue-800 hover:text-blue-900 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleEditField(field)}
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-red-500 hover:text-red-700 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleDeleteFieldConfirm(field)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </th>
                                    ))}
                                    {getStageTwoFields().map((field, index) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100 relative group cursor-move"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, field.id, "stageTwo", index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, "stageTwo", index)}
                                      >
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-center leading-tight">{field.name}</span>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-blue-800 hover:text-blue-900 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleEditField(field)}
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-red-500 hover:text-red-700 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleDeleteFieldConfirm(field)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </th>
                                    ))}
                                    {getStageThreeFields().map((field, index) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100 relative group cursor-move"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, field.id, "stageThree", index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, "stageThree", index)}
                                      >
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-center leading-tight">{field.name}</span>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-blue-800 hover:text-blue-900 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleEditField(field)}
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-red-500 hover:text-red-700 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleDeleteFieldConfirm(field)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </th>
                                    ))}
                                    {getStageBillingFields().map((field, index) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100 relative group cursor-move"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, field.id, "stageBilling", index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, "stageBilling", index)}
                                      >
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-center leading-tight">{field.name}</span>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-blue-800 hover:text-blue-900 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleEditField(field)}
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-red-500 hover:text-red-700 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleDeleteFieldConfirm(field)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </th>
                                    ))}
                                    {getOtherFields().map((field, index) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100 relative group cursor-move"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, field.id, "other", index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, "other", index)}
                                      >
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-center leading-tight">{field.name}</span>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-blue-800 hover:text-blue-900 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleEditField(field)}
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-2 text-red-500 hover:text-red-700 hover:cursor-pointer hover:bg-white"
                                              onClick={() => handleDeleteFieldConfirm(field)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {configuredClients.map((client, clientIndex) => (
                                    <tr
                                      key={client._id}
                                      className={
                                        clientIndex % 2 === 0
                                          ? "bg-white dark:bg-slate-900/20"
                                          : "bg-gray-50 dark:bg-slate-800/20"
                                      }
                                    >
                                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200 sticky left-0 z-10 bg-inherit">
                                        {clientIndex + 1}
                                      </td>
                                      <td className="border text-sm border-gray-200 dark:border-gray-700 p-2 font-medium text-gray-800 dark:text-gray-200 sticky left-[38px] z-10 bg-inherit">
                                        {client.name}
                                      </td>
                                      {getStageOneFields().map((field) => (
                                        <td
                                          key={`${client._id}-${field.id}`}
                                          className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                        >
                                          <div className="flex justify-center">
                                            <Checkbox
                                              className="h-5 w-5 cursor-pointer rounded-sm"
                                              checked={clientFieldSelections[client._id]?.[field.id] || false}
                                              onCheckedChange={(checked) =>
                                                handleClientFieldToggle(client._id, field.id, checked)
                                              }
                                            />
                                          </div>
                                        </td>
                                      ))}
                                      {getStageTwoFields().map((field) => (
                                        <td
                                          key={`${client._id}-${field.id}`}
                                          className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                        >
                                          <div className="flex justify-center">
                                            <Checkbox
                                              className="h-5 w-5 cursor-pointer rounded-sm"
                                              checked={clientFieldSelections[client._id]?.[field.id] || false}
                                              onCheckedChange={(checked) =>
                                                handleClientFieldToggle(client._id, field.id, checked)
                                              }
                                            />
                                          </div>
                                        </td>
                                      ))}
                                      {getStageThreeFields().map((field) => (
                                        <td
                                          key={`${client._id}-${field.id}`}
                                          className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                        >
                                          <div className="flex justify-center">
                                            <Checkbox
                                              className="h-5 w-5 cursor-pointer rounded-sm"
                                              checked={clientFieldSelections[client._id]?.[field.id] || false}
                                              onCheckedChange={(checked) =>
                                                handleClientFieldToggle(client._id, field.id, checked)
                                              }
                                            />
                                          </div>
                                        </td>
                                      ))}
                                      {getStageBillingFields().map((field) => (
                                        <td
                                          key={`${client._id}-${field.id}`}
                                          className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                        >
                                          <div className="flex justify-center">
                                            <Checkbox
                                              className="h-5 w-5 cursor-pointer rounded-sm"
                                              checked={clientFieldSelections[client._id]?.[field.id] || false}
                                              onCheckedChange={(checked) =>
                                                handleClientFieldToggle(client._id, field.id, checked)
                                              }
                                            />
                                          </div>
                                        </td>
                                      ))}
                                      {getOtherFields().map((field) => (
                                        <td
                                          key={`${client._id}-${field.id}`}
                                          className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                        >
                                          <div className="flex justify-center">
                                            <Checkbox
                                              className="h-5 w-5 cursor-pointer rounded-sm"
                                              checked={clientFieldSelections[client._id]?.[field.id] || false}
                                              onCheckedChange={(checked) =>
                                                handleClientFieldToggle(client._id, field.id, checked)
                                              }
                                            />
                                          </div>
                                        </td>
                                      ))}
                                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 bg-red-50 hover:bg-red-100 hover:cursor-pointer hover:text-red-700"
                                          onClick={() => handleRemoveClientConfirm(client)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </Card>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Clients Configured</h3>
                          <p className="text-muted-foreground">
                            Use the dropdown above to select clients for progress tracking.
                          </p>
                        </div>
                      )}

                      {availableFields.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Fields Configured</h3>
                          <p className="text-muted-foreground">
                            Use the "Add Field" button above to create fields for progress tracking.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSaveConfiguration} className={'hover:cursor-pointer'} disabled={loading}>
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Edit Field Dialog */}
            <Dialog open={isEditFieldDialogOpen} onOpenChange={setIsEditFieldDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Field</DialogTitle>
                  <DialogDescription>Update the field name</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFieldName">Field Name</Label>
                    <Input
                      id="editFieldName"
                      value={editingField?.name || ""}
                      onChange={(e) => setEditingField((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter field name"
                      className={'border-slate-500'}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditFieldDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateField}>Update Field</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Field Confirmation Dialog */}
            <AlertDialog
              open={deleteFieldDialog.open}
              onOpenChange={(open) => setDeleteFieldDialog({ open, field: null })}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete Field
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Are you sure you want to delete the field <strong>"{deleteFieldDialog.field?.name}"</strong>?
                    </p>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3">
                      <p className="text-red-800 dark:text-red-400 text-sm font-medium">⚠️ Warning: This action will:</p>
                      <ul className="text-red-700 dark:text-red-300 text-sm mt-2 space-y-1 list-disc list-inside">
                        <li>Remove this field from all client configurations</li>
                        <li>Delete all progress data associated with this field</li>
                        <li>Remove this field from all existing and future reports</li>
                      </ul>
                      <p className="text-red-800 dark:text-red-400 text-sm font-medium mt-2">
                        This action cannot be undone.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={'hover:cursor-pointer'}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteField}
                    className="bg-[#ee264f] hover:bg-[#ee264ee1] dark:text-white focus:ring-red-600 hover:cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Yes, Delete Field"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete Client Confirmation Dialog */}
            <AlertDialog
              open={deleteClientDialog.open}
              onOpenChange={(open) => setDeleteClientDialog({ open, client: null })}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Remove Client from Progress Reports
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Are you sure you want to remove <strong>{deleteClientDialog.client?.name}</strong> from the
                      progress reporting system?
                    </p>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3">
                      <p className="text-red-800 dark:text-red-400 text-sm font-medium">⚠️ Warning: This action will:</p>
                      <ul className="text-red-700 dark:text-red-300 text-sm mt-2 space-y-1 list-disc list-inside">
                        <li>Remove the client from all future progress reports</li>
                        <li>Delete all existing progress history for this client</li>
                        <li>Remove all field configurations for this client</li>
                      </ul>
                      <p className="text-red-800 dark:text-red-400 text-sm font-medium mt-2">
                        This action cannot be undone.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={'hover:cursor-pointer'}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveClient}
                    className="bg-[#ee264f] hover:bg-[#ee264ee1] text-white cursor-pointer focus:ring-red-600"
                    disabled={loading}
                  >
                    {loading ? "Removing..." : "Yes, Remove Client"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl gap-2">
                  <FileText className="h-5 w-5" />
                  Monthly Work Progress Report
                </CardTitle>
                <CardDescription>
                  Track progress for configured clients ({configuredClients.length} clients configured)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {configuredClients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Clients Configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Please go to the Field Configuration tab and configure clients for progress tracking.
                    </p>
                    <Button onClick={() => setActiveTab("configuration")}>Go to Configuration</Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="month">Month</Label>
                        <Select
                          value={month ? month.toString() : undefined}
                          onValueChange={(value) => setMonth(Number.parseInt(value))}
                          disabled={loading}
                        >
                          <SelectTrigger className={'border-slate-500'}>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((m) => (
                              <SelectItem key={m.value} value={m.value.toString()}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select value={year || undefined} onValueChange={setYear} disabled={loading}>
                          <SelectTrigger className={'border-slate-500'}>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end gap-2">
                        <Button onClick={handleSearchReport} disabled={loading || !month || !year} className="flex-1 hover:cursor-pointer">
                          {loading ? "Searching..." : "Search"}
                        </Button>
                        {(existingReport || isCreating) && (
                          <Button
                            onClick={handleSaveReport}
                            disabled={loading}
                            className={`hover:cursor-pointer transition-colors duration-200 ${existingReport
                                ? 'bg-amber-500 hover:bg-amber-600 text-white' // Update - amber color
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white' // Create - green color
                              }`}
                            variant="default"
                          >
                            {loading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </div>
                            ) : existingReport ? "Update Report" : "Create Report"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {(isCreating || existingReport) && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">
                            {existingReport ? "Edit Progress Report" : "Create New Progress Report"}
                          </h3>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="flex items-center gap-2 hover:cursor-pointer bg-[#ee264f] hover:bg-[#ee264ee1] text-white"
                                onClick={handleDownloadExcel}
                                disabled={!month || !year || loading}
                              >
                                <Download className="h-4 w-4" />
                                Download Excel
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Checkbox checked={true} className="pointer-events-none" />
                                <span className="text-sm text-muted-foreground">Completed</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Checkbox checked={false} className="pointer-events-none" />
                                <span className="text-sm text-muted-foreground">Pending</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-red-500 font-bold text-lg">✕</span>
                                <span className="text-sm text-muted-foreground">Disabled</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Card className="border rounded-lg shadow-none">
                          <ScrollArea className="w-full" type="always">
                            <div className="min-w-[1500px]">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr>
                                    <th
                                      className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-left font-medium text-gray-900 dark:text-gray-100 sticky left-0 z-10"
                                      rowSpan={2}
                                    >
                                      Sr. No
                                    </th>
                                    <th
                                      className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-left font-medium text-gray-900 dark:text-gray-100 sticky left-[38px] z-10"
                                      rowSpan={2}
                                    >
                                      Client Name
                                    </th>
                                    {getStageOneFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getStageOneFields().length}
                                      >
                                        1st Stage
                                      </th>
                                    )}
                                    {getStageTwoFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getStageTwoFields().length}
                                      >
                                        2nd Stage
                                      </th>
                                    )}
                                    {getStageThreeFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getStageThreeFields().length}
                                      >
                                        3rd Stage
                                      </th>
                                    )}
                                    {getStageBillingFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getStageBillingFields().length}
                                      >
                                        Billing Stage
                                      </th>
                                    )}
                                    {getOtherFields().length > 0 && (
                                      <th
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100"
                                        colSpan={getOtherFields().length}
                                      >
                                        Other Tasks
                                      </th>
                                    )}
                                    <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium text-gray-900 dark:text-gray-100">
                                      Remark
                                    </th>
                                  </tr>
                                  <tr>
                                    {getStageOneFields().map((field) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                      >
                                        {field.name}
                                      </th>
                                    ))}
                                    {getStageTwoFields().map((field) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                      >
                                        {field.name}
                                      </th>
                                    ))}
                                    {getStageThreeFields().map((field) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                      >
                                        {field.name}
                                      </th>
                                    ))}
                                    {getStageBillingFields().map((field) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                      >
                                        {field.name}
                                      </th>
                                    ))}
                                    {getOtherFields().map((field) => (
                                      <th
                                        key={field.id}
                                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100"
                                        style={{ maxWidth: "100px", fontSize: "0.75rem" }}
                                      >
                                        {field.name}
                                      </th>
                                    ))}
                                    <th
                                      className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800/10 p-2 text-center font-medium whitespace-normal text-gray-900 dark:text-gray-100"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      Remark
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {configuredClients.map((client, index) => (
                                    <tr
                                      key={client._id}
                                      className={
                                        index % 2 === 0
                                          ? "bg-white dark:bg-slate-900/20"
                                          : "bg-gray-50 dark:bg-slate-800/20"
                                      }
                                    >
                                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200 sticky left-0 z-10 bg-inherit">
                                        {index + 1}
                                      </td>
                                      <td className="border text-sm border-gray-200 dark:border-gray-700 p-2 font-medium text-gray-800 dark:text-gray-200 sticky left-[38px] z-10 bg-inherit">
                                        {client.name}
                                      </td>

                                      {/* Stage One Fields */}
                                      {getStageOneFields().map((field) => {
                                        const isEnabled = isFieldEnabledForClient(client._id, field.id)
                                        return (
                                          <td
                                            key={`${client._id}-${field.id}`}
                                            className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                          >
                                            <div className="flex justify-center">
                                              {isEnabled ? (
                                                <Checkbox
                                                  className="h-5 w-5 cursor-pointer rounded-sm"
                                                  checked={taskStatus[`${client._id}-${field.id}`] || false}
                                                  onCheckedChange={(checked) =>
                                                    handleTaskChange(client._id, field.id, checked)
                                                  }
                                                  disabled={loading}
                                                />
                                              ) : (
                                                <div className="flex items-center justify-center h-5 w-5">
                                                  <span className="text-red-500 font-bold text-lg">✕</span>
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                        )
                                      })}

                                      {/* Stage Two Fields */}
                                      {getStageTwoFields().map((field) => {
                                        const isEnabled = isFieldEnabledForClient(client._id, field.id)
                                        return (
                                          <td
                                            key={`${client._id}-${field.id}`}
                                            className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                          >
                                            <div className="flex justify-center">
                                              {isEnabled ? (
                                                <Checkbox
                                                  className="h-5 w-5 cursor-pointer rounded-sm"
                                                  checked={taskStatus[`${client._id}-${field.id}`] || false}
                                                  onCheckedChange={(checked) =>
                                                    handleTaskChange(client._id, field.id, checked)
                                                  }
                                                  disabled={loading}
                                                />
                                              ) : (
                                                <div className="flex items-center justify-center h-5 w-5">
                                                  <span className="text-red-500 font-bold text-lg">✕</span>
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                        )
                                      })}

                                      {/* Stage Three Fields */}
                                      {getStageThreeFields().map((field) => {
                                        const isEnabled = isFieldEnabledForClient(client._id, field.id)
                                        return (
                                          <td
                                            key={`${client._id}-${field.id}`}
                                            className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                          >
                                            <div className="flex justify-center">
                                              {isEnabled ? (
                                                <Checkbox
                                                  className="h-5 w-5 cursor-pointer rounded-sm"
                                                  checked={taskStatus[`${client._id}-${field.id}`] || false}
                                                  onCheckedChange={(checked) =>
                                                    handleTaskChange(client._id, field.id, checked)
                                                  }
                                                  disabled={loading}
                                                />
                                              ) : (
                                                <div className="flex items-center justify-center h-5 w-5">
                                                  <span className="text-red-500 font-bold text-lg">✕</span>
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                        )
                                      })}

                                      {/* Billing Stage Fields */}
                                      {getStageBillingFields().map((field) => {
                                        const isEnabled = isFieldEnabledForClient(client._id, field.id)
                                        return (
                                          <td
                                            key={`${client._id}-${field.id}`}
                                            className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                          >
                                            <div className="flex justify-center">
                                              {isEnabled ? (
                                                <Checkbox
                                                  className="h-5 w-5 cursor-pointer rounded-sm"
                                                  checked={taskStatus[`${client._id}-${field.id}`] || false}
                                                  onCheckedChange={(checked) =>
                                                    handleTaskChange(client._id, field.id, checked)
                                                  }
                                                  disabled={loading}
                                                />
                                              ) : (
                                                <div className="flex items-center justify-center h-5 w-5">
                                                  <span className="text-red-500 font-bold text-lg">✕</span>
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                        )
                                      })}

                                      {/* Other Fields */}
                                      {getOtherFields().map((field) => {
                                        const isEnabled = isFieldEnabledForClient(client._id, field.id)
                                        return (
                                          <td
                                            key={`${client._id}-${field.id}`}
                                            className="border border-gray-200 dark:border-gray-700 p-2 text-center text-gray-800 dark:text-gray-200"
                                          >
                                            <div className="flex justify-center">
                                              {isEnabled ? (
                                                <Checkbox
                                                  className="h-5 w-5 cursor-pointer rounded-sm"
                                                  checked={taskStatus[`${client._id}-${field.id}`] || false}
                                                  onCheckedChange={(checked) =>
                                                    handleTaskChange(client._id, field.id, checked)
                                                  }
                                                  disabled={loading}
                                                />
                                              ) : (
                                                <div className="flex items-center justify-center h-5 w-5">
                                                  <span className="text-red-500 font-bold text-lg">✕</span>
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                        )
                                      })}

                                      {/* Remark */}
                                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-800 dark:text-gray-200">
                                        <Input
                                          type="text"
                                          value={remarks[client._id] || ""}
                                          onChange={(e) => handleRemarkChange(client._id, e.target.value)}
                                          className="w-full h-8 text-sm border-slate-500"
                                          placeholder="Enter remark"
                                          disabled={loading}
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </Card>
                      </div>
                    )}

                    {loading && !existingReport && !isCreating && (
                      <div className="flex flex-col items-center justify-center py-10">
                        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                        <p className="mt-4 text-muted-foreground">Loading report data...</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
