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

      modelObjectList.push(modelObject);
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
        if (modelObjectList <= 0) {
          modelHigherObjectLevel = {
            ...modelHigherObjectLevel,
            [folderName]: newObjectGroupList,
          };
          newObjectGroupList = [];
        } else {
          newObjectGroup = { [folderName]: modelObjectList };
          newObjectGroupList.push(newObjectGroup);
        }
      }
      modelObjectList = [];
    }
  }

  const jsonString = JSON.stringify(folderStructureData, null, 2);
  return folderStructureData;
}

function convertToCSV(jsonData) {
  const csvArray = [
    [
      'Family',
      'SubFamily',
      'ObjectGroup',
      'ObjectName',
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
      if (MCRFamily.includes(key)) {
        for (let l = 0; l < Object.keys(jsonData[i][key]).length; l++) {
          const innerKey = Object.keys(jsonData[i][key])[l];
          try {
            if (/\[.*\]/.test(innerKey)) {
              csvArray.push([
                key,
                '',
                '',
                innerKey,
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
                    const objectName = objectValue[m].name;
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

async function extractMetadata(urn) {
  try {
    let token = await getAccesstoken(); // Get Autodesk API token
    const viewableObjects = await getAllViewables(token.access_token, urn); // get all Viewables
    const allObjects = [];

    for (const viewableObject of viewableObjects.data.metadata) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const objectName = viewableObject.name;
      const objectRole = viewableObject.role;
      const objectGUID = viewableObject.guid;
      try {
        let objectProperties = await getAllViewableProperties(
          token.access_token,
          urn,
          objectGUID
        );
        while (objectProperties.result === 'success') {
          console.log(`Extracting ${objectName} metadata...`);

          // Wait for 1 second before fetching object properties
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Fetch object properties again inside the loop
          const updatedObjectProperties = await Client.getAllViewableProperties(
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
      } catch (error) {
        console.error(error);
      }
    }
    const test2 = convertToCSV(allObjects);
    const csvContent = test2
      .map((row) => row.map((col) => `"${col}"`).join(','))
      .join('\n');

    // Specify the file path
    const filePath = 'output.csv';

    // Write to the CSV file
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    console.log(`CSV file saved at: ${filePath}`);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

extractMetadata(
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3Rlc3RvYmplY3QucnZ0'
);
