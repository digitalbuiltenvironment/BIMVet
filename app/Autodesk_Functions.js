async function getAccesstoken() {
  return new Promise((resolve, reject) => {
    const url = 'https://developer.api.autodesk.com/authentication/v2/token';
    const clientId = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_SECRET_ID;
    const clientSecret = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_SECRET;

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

async function getSignedS3UploadUrl(accessToken, objectKey) {
  return new Promise((resolve, reject) => {
    const bucketKey = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_BUCKET;
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

async function getObjectsInBucket(accessToken, limit = 1) {
  const url = `https://developer.api.autodesk.com/oss/v2/buckets/bimvetbucket/objects?limit=${limit}`;

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
    console.log('Objects in bucket response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting objects in bucket:', error.message);
    throw error;
  }
}

async function deleteObjectInBucket(accessToken, objectKey) {
  const bucketKey = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_BUCKET;
  const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to delete object in bucket: ${response.status} - ${errorData.reason}`
      );
    }

    console.log('Object deleted successfully');
  } catch (error) {
    console.error('Error deleting object in bucket:', error.message);
    throw error;
  }
}

async function uploadFileToSignedUrl(signedUploadUrl, pathToFile) {
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
    // console.log(response);
  } catch (error) {
    console.error('Error uploading file:', error.message);
    throw error;
  }
}

async function initiateSignedS3Upload(accessToken, uploadKey) {
  const bucketKey = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_BUCKET;
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

async function initiateTranslationJob(accessToken, urlSafeUrn, rootFilename) {
  const url =
    'https://developer.api.autodesk.com/modelderivative/v2/designdata/job';
  // console.log(urn);
  // console.log(rootFilename);
  const requestData = {
    input: {
      urn: urlSafeUrn,
      // rootFilename: rootFilename,
      // compressedUrn: true,
    },
    output: {
      formats: [
        {
          //svf loads faster
          //svf2 loads slower
          type: 'svf2',
          views: ['2d', '3d'],
        },
      ],
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'x-ads-force': 'true',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to initiate translation job: ${response.status} - ${errorData.reason}`
      );
    }

    const responseData = await response.json();
    console.log('Translation job initiated successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error initiating translation job:', error.message);
    throw error;
  }
}
async function getTranslateManifest(accessToken, urlSafeUrn) {
  const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urlSafeUrn}/manifest`;

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
        `Failed to get manifest: ${response.status} - ${errorData.reason}`
      );
    }

    const responseData = await response.json();
    // console.log('Manifest response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting manifest:', error.message);
    throw error;
  }
}
async function getAllViewables(accessToken, urlSafeUrn) {
  const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urlSafeUrn}/metadata`;

  try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
          },
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to get metadata: ${response.status} - ${errorData.reason}`);
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
              'Authorization': `Bearer ${accessToken}`,
          },
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to get viewable properties: ${response.status} - ${errorData.reason}`);
      }

      const responseData = await response.json();
      // console.log('Viewable properties response:', responseData);
      return responseData;
  } catch (error) {
      console.error('Error getting viewable properties:', error.message);
      throw error;
  }
}

const Client = {
  getAccesstoken,
  getSignedS3UploadUrl,
  uploadFileToSignedUrl,
  initiateSignedS3Upload,
  initiateTranslationJob,
  deleteObjectInBucket,
  getTranslateManifest,
  getAllViewables,
  getAllViewableProperties,
};
export default Client;
