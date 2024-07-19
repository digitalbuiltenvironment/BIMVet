import Client from './Autodesk_Functions';
import JSZip from 'jszip'; // Import JSZip library (make sure to include it in your project)

let totalObjects;
let objectsProcessed = 0;
let csvDataArray = [];
let csvFileNames = [];

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
      // const objectAssemblyCode =
      //   metadata[i].properties['Identity Data']['Assembly Code'];
      // const objectAssemblyDescription =
      //   metadata[i].properties['Identity Data']['Assembly Description'];
      const objectDescription =
        metadata[i].properties['Identity Data']['Description'];
      // const objectTypeComment =
      //   metadata[i].properties['Identity Data']['Type Comments'];
      const objectTypeName =
        metadata[i].properties['Identity Data']['Type Name'];
      const objectStructuralMaterials =
        metadata[i].properties['Materials and Finishes']['Structural Material'];
      const objectMaterials =
        metadata[i].properties['Materials and Finishes']['Material'];
      modelObject = {
        name: metadata[i].name,
        externalID: metadata[i].externalId,
        properties: {
          // 'Assembly Code': objectAssemblyCode,
          // 'Assembly Description': objectAssemblyDescription,
          Description: objectDescription,
          // 'Type Comments': objectTypeComment,
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

      // Most of the time objectID is less than 4000
      if (Object.keys(folderProp).length <= 0 && folderObjectID < 4000) {
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

async function convertToCSV(jsonData) {
  const csvArray = [
    [
      'Family',
      'SubFamily',
      'ObjectGroup',
      'ObjectName',
      'ObjectID',
      // 'Assembly Code',
      // 'Assembly Description',
      'Description',
      // 'Type Comments',
      'Type Name',
      'Structural Material',
      'Material',
      'objectNamewithID',
      'objectExternalID',
    ],
  ];
  const MCRFamily = [
    'Columns',
    'Doors',
    'Floors',
    'Roofs',
    'Walls',
    'Windows',
    'Fire Alarm Devices',
  ];
  // console.log(jsonData);

  for (const familyName in jsonData) {
    if (MCRFamily.includes(familyName)) {
      for (const subFamily in jsonData[familyName]) {
        const subFamilyGroup = jsonData[familyName][subFamily];
        for (let i = 0; i < subFamilyGroup.length; i++) {
          const objectGroupArray = subFamilyGroup[i];
          for (const objectGroup in objectGroupArray) {
            const objectList = objectGroupArray[objectGroup];
            for (let j = 0; j < objectList.length; j++) {
              const object = objectList[j];
              const objectNameID = object.name.split(' [');
              const objectName = objectNameID[0];
              const objectID = '[' + objectNameID[1];
              const objectProperties = object.properties;

              // const objectAssemblyCode = objectProperties['Assembly Code'] || '';
              // const objectAssemblyDescription = objectProperties['Assembly Description'] || '';
              const objectDescription = objectProperties.Description || '';
              // const objectTypeComments = objectProperties['Type Comments'] || '';
              const objectTypeName = objectProperties['Type Name'] || '';
              const objectStructuralMaterial =
                objectProperties['Structural Material'] || '';
              const objectMaterial = objectProperties.Material || '';
              const objectNamewithID = object.name;
              const objectExternalID = object.externalID;

              csvArray.push([
                familyName.toString(),
                subFamily.toString(),
                objectGroup.toString(),
                objectName.toString(),
                objectID.toString(),
                // objectAssemblyCode,
                // objectAssemblyDescription,
                objectDescription.toString(),
                // objectTypeComments,
                objectTypeName.toString(),
                objectStructuralMaterial.toString(),
                objectMaterial.toString(),
                objectNamewithID.toString(),
                objectExternalID.toString(),
              ]);
            }
          }
        }
      }
    }
  }

  return csvArray;
}

async function fetchData() {
  const response = await fetch('/api/load-csv');
  const result = await response.json();
  return result;
}

function findAllObject(obj, keytofind) {
  let result = [];
  let found = false;

  function searchForObject(item) {
    if (typeof item === 'object' && item !== null) {
      for (const key in item) {
        if (key === keytofind) {
          if (Array.isArray(item[key])) {
            found = true;
            result = result.concat(item[key]);
          } else {
            found = true;
            result.push(item[key]);
          }
        } else {
          searchForObject(item[key]);
        }
      }
    }
  }

  searchForObject(obj);
  if (found) {
    return result;
  } else {
    return found;
  }
}

function breakDownData(data, testData) {
  // console.log(data.Parameters);
  const requiredProperties = data.Parameters;
  // Check if all required properties are present in properties object
  let problems = [];
  let goodParameters = [];
  let flagProblems = [];

  for (let prop in requiredProperties) {
    let foundObject = findAllObject(testData, prop);
    // console.log(prop);
    if (foundObject.length > 0) {
      let isBlank = true;
      for (let i = 0; i < foundObject.length; i++) {
        if (
          foundObject[i] != '' &&
          foundObject[i] != null &&
          foundObject[i] != undefined &&
          foundObject[i] != ' ' &&
          foundObject[i] != '  '
        ) {
          const cleanUpfoundObject = foundObject[i].replace(/\,/g, ' ');
          // console.log(foundObject[i]);
          const [reqType, reqUnit, reqDesc] =
            requiredProperties[prop].split('||');
          // console.log(
          //   `reqType: ${reqType}, reqUnit: ${reqUnit}, reqDesc: ${reqDesc}`
          // );
          if (reqType.toLowerCase().includes('boolean')) {
            if (
              cleanUpfoundObject.toLowerCase() === 'true' ||
              cleanUpfoundObject.toLowerCase() === 'false'
            ) {
              goodParameters.push(
                `${prop} is correct with ${cleanUpfoundObject}`
              );
            } else {
              flagProblems.push(
                `${prop} is potentially inaccurate with '${cleanUpfoundObject}' Please double-check.`
              );
            }
          }
          if (reqType.toLowerCase().includes('number')) {
            const getNumber = parseFloat(cleanUpfoundObject.split(' ')[0]);
            if (!isNaN(getNumber)) {
              if (getNumber != 0) {
                goodParameters.push(
                  `${prop} is correct with '${cleanUpfoundObject}'`
                );
              } else if (prop.toLocaleLowerCase().includes('firerating')) {
                problems.push(
                  `${prop} is incorrect with '${cleanUpfoundObject}' Should not be 0`
                );
              } else {
                flagProblems.push(
                  `${prop} is potentially inaccurate with '${cleanUpfoundObject}' Please double-check.`
                );
              }
            } else {
              if (reqDesc !== '') {
                flagProblems.push(
                  `${prop} is incorrect with '${cleanUpfoundObject}' _ ${reqDesc}`
                );
              }
              flagProblems.push(
                `${prop} is potentially inaccurate with '${cleanUpfoundObject}' Please double-check.`
              );
            }
          }
          if (
            reqType.toLowerCase().includes('text') ||
            reqType.toLowerCase().includes('value')
          ) {
            if (
              foundObject[i] != 'N.A.' &&
              foundObject[i] != 'NA' &&
              foundObject[i] != 'N.A'
            ) {
              goodParameters.push(
                `${prop} is correct with '${cleanUpfoundObject}'`
              );
            } else {
              flagProblems.push(
                `${prop} is potentially inaccurate with '${cleanUpfoundObject}' Please double-check.`
              );
            }
          }
          if (reqType.toLowerCase().includes('date')) {
            let parsedDate = 'Not a date';
            try {
              parsedDate = Date.parse(cleanUpfoundObject);
            } catch (err) {
              parsedDate = 'Not a date';
            }
            if (!isNaN(parsedDate)) {
              goodParameters.push(
                `${prop} is correct with '${cleanUpfoundObject}'`
              );
            } else {
              problems.push(
                `${prop} is incorrect with '${cleanUpfoundObject}', Not a date`
              );
            }
          }
          isBlank = false;
        }
      }
      if (isBlank) {
        problems.push(`${prop} is empty!`);
      }
    }
    if (foundObject === false) {
      problems.push(`${prop} does not exist!`);
    }
  }
  return { 0: goodParameters, 1: problems, 2: flagProblems };
}

// function downloadCSV(data, filename) {
//   // Convert the array to a CSV string
//   const csvContent = data.map((row) => row.join(',')).join('\n');

//   // Create a Blob from the CSV string
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

//   // Create a URL for the Blob
//   const url = URL.createObjectURL(blob);

//   // Create a temporary link element
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;

//   // Append the link to the body
//   document.body.appendChild(link);

//   // Programmatically trigger the download
//   link.click();

//   // Clean up: remove the link element and revoke the object URL
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// }
async function downloadCSVsAsZip(dataArray, filenames, zipFilename) {
  // Create a new JSZip instance
  const zip = new JSZip();

  // Iterate over each CSV data and filename
  dataArray.forEach((data, index) => {
    // Convert each data array (CSV content) into a CSV string
    const csvContent = data.map((row) => row.join(',')).join('\n');

    // Add each CSV string as a file to the zip instance with respective filename
    zip.file(filenames[index], csvContent);
  });

  // Generate the zip file asynchronously
  const content = await zip.generateAsync({ type: 'blob' });

  // Create a Blob URL for the zip content
  const url = URL.createObjectURL(content);

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFilename; // Set the zip file name

  // Append the link to the body and trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up: remove the link element and revoke the object URL
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function fetchPrediction(
  inputData,
  objectName,
  objectProperties,
  csvData
) {
  const storeOutputCSV = [
    [
      'Layer Name',
      'Object Name',
      'Object Id',
      'Predicted Category',
      'Acceptable',
      'Correct Parameter',
      'Flag Parameter',
      'Wrong Parameter',
    ],
  ];

  fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputData),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(`Prediction ${objectName}:`, data);
      data.forEach((result) => {
        let foundObject = objectProperties.data.collection.find(
          (obj) => obj.externalId === result.externalID
        );
        // console.log(`${result.predicted_category}`);
        if (foundObject) {
          // console.log(csvData[result.predicted_category])
          const remarks = breakDownData(
            csvData[result.predicted_category],
            foundObject.properties
          );
          let correct_parameters = true;
          let wrongParametersArray = '-';
          if (remarks[1].length > 0) {
            correct_parameters = false;
            wrongParametersArray = `"${remarks[1].join(' | ').toString()}"`;
          }
          let correctParametersArray = '-';
          if (remarks[0].length > 0) {
            correctParametersArray = `"${remarks[0].join(' | ').toString()}"`;
          }
          let flagParametersArray = '-';
          if (remarks[2].length > 0) {
            flagParametersArray = `"${remarks[2].join(' | ').toString()}"`;
          }
          storeOutputCSV.push([
            `"${objectName}"`,
            `"${result.objectNamewithID}"`,
            `"${result.externalID}"`,
            `"${result.predicted_category}"`,
            correct_parameters,
            correctParametersArray,
            flagParametersArray,
            wrongParametersArray,
          ]);
        } else {
          console.log('Object with externalId not found');
        }
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    })
    .finally(() => {
      csvDataArray.push(storeOutputCSV);
      csvFileNames.push(`Report-${objectName}.csv`);
      // downloadCSV(storeOutputCSV, `Report-${objectName}.csv`);
      objectsProcessed++;
      console.log(
        `Processed ${objectsProcessed} of ${totalObjects} layers (${objectName})`
      );
      if (objectsProcessed === totalObjects) {
        downloadCSVsAsZip(csvDataArray, csvFileNames, 'Report.zip');
        console.log('All layers processed and CSV downloaded.');
      }
    });
}

export async function extractMetadata(urn) {
  try {
    // Call the function with the CSV file URL
    const csvData = await fetchData();
    let token = await Client.getAccesstoken(); // Get Autodesk API token
    const viewableObjects = await Client.getAllViewables(
      token.access_token,
      urn
    );
    totalObjects = viewableObjects.data.metadata.length;
    // get all Viewables
    for (const viewableObject of viewableObjects.data.metadata) {
      // Wait for 0.5 second before fetching another object properties
      await new Promise((resolve) => setTimeout(resolve, 500));
      const objectName = viewableObject.name;
      const objectRole = viewableObject.role;
      const objectGUID = viewableObject.guid;

      try {
        let objectProperties = await Client.getAllViewableProperties(
          token.access_token,
          urn,
          objectGUID
        );

        while (objectProperties.result === 'success') {
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
        // console.log(objectProperties)
        // console.log(`Extracting ${objectName} metadata...`);
        const jsonMetadata = await sortMetadata(
          objectProperties.data.collection
        );
        // console.log(jsonMetadata);
        const convertedCSVData = await convertToCSV(jsonMetadata);
        // console.log(test2); // Log the final objectProperties when the loop exits
        // Make it so that the naming convention for file is allowed
        const fileNameApprovedNaming = objectName
          .replace(/\//g, '-')
          .replace(/\\/g, '-')
          .replace(/\:/g, '-')
          .replace(/\*/g, '-')
          .replace(/\?/g, '-')
          .replace(/\"/g, '-')
          .replace(/\</g, '-')
          .replace(/\>/g, '-')
          .replace(/\|/g, '-')
          .trim();
        fetchPrediction(
          convertedCSVData,
          fileNameApprovedNaming,
          objectProperties,
          csvData
        );
      } catch (error) {
        console.error(error);
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
