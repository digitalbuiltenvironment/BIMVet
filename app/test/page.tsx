"use client";
import React, { useEffect, useState } from "react";
import { launchViewer } from "./ViewerFunctions";

export default function Page() {
  useEffect(() => {
    const pathToFilename = '../../samples/racbasicsampleproject.rvt';
    const reader = new FileReader();

    const documentID = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3JzdGJhc2ljc2FtcGxlcHJvamVjdC5ydnQ";

    // Dynamically create the script element
    const script = document.createElement("script");
    script.src = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.2/viewer3D.min.js";
    script.async = false;
    const forgeViewerId = document.getElementById("forgeViewer");
    // Dynamically create the link element for the stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.2/style.min.css";
    link.type = "text/css";
    document.head.appendChild(link);

    script.onload = () => {
      // Script has loaded, now you can launch the viewer
      console.log(LMV_VIEWER_VERSION)
      launchViewer(forgeViewerId, documentID);
    };

    // Append the script to the head of the document
    document.head.appendChild(script);
    document.head.appendChild(link);

    // Cleanup function to remove the script when the component is unmounted
    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div>
      <div style={{position: "absolute", width:"100%", height:"85%"}} id="forgeViewer"></div>
    </div>
  );
}
