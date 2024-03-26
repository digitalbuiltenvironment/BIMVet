const fs = require('fs');

async function getAccesstoken() {
  return new Promise((resolve, reject) => {
    const url = 'https://developer.api.autodesk.com/authentication/v2/token';
    const clientId = 'elZZvtRxfP3GnQV3yIqVIxLZcbXtxWdn';
    const clientSecret = 'GUzOo7PTP8GSMnWK';

    const basicAuth = btoa(`${clientId}:${clientSecret}`).toString();
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append(
      'scope',
      'bucket:create bucket:read data:create data:write data:read viewables:read'
    );
    // console.log(formData.toString());

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: formData.toString(),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log('Token response:', data);
        resolve(data); // Resolve the promise with the token data
      })
      .catch((error) => {
        console.error('Error fetching token:', error);
        reject(error); // Reject the promise with the error
      });
  });
}
async function getAllViewables(accessToken, urlSafeUrn) {
  const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urlSafeUrn}/metadata`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to get metadata: ${response.status} - ${errorData.reason}`
      );
    }

    const responseData = await response.json();
    // console.log('Metadata response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting metadata:', error.message);
    throw error;
  }
}
async function getAllViewableProperties(accessToken, urlSafeUrn, viewableGuid) {
  const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urlSafeUrn}/metadata/${viewableGuid}/properties?forceget=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to get viewable properties: ${response.status} - ${errorData.reason}`
      );
    }

    const responseData = await response.json();
    // console.log('Viewable properties response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting viewable properties:', error.message);
    throw error;
  }
}
async function sortMetadata(metadata) {
  let folderStructureData = {};
  let newObjectGroup = {};
  let newObjectGroupList = [];
  let modelObject = {};
  let modelObjectList = [];
  let modelHigherObjectLevel = {};
  for (let i = 0; i < metadata.length; i++) {
    try {
      if (/\[.*\]/.test(metadata[i].name)) {
        // checkes if the string contains brackets with content in between
        // console.log("The string contains brackets with content in between");
      } else {
        throw new Error(
          'The string does not contain brackets with content in between'
        );
      }
      const objectAssemblyCode =
        metadata[i].properties['Identity Data']['Assembly Code'];
      const objectAssemblyDescription =
        metadata[i].properties['Identity Data']['Assembly Description'];
      const objectDescription =
        metadata[i].properties['Identity Data']['Description'];
      const objectTypeComment =
        metadata[i].properties['Identity Data']['Type Comments'];
      const objectTypeName =
        metadata[i].properties['Identity Data']['Type Name'];
      const objectStructuralMaterials =
        metadata[i].properties['Materials and Finishes']['Structural Material'];
      const objectMaterials =
        metadata[i].properties['Materials and Finishes']['Material'];
      modelObject = {
        name: metadata[i].name,
        properties: {
          'Assembly Code': objectAssemblyCode,
          'Assembly Description': objectAssemblyDescription,
          Description: objectDescription,
          'Type Comments': objectTypeComment,
          'Type Name': objectTypeName,
          'Structural Material': objectStructuralMaterials,
          Material: objectMaterials,
        },
      };

      // console.log(modelObject);
      // // wait for 1 second before fetching the next object
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      modelObjectList.push(modelObject);

      // [metadata[i].properties['Identity Data']['Description'] || '']
      // // objectProperties.data.collection[i].properties?.['Materials and Finishes']['Structural Material'] || '',
      // [metadata[i].properties?.['Identity Data']['Type Name'] || '']

      // console.log(metadata[i].name);
      // console.log(modelObjectList);
    } catch (error) {
      // Find the folder structure
      const folderName = metadata[i].name;
      const folderProp = metadata[i].properties;
      const folderObjectID = metadata[i].objectid;

      if (Object.keys(folderProp).length <= 0 && folderObjectID < 2000) {
        if (Object.keys(modelHigherObjectLevel).length > 0) {
          newObjectGroup = { [folderName]: modelHigherObjectLevel };
        } else if (newObjectGroupList.length > 0) {
          newObjectGroup = { [folderName]: newObjectGroupList };
        } else if (Object.keys(newObjectGroup).length <= 0) {
          newObjectGroup = { [folderName]: modelObjectList };
        }
        folderStructureData = {
          ...folderStructureData,
          ...newObjectGroup,
        };
        newObjectGroup = {};
        newObjectGroupList = [];
        modelHigherObjectLevel = {};
      } else {
        // console.log(folderName);
        if (modelObjectList <= 0) {
          // console.log(folderName);
          modelHigherObjectLevel = {
            ...modelHigherObjectLevel,
            [folderName]: newObjectGroupList,
          };
          newObjectGroupList = [];
        } else {
          newObjectGroup = { [folderName]: modelObjectList };
          newObjectGroupList.push(newObjectGroup);
        }

        // console.log(newObjectGroup);
        // console.log(folderName);
        // console.error(error);
      }
      modelObjectList = [];
    }
    // await new Promise((resolve) => setTimeout(resolve, 100));
  }
  // console.log(folderStructureData);

  const jsonString = JSON.stringify(folderStructureData, null, 2);
  return folderStructureData;
  // const fileName = 'output.json';

  // fs.writeFile(fileName, jsonString, 'utf8', (err) => {
  //   if (err) {
  //     console.error('Error writing to file:', err);
  //   } else {
  //     console.log('Object written to', fileName);
  //   }
  // });
}

function convertToCSV(jsonData) {
  const csvArray = [
    [
      'Family',
      'SubFamily',
      'ObjectGroup',
      'ObjectName',
      'ObjectID',
      'Assembly Code',
      'Assembly Description',
      'Description',
      'Type Comments',
      'Type Name',
      'Structural Material',
      'Material',
    ],
  ];
  const MCRFamily = [
    'Casework',
    'Doors',
    'Glass Doors',
    'Floors',
    'Floors/Ramps',
    'Slab Edges',
    'Railing',
    'Roofs',
    'Roofs (Sloped Glazing)',
    'Fascias',
    'Gutters',
    'Specialty Equipment',
    'Staircase',
    'Walls',
    'Curtain Walls',
    'Generic Model',
    'Windows',
    'Generic Models',
    'Columns',
    'Structural Columns',
    'Structural Framing (Others)',
    'Structural Framing (Horizontal Bracing)',
    'Structural Framing (Girders)',
    'Structural Framing (Purlins)',
    'Cable Tray with Fittings',
    'Cable Tray Fittings',
    'Cable Trays Fittings',
    'Pipes',
    'Pipe Fittings',
    'Generic Model',
    'Wire',
    'Conduit with Fittings',
    'Conduits Fittings',
    'Ducts',
    'Duct Fittings',
    'Cable Trays',
    'Electrical Equipment',
    'Mechanical Equipment',
    'Electrical Fixtures',
    'Air Terminals',
    'Pipe Accessories',
    'Duct Accessories',
    'Lighting Devices',
    'Generic Model (Surface Mounted)',
    'Rooms',
    'Areas - GFA',
    'Areas - NLA',
    'Spaces',
    'Area',
    'Rooms',
    'Planting',
    'Fixtures',
    'Room',
    'Spaces',
    'Furniture',
    'Plumbing Fixtures',
    'Specialty Equipment',
    'Lighting Fixtures',
    'Fire Alarm Devices',
    'Structural Framing',
    'Structural Foundations',
    'Parking',
    'Data Devices',
    'Site',
  ];
  for (let i = 0; i < jsonData.length; i++) {
    // Header row
    const familyName = Object.keys(jsonData[i]).reduce((acc, key) => {
      // console.log(key);
      // console.log(jsonData[key]);
      if (MCRFamily.includes(key)) {
        for (let l = 0; l < Object.keys(jsonData[i][key]).length; l++) {
          const innerKey = Object.keys(jsonData[i][key])[l];
          try {
            const innerKeyNameID = innerKey.split(' [');
            const innerKeyName = innerKeyNameID[0];
            const innerKeyID = '[' + innerKeyNameID[1];
            if (/\[.*\]/.test(innerKey)) {
              csvArray.push([
                key,
                '',
                '',
                innerKeyName,
                innerKeyID,
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
              ]);
            } else {
              const subFamilyGroup = jsonData[i][key][innerKey];
              for (let j = 0; j < subFamilyGroup.length; j++) {
                // Get ObjectGroup
                const objectGroupArray = subFamilyGroup[j];
                const objectSubGroup = Object.keys(objectGroupArray);
                for (let k = 0; k < objectSubGroup.length; k++) {
                  const objectGroup = objectSubGroup[k];
                  const objectValue = Object.values(objectGroupArray)[k];
                  for (let m = 0; m < objectValue.length; m++) {
                    const objectNameID = objectValue[m].name.split(' [');
                    const objectName = objectNameID[0];
                    const objectID = '[' + objectNameID[1];
                    const objectProperties = objectValue[m].properties;
                    let objectAssemblyCode = '';
                    let objectAssemblyDescription = '';
                    let objectDescription = '';
                    let objectTypeComments = '';
                    let objectTypeName = '';
                    let objectStructuralMaterial = '';
                    let objectMaterial = '';
                    try {
                      objectAssemblyCode = objectProperties['Assembly Code'];
                      if (typeof objectAssemblyCode === 'undefined') {
                        objectAssemblyCode = '';
                      }
                    } catch {
                      objectAssemblyCode = '';
                    }
                    try {
                      objectAssemblyDescription =
                        objectProperties['Assembly Description'];
                      if (typeof objectAssemblyDescription === 'undefined') {
                        objectAssemblyDescription = '';
                      }
                    } catch {
                      objectAssemblyDescription = '';
                    }
                    try {
                      objectDescription = objectProperties.Description;
                      if (typeof objectDescription === 'undefined') {
                        objectDescription = '';
                      }
                    } catch {
                      objectDescription = '';
                    }
                    try {
                      objectTypeComments = objectProperties['Type Comments'];
                      if (typeof objectTypeComments === 'undefined') {
                        objectTypeComments = '';
                      }
                    } catch {
                      objectTypeComments = '';
                    }
                    try {
                      objectTypeName = objectProperties['Type Name'];
                      if (typeof objectTypeName === 'undefined') {
                        objectTypeName = '';
                      }
                    } catch {
                      objectTypeName = '';
                    }
                    try {
                      objectStructuralMaterial =
                        objectProperties['Structural Material'];
                      if (typeof objectStructuralMaterial === 'undefined') {
                        objectStructuralMaterial = '';
                      }
                    } catch {
                      objectStructuralMaterial = '';
                    }
                    try {
                      objectMaterial = objectProperties.Material;
                      if (typeof objectMaterial === 'undefined') {
                        objectMaterial = '';
                      }
                    } catch {
                      objectMaterial = '';
                    }
                    csvArray.push([
                      key,
                      innerKey,
                      objectGroup,
                      objectName,
                      objectID,
                      objectAssemblyCode,
                      objectAssemblyDescription,
                      objectDescription,
                      objectTypeComments,
                      objectTypeName,
                      objectStructuralMaterial,
                      objectMaterial,
                    ]);
                  }
                }
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        console.log(key);
      }
    }, []);
  }
  return csvArray;
}

async function extractMetadata(urn, outputNumber) {
  try {
    let token = await getAccesstoken(); // Get Autodesk API token
    // console.log(token);
    const viewableObjects = await getAllViewables(token.access_token, urn); // get all Viewables
    const allObjects = [];

    for (const viewableObject of viewableObjects.data.metadata) {
      // Wait for 0.5 second before fetching another object properties
      await new Promise((resolve) => setTimeout(resolve, 500));
      const objectName = viewableObject.name;
      const objectRole = viewableObject.role;
      const objectGUID = viewableObject.guid;
      // console.log(objectName, objectRole);
      try {
        let objectProperties = await getAllViewableProperties(
          token.access_token,
          urn,
          objectGUID
        );
        // console.log(objectName);
        // console.log(objectProperties);
        while (objectProperties.result === 'success') {
          console.log(`Extracting ${objectName} metadata...`);

          // Wait for 1 second before fetching object properties
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Fetch object properties again inside the loop
          const updatedObjectProperties = await getAllViewableProperties(
            token.access_token,
            urn,
            objectGUID
          );

          // Update objectProperties for the next iteration
          objectProperties = updatedObjectProperties;
        }
        // console.log(objectProperties);
        const jsonMetadata = await sortMetadata(
          objectProperties.data.collection
        );
        allObjects.push(jsonMetadata);
        // Add the current row to CSV data array
        // console.log(csvData);

        // console.log(objectProperties.data.collection); // Log the final objectProperties when the loop exits
      } catch (error) {
        console.error(error);
      }
    }
    const test2 = convertToCSV(allObjects);
    // Write CSV data to a file
    // Convert data to CSV format
    const csvContent = test2
      .map((row) => row.map((col) => `"${col}"`).join(','))
      .join('\n');

    // Specify the file path
    const filePath = 'output'+ outputNumber +'.csv';

    // Write to the CSV file
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    console.log(`CSV file saved at: ${filePath}`);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// await extractMetadata(
//   'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3Rlc3RvYmplY3QucnZ0'
// );

extractList = [
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L0FNS19UU0NfQVJfMy01JTIwTFZMX1JWVC0yMDE5XzAwMDAxLnJ2dA',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L0FNS19UU0NfQVJfNi1ST09GX1JWVC0yMDE5XzAwMDAxLnJ2dA',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L0FNS19UU0NfQVJfMS0yJTIwTFZMX1JWVC0yMDE5XzAwMDAxLnJ2dA',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L09NQzItUE9DLUJJTS1NRS1GUC1OQS1TLTAwLVJWVDIyMDAxLnJ2dA',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L09NQzItUE9DLUJJTS1NRS1TTi1OQS1TLTAwLVJWVDIyMDAxLnJ2dA',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1HVE0tQklNLVNULVNUTC1BTEwtQUxMLUFMTC1SVlQyMDAwMi5ydnQ',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1ORS1CSU0tRUwtRUctQUxMLUFMTC1BTEwtUlZUMjAwMDUucnZ0',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1HVE0tQklNLVNULVNUTC1BTEwtQUxMLUFMTC1SVlQyMDAwMi5ydnQ',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1VU1MtQklNLVNULVBDVC1BTEwtQUxMLUFMTC1SVlQyMDAwMy5ydnQ',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1UTEVDLUJJTS1NRS1QTC1BTEwtQUxMLUFMTC1SVlQyMDAwNi5ydnQ',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1XUy1CSU0tQVItRkFDLUFMTC1BTEwtQUxMLVJWVDIwMDAyLnJ2dA',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1CT1VTLUJJTS1BUi1OQS1BTEwtQUxMLUFMTC1SVlQyMDAwNC5ydnQ',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1DQy1CSU0tQVItU0lHTi1BTEwtQUxMLUFMTC1SVlQyMDAwMy5ydnQ',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L1NDUy1ERVNILUJJTS1BUi1GQUMtQUxMLUFMTC1BTEwtUlZUMjAwMDIucnZ0',
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L09NQzItUE9DLUJJTS1BUi1NSVNDLU5BLVMtTkEtUlZUMjAwMDEucnZ0',
];

async function main() {
  for (let i = 0; i < extractList.length; i++) {
    console.log('Extracting: ' + extractList[i]);
    await extractMetadata(extractList[i], i);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});