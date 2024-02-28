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
async function extractMetadata(urn) {
  try {
    let token = await getAccesstoken(); // Get Autodesk API token
    console.log(token);
    const viewableObjects = await getAllViewables(token.access_token, urn); // get all Viewables
    const csvData = []; // Array to store CSV data
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
        console.log(objectProperties);
        let csvRow = [];
        for (let i = 0; i < objectProperties.data.collection.length; i++) {
         console.log(objectProperties.data.collection[i].properties['Identity Data']);
          csvRow = [
            objectProperties.data.collection[i].properties['Identity Data'].Description || '',
            // objectProperties.data.collection[i].properties?.['Materials and Finishes']['Structural Material'] || '',
            objectProperties.data.collection[i].properties?.['Identity Data']['Type Name'] || '',
          ];
            csvData.push(csvRow.join(','));
        }

        // Add the current row to CSV data array
        console.log(csvData)

        // console.log(objectProperties.data.collection); // Log the final objectProperties when the loop exits
      } catch (error) {
        console.error(error);
      }
    }
    // Write CSV data to a file
    const csvFilePath = 'output.csv';
    fs.writeFileSync(csvFilePath, csvData.join('\n'));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

extractMetadata(
  'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3Rlc3RvYmplY3QucnZ0'
);
