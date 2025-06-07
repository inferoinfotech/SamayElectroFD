import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'Helvetica',
    size: 'A4 landscape',
  },
  header: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  subheader: {
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#000',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    backgroundColor: '#b8e6fe',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#000',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    fontSize: 7,
    textAlign: 'center',
  },
  sNoCol: {
    width: '4%',
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#000',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    fontSize: 7,
    textAlign: 'center',
  },
  fieldCol: {
    width: '20%',
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#000',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    fontSize: 7,
    fontWeight: 'bold',
  },
  abtMeterCell: {
    backgroundColor: '#ffffcc',
  },
  mobileCell: {
    backgroundColor: '#ccffff',
  },
  simCell: {
    backgroundColor: '#ffcccc',
  },
  clientNameCell: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  stationNameCell: {
    fontSize: 7,
    textAlign: 'center',
  },
  partClientHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
    backgroundColor: '#e6e6e6',
    padding: 3,
  },
  partClientTable: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 5,
  },
  mainMeterRow: {
    backgroundColor: '#FEDE00',
  },
  checkMeterRow: {
    backgroundColor: '#FD7F20',
  },
  serialNumberHeader: {
    backgroundColor: '#b8e6fe',
    fontWeight: 'bold',
  },
  feederNameHeader: {
    backgroundColor: '#b8e6fe',
    fontWeight: 'bold',
  },
});

const getNestedValue = (obj, path) => {
  if (!obj) return "";
  if (obj[path] !== undefined) return obj[path] || "-";
  try {
    const value = path.split(".").reduce((o, p) => (o ? o[p] : ""), obj);
    return value || "-";
  } catch (e) {
    console.error(`Error getting nested value for path ${path}:`, e);
    return "-";
  }
};

export const ClientDetailsPDF = ({ mainClient, subClients, partClients, allFields }) => {
  const mainTableFields = allFields.filter(field => !field.partClientOnly);
  const partClientSpecificFields = [
    { id: 'divisionName', label: 'Division Name' },
    { id: 'consumerNo', label: 'Consumer No.' },
    { id: 'sharingPercentage', label: 'Sharing Percentage' }
  ];

  const getCellStyle = (fieldId, value) => {
    if (!value || value === "-") return null;
    if (fieldId.includes('abtMeter')) return styles.abtMeterCell;
    if (fieldId.includes('mobileNo')) return styles.mobileCell;
    if (fieldId.includes('simNo')) return styles.simCell;
    return null;
  };

  const calculateColumnWidth = (numColumns) => {
    const availableWidth = 96; // 100% - serial number (4%) - field name (20%)
    return `${availableWidth / numColumns}%`;
  };

  const hasPartClients = subClients.some(subClient =>
    partClients[subClient._id] && partClients[subClient._id].length > 0
  );

  const mainClientColWidth = calculateColumnWidth(1 + subClients.length);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.header}>{mainClient.name}</Text>
        <Text style={styles.subheader}>{mainClient.subTitle}</Text>
        <View style={styles.table}>
          {/* <View style={styles.tableHeaderContainer}> */}

          {/* </View> */}

          <View style={styles.tableRow}>
            <View style={[styles.sNoCol, styles.serialNumberHeader]}>
              <Text>S.No.</Text>
            </View>
            <View style={[styles.fieldCol, styles.feederNameHeader]}>
              <Text>HEAD NAME =&gt;</Text>
            </View>
            <View style={[styles.tableColHeader, { width: mainClientColWidth }]}>
              <Text style={styles.clientNameCell}>RE GENERATOR</Text>
            </View>

            {subClients.map((client, index) => (
              <View key={`sub-client-${index}`} style={[styles.tableColHeader, { width: mainClientColWidth }]}>
                <Text style={styles.clientNameCell}>{`SUB RE GENERATOR-0${index + 1}`}</Text>
              </View>
            ))}
          </View>

          {mainTableFields.map((field, rowIndex) => {
            const isMainMeterRow = [
              'abtMainMeter.meterNumber',
              'abtMainMeter.modemNumber',
              'abtMainMeter.mobileNumber',
              'abtMainMeter.simNumber'
            ].some(id => field.id.includes(id));

            const isCheckMeterRow = [
              'abtCheckMeter.meterNumber',
              'abtCheckMeter.modemNumber',
              'abtCheckMeter.mobileNumber',
              'abtCheckMeter.simNumber'
            ].some(id => field.id.includes(id));

            const mainClientValue = getNestedValue(mainClient, field.id);
            const hasMainClientData = mainClientValue && mainClientValue !== "-";

            return (
              <View
                key={`row-${field.id}`}
                style={[
                  styles.tableRow,
                  isMainMeterRow && hasMainClientData && styles.mainMeterRow,
                  isCheckMeterRow && hasMainClientData && styles.checkMeterRow
                ]}
              >
                <View style={styles.sNoCol}>
                  <Text>{rowIndex + 1}</Text>
                </View>
                <View style={styles.fieldCol}>
                  <Text>{field.label}</Text>
                </View>

                <View style={[styles.tableCol, getCellStyle(field.id, mainClientValue), { width: mainClientColWidth }]}>
                  <Text>{mainClientValue}</Text>
                </View>

                {subClients.map((client, clientIndex) => {
                  const clientValue = getNestedValue(client, field.id);
                  const hasClientData = clientValue && clientValue !== "-";

                  return (
                    <View
                      key={`sub-data-${clientIndex}`}
                      style={[
                        styles.tableCol,
                        getCellStyle(field.id, clientValue),
                        { width: mainClientColWidth },
                        isMainMeterRow && hasClientData && styles.mainMeterRow,
                        isCheckMeterRow && hasClientData && styles.checkMeterRow
                      ]}
                    >
                      <Text>{clientValue}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </Page>

      {hasPartClients && subClients.map((subClient, subIndex) => {
        const clientPartClients = partClients[subClient._id] || [];
        if (clientPartClients.length === 0) return null;

        const partClientColWidth = calculateColumnWidth(clientPartClients.length);

        return (
          <Page key={`part-page-${subIndex}`} size="A4" orientation="landscape" style={styles.page}>
            <Text style={styles.partClientHeader}>
              PART CLIENTS FOR {subClient.name.toUpperCase()}
            </Text>

            <View style={styles.partClientTable}>
              <View style={styles.tableRow}>
                <View style={[styles.sNoCol, styles.serialNumberHeader]}>
                  <Text>Sr. No.</Text>
                </View>
                <View style={[styles.fieldCol, styles.feederNameHeader]}>
                  <Text>Field Name</Text>
                </View>
                {clientPartClients.map((partClient, partIndex) => (
                  <View key={`part-header-${partIndex}`} style={[styles.tableColHeader, { width: partClientColWidth }]}>
                    <Text style={styles.clientNameCell}>{`PART CLIENT-${String(partIndex + 1).padStart(2, '0')}`}</Text>
                  </View>
                ))}
              </View>

              {partClientSpecificFields.map((field, rowIndex) => (
                <View key={`part-row-${field.id}`} style={styles.tableRow}>
                  <View style={styles.sNoCol}>
                    <Text>{rowIndex + 1}</Text>
                  </View>
                  <View style={styles.fieldCol}>
                    <Text>{field.label}</Text>
                  </View>
                  {clientPartClients.map((partClient, partIndex) => {
                    const partClientValue = getNestedValue(partClient, field.id);
                    return (
                      <View
                        key={`part-data-${partIndex}`}
                        style={[
                          styles.tableCol,
                          { width: partClientColWidth }
                        ]}
                      >
                        <Text>{partClientValue}</Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};