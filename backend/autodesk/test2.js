const fs = require('fs');
const util = require('util');

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

async function extractMetadata(urn) {
  try {
    let token = await getAccesstoken(); // Get Autodesk API token
    // console.log(token);
    const viewableObjects = await getAllViewables(token.access_token, urn); // get all Viewables
    const viewableObject = viewableObjects.data.metadata[0];
    const allObjects = [];

    for (const viewableObject of viewableObjects.data.metadata) {
      // Wait for 0.5 second before fetching another object properties
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
        // console.log(objectName);
        // console.log(objectProperties);
        while (objectProperties.result === 'success') {
          console.log(`Extracting ${objectName} metadata...`);

          // Wait for 1 second before fetching object properties
          await new Promise((resolve) => setTimeout(resolve, 1000));

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
        // console.log(csvData);

        // console.log(objectProperties.data.collection); // Log the final objectProperties when the loop exits
      } catch (error) {
        console.error(error);
      }
    }
    const test2 = convertToCSV(allObjects);
    console.log(test2);
    const csvArray = [['Family', 'SubFamily', 'ObjectGroup', 'ObjectName', 'Assembly Code', 'Assembly Description', 'Description', 'Type Comments', 'Type Name', 'Structural Material', 'Material']];
    // Write CSV data to a file
    const csvFilePath = 'output.csv';
    // fs.writeFileSync(csvFilePath, csvData.join('\n'));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

extractMetadata(
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3Rlc3RvYmplY3QucnZ0'
);
