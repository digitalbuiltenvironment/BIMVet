async function getAccesstoken() {
  return new Promise((resolve, reject) => {
    const url = 'https://developer.api.autodesk.com/authentication/v2/token';
    const clientId = 'jHdAZq9NRcQwHoeHsRJUc4owAc98HavH';
    const clientSecret = 'Zygab7khXtIwY7r2';

    const basicAuth = btoa(`${clientId}:${clientSecret}`).toString();
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append(
      'scope',
      'bucket:create bucket:read data:create data:write data:read viewables:read'
    );
    console.log(formData.toString());

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
        console.log('Token response:', data);
        resolve(data); // Resolve the promise with the token data
      })
      .catch((error) => {
        console.error('Error fetching token:', error);
        reject(error); // Reject the promise with the error
      });
  });
}

async function createBucket(accessToken) {
  return new Promise((resolve, reject) => {
    const url = 'https://developer.api.autodesk.com/oss/v2/buckets';

    const bucketName = 'testbucket';
    const bucketCreateData = {
      bucketKey: bucketName,
      access: 'full',
      policyKey: 'transient',
    };
    fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bucketCreateData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Bucket response:', data);
        resolve(data); // Resolve the promise with the token data
      })
      .catch((error) => {
        console.error('Error fetching bucket:', error);
        reject(error); // Reject the promise with the error
      });
  });
}

async function getSignedS3UploadUrl(accessToken) {
  return new Promise((resolve, reject) => {
    const bucketKey = 'bimvetbucket';
    const objectKey = 'testobject.rvt';
    const minutesExpiration = '10';
    const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload?minutesExpiration=${minutesExpiration}`;

    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Signed S3 Upload URL response:', data);
        resolve(data); // Resolve the promise with the signed S3 upload URL data
      })
      .catch((error) => {
        console.error('Error fetching signed S3 upload URL:', error);
        reject(error); // Reject the promise with the error
      });
  });
}

async function getBucketList(accessToken) {
  return new Promise((resolve, reject) => {
    const url = 'https://developer.api.autodesk.com/oss/v2/buckets';

    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Bucket list response:', data);
        resolve(data); // Resolve the promise with the bucket list data
      })
      .catch((error) => {
        console.error('Error fetching bucket list:', error);
        reject(error); // Reject the promise with the error
      });
  });
}

async function uploadFileToSignedUrl(signedUploadUrl, pathToFile) {
  // const fileData = require('fs').readFileSync(pathToFile);
  // const handleDrop = (acceptedFiles) => {
  //   const file = acceptedFiles[0];
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const imageSrc = reader.result;
  //     setUploadedImages([...uploadedImages, imageSrc]);
  //   };
  //   reader.readAsDataURL(file);
  // };
  try {
    const response = await fetch(signedUploadUrl, {
      method: 'PUT',
      body: pathToFile,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to upload file: ${response.status} - ${errorData}`
      );
    }

    console.log('File uploaded successfully');
    console.log(response);
  } catch (error) {
    console.error('Error uploading file:', error.message);
    throw error;
  }
}

async function initiateSignedS3Upload(accessToken, uploadKey) {
  const bucketKey = 'bimvetbucket';
  const objectKey = 'testobject.rvt';
  const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`;

  const requestData = {
    ossbucketKey: bucketKey,
    ossSourceFileObjectKey: objectKey,
    access: 'full',
    uploadKey: uploadKey,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to initiate signed S3 upload: ${response.status} - ${errorData.reason}`
      );
    }

    const responseData = await response.json();
    console.log('Signed S3 upload initiated successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error initiating signed S3 upload:', error.message);
    throw error;
  }
}

const Client = {
  getAccesstoken,
  getBucketList,
  getSignedS3UploadUrl,
  uploadFileToSignedUrl,
  initiateSignedS3Upload,
};
export default Client;
