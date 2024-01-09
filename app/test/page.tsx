"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { launchViewer } from "./ViewerFunctions";

export default function Page() {
  useEffect(() => {
    const documentID = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bXktYnVja2V0L215LWF3ZXNvbWUtZm9yZ2UtZmlsZS5ydnQ";

    // Dynamically create the script element
    const script = document.createElement("script");
    script.src = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.2/viewer3D.min.js";
    script.async = true;
    const forgeViewerId = document.getElementById("forgeViewer");
    script.onload = () => {
      // Script has loaded, now you can launch the viewer
      console.log(LMV_VIEWER_VERSION)
      launchViewer(forgeViewerId, documentID);
    };

    // Append the script to the head of the document
    document.head.appendChild(script);

    // Cleanup function to remove the script when the component is unmounted
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div>
      <Head>
        <link
          rel="stylesheet"
          href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.0/style.min.css"
          type="text/css"
        />
      </Head>
      <div style={{position: "absolute", width:"100%", height:"85%"}} id="forgeViewer"></div>
    </div>
  );
}
