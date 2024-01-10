/* global Autodesk, THREE */
import Client from './Auth';

var getToken = { accessToken: Client.getAccesstoken() };
var viewer;

export function launchViewer(div, urn) {
  getToken.accessToken.then((token) => {
    var options = {
      accessToken: token.access_token,
      env: 'AutodeskProduction',
      api: 'derivativeV2',
    };
    Autodesk.Viewing.Initializer(options, function () {
      var htmlDiv = div;
      viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
      var startedCode = viewer.start();
      if (startedCode > 0) {
        console.error('Failed to create a Viewer: WebGL not supported.');
        return;
      }
      // console.log(token);

      // Client.createBucket(token.access_token).then((bucket) => {
      //   console.log(bucket);
      // });
      // Client.getBucketList(token.access_token).then((bucket) => {
      //   console.log(bucket);
      // });

      Client.getSignedS3UploadUrl(token.access_token).then((output) => {
        //console.log(output);
        const pathToFilename = '../../samples/racbasicsampleproject.rvt';
        const uploadToken = output.uploadKey;
        Client.uploadFileToSignedUrl(output.urls[0], pathToFilename).then(
          (response) => {
            //console.log(response);
            Client.initiateSignedS3Upload(token.access_token, uploadToken).then(
              (response) => {
                //console.log(response);
              }
            );
          }
        );
      });

      console.log('Initialization complete, loading a model next...');
    });

    var documentId = urn;
    Autodesk.Viewing.Document.load(
      documentId,
      onDocumentLoadSuccess,
      onDocumentLoadFailure
    );

    function onDocumentLoadSuccess(viewerDocument) {
      var defaultModel = viewerDocument.getRoot().getDefaultGeometry();
      viewer.loadDocumentNode(viewerDocument, defaultModel);
    }

    function onDocumentLoadFailure() {
      console.error('Failed fetching Forge manifest');
    }
  });
}
