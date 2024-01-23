import Client from './Autodesk_Functions';
import { SetStateAction } from 'react';

export async function uploadfilestobucket(
    fileData: ArrayBuffer,
    onProgress: (progress: string) => void
  ): Promise<SetStateAction<string>> {
  const objectName = 'testobject.rvt';

  const checkTranslateManifest = async (
    token: string,
    urn: string
  ): Promise<boolean> => {
    const response = await Client.getTranslateManifest(token, urn);
    if (response.status === 'success') {
      console.log('Translation complete!');
      onProgress('Translation complete!');
      return true;
    } else {
      console.log(response.progress);
      onProgress(response.progress);
      // Wait for 10 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return checkTranslateManifest(token, urn);
    }
  };

  try {
    const token = await Client.getAccesstoken(); // Get autodesk API token
    const output = await Client.getSignedS3UploadUrl(
      token.access_token,
      objectName
    ); // Get signed S3 upload URL
    const uploadToken: string = output.uploadKey; // Get upload token
    const response = await Client.uploadFileToSignedUrl(
      output.urls[0],
      fileData
    ); // Upload file to signed S3 URL
    const initiateUploadResponse = await Client.initiateSignedS3Upload(
      token.access_token,
      uploadToken
    ); // Initiate signed S3 upload
    const urn = btoa(initiateUploadResponse.objectId).toString(); // Get base64 urn by converting initiate signed S3 upload response to base 64
    await Client.initiateTranslationJob(token.access_token, urn, objectName); // Initiate translation job with base 64 urn
    await checkTranslateManifest(token.access_token, urn); // Check if translation is complete and return base 64 urn when complete
    return urn;
  } catch (error) {
    throw error;
  }
}
