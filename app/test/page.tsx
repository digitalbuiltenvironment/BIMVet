"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { launchViewer } from "./ViewerFunctions";

export default function Page() {
  useEffect(() => {
    const urn = "<YOUR_MODEL_URN>";
    launchViewer("forgeViewer", urn);
  }, []);

  return (
    <div>
      <Head>
        <link
          rel="stylesheet"
          href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.2/style.min.css"
          type="text/css"
        />
        <script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.2/viewer3D.min.js"></script>
      </Head>
      <div id="forgeViewer"></div>
    </div>
  );
}
