/* global Autodesk, THREE */
import Client from './Auth';

var getToken = { accessToken: Client.getAccesstoken() };
var viewer;

export async function launchViewer(div, urn) {
  getToken.accessToken.then((token) => {
    var options = { 
      accessToken: token,
      env: 'AutodeskProduction',
    };
    Autodesk.Viewing.Initializer(options, function () {
      var htmlDiv = div;
      viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
      var startedCode = viewer.start();
      if (startedCode > 0) {
        console.error('Failed to create a Viewer: WebGL not supported.');
        return;
      }
      console.log(token);

      Client.createBucket(token.access_token).then((bucket) => {
        console.log(bucket);
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
