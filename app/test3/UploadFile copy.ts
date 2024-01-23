import Client from './Autodesk_Functions';
import { SetStateAction } from 'react';

export function uploadfilestobucket(
  fileData: ArrayBuffer
): Promise<SetStateAction<string>> {
  const objectName = 'testobject.rvt';

  const checkTranslateManifest = (token: string, urn: string) => {
    Client.getTranslateManifest(token, urn).then((response) => {
    //   console.log(response);
      // Replace the following condition with your logic to determine if translation is complete
      if (response.status === 'success') {
        console.log('Translation complete!');
        return true;
      } else {
        console.log(response.progress);
        setTimeout(() => checkTranslateManifest(token, urn), 10000);
      }
    });
  };

  return new Promise((resolve, reject) => {
    Client.getAccesstoken()
      .then((token) => {
        Client.getSignedS3UploadUrl(token.access_token, objectName)
          .then((output) => {
            const uploadToken: String = output.uploadKey;
            Client.uploadFileToSignedUrl(output.urls[0], fileData).then(
              (response) => {
                Client.initiateSignedS3Upload(
                  token.access_token,
                  uploadToken
                ).then((response) => {
                  const urn = btoa(response.objectId).toString();
                  Client.initiateTranslationJob(
                    token.access_token,
                    urn,
                    objectName
                  )
                    .then((response) => {   
                      checkTranslateManifest(token.access_token, urn);
                      resolve(urn);
                    })
                    .catch(reject);
                });
              }
            );
          })
          .catch(reject);
      })
      .catch(reject);
  });
}
