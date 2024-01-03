import Client from "./Auth";

var getToken = { accessToken: Client.getAccesstoken() };
var viewer;

export function launchViewer(div, urn) {
  getToken.accessToken.then((token) => {
    var options = {
      env: "AutodeskProduction2",
      api: "streamingV2", // for models uploaded to EMEA change this option to 'streamingV2_EU'
      getAccessToken: function (onTokenReady) {
        var token = token.access_token;
        var timeInSeconds = 3600; // Use value provided by APS Authentication (OAuth) API
        onTokenReady(token, timeInSeconds);
      },
    };
    Autodesk.Viewing.Initializer(options, function () {
      var htmlDiv = document.getElementById("forgeViewer");
      viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
      var startedCode = viewer.start();
      if (startedCode > 0) {
        console.error("Failed to create a Viewer: WebGL not supported.");
        return;
      }

      console.log("Initialization complete, loading a model next...");
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
      console.error("Failed fetching Forge manifest");
    }
  });
}

launchViewer();
