"use client";
import React, { useEffect, useState } from "react";
import { launchViewer } from "./ViewerFunctions";

export default function Page() {
  useEffect(() => {
    const documentID = "<YOUR_MODEL_URN>";

    // Dynamically create the script element
    const script = document.createElement("script");
    script.src = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.0/viewer3D.min.js";
    script.async = true;

    const forgeViewerId = document.getElementById("forgeViewerId");

    script.onload = () => {
      // Script has loaded, now you can launch the viewer
      launchViewer(forgeViewerId, documentID);
    };

    // Append the script to the body of the document
    document.body.appendChild(script);

    // Dynamically create the link element for the stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.0/style.min.css";
    link.type = "text/css";

    // Append the link to the head of the document
    document.head.appendChild(link);

    // Cleanup function to remove the script and link when the component is unmounted
    return () => {
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div>
      <div id="forgeViewerId"></div>
    </div>
  );
}
