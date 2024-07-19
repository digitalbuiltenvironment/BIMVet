const fs = require('fs');
const { convertToObject } = require('typescript');
const { promisify } = require('util');
const appendFileAsync = promisify(fs.appendFile);

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

async function getObjectsInBucket(accessToken) {
  const url = `https://developer.api.autodesk.com/oss/v2/buckets/bimvetbucket/objects?limit=100`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to get objects in bucket: ${response.status} - ${errorData.reason}`
      );
    }

    const responseData = await response.json();
    // console.log('Objects in bucket response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting objects in bucket:', error.message);
    throw error;
  }
}

async function main() {
  const existingURNs = new Set(); // Set to store existing URNs in the CSV file
  const filePath = 'URNs.csv';

  // Read existing URNs from the CSV file, if it exists
  try {
    const existingCSVContent = fs.readFileSync(filePath, 'utf-8');
    existingCSVContent.split('\n').forEach((row) => {
      const [fileName, urn] = row
        .split(',')
        .map((col) => col.replace(/^"|"$/g, ''));
      if (urn) existingURNs.add(urn.trim());
    });
    // console.log('Existing URNs:', existingURNs);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading existing CSV file:', error);
      return;
    }
  }

  var csvArray = [];
  var token = await getAccesstoken();
  var objects = await getObjectsInBucket(token.access_token, 0);
  var bucketItems = objects['items'];
  for (var i = 0; i < bucketItems.length; i++) {
    var urlSafeUrn = bucketItems[i]['objectId'];
    var fileName = bucketItems[i]['objectKey'];
    var urn = btoa(urlSafeUrn).toString().replace(/=*$/, '');

    if (!existingURNs.has(urn)) {
      csvArray.push([fileName, urn]);
      existingURNs.add(urn);
    } else {
      // console.log('Skipping existing URN:', urn);
    }
  }

  if (csvArray.length === 0) {
    console.log('No new data to append.');
    return;
  }

  csvArray.unshift(['','']);

  const csvContent = csvArray.map((row) => row.join(',')).join('\n') + '\n';

  // Append to the CSV file
  await appendFileAsync(filePath, csvContent, 'utf-8');

  console.log('Data appended to URNs.csv successfully.');
}

main()
  .then(() => {})
  .catch((error) => {
    console.error('Error appending data to URNs.csv:', error);
  });
