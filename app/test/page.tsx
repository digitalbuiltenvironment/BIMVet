'use client';
import React, { useEffect, useState } from 'react';
import { launchViewer } from './ViewerFunctions';
import { uploadfilestobucket } from './UploadFile';
import { extractMetadata } from './GetMetadata';
import Dropzone from 'react-dropzone';
import './custom.css';

export default function Page() {
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>('');
  const [translationProgress, setTranslationProgress] =
    useState<string>('Loading...');

  useEffect(() => {
    // Dynamically create the script element
    const script = document.createElement('script');
    script.src =
      'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.2/viewer3D.min.js';
    script.async = false;
    // Dynamically create the link element for the stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.2/style.min.css';
    link.type = 'text/css';
    document.head.appendChild(link);

    script.onload = () => {
      console.log(LMV_VIEWER_VERSION);
      setScriptLoaded(true);
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

  const loadInViewer = (urnObjectKey: string) => {
    if (!scriptLoaded) return;
    const documentID = `urn:${urnObjectKey}`;
    const forgeViewerId = document.getElementById('forgeViewer');
    // Script has loaded, now you can launch the viewer
    launchViewer(forgeViewerId, documentID);
    console.log(urnObjectKey);
  };

  useEffect(() => {
    // This code will run when file is uploaded
    loadInViewer(uploadedFileBase64);
    // console.log('myState has changed:', uploadedFileBase64);
  }, [uploadedFileBase64]);

  const defaultButtonPress = () => {
    // Load in the previous model
    loadInViewer(
      'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3Rlc3RvYmplY3QucnZ0'
    );
    extractMetadata(
      'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3Rlc3RvYmplY3QucnZ0'
    );
  };

  const [uploadedFile, setUploadedFile] = useState<ArrayBuffer | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileCompleted, setUploadedFileCompleted] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    console.log(file);
    const reader = new FileReader();
    reader.onload = () => {
      const filedata: ArrayBuffer = reader.result as ArrayBuffer;
      // console.log(filedata);
      setUploadedFile(filedata);
      const rootFileName = file.name;
      setUploadedFileName(rootFileName);
      setUploadedFileCompleted(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadButtonPress = () => {
    setLoading(true);
    if (uploadedFile !== null) {
      uploadfilestobucket(uploadedFile, (progress) => {
        setTranslationProgress(progress);
      })
        .then((result) => {
          setUploadedFileBase64(result);
          setLoading(false);
          setUploadedFileCompleted(true);
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  };
  //Sidebar section
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  if (!scriptLoaded) {
    return <div>Loading Scripts...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}{' '}
      <div
        className={`transition-all ${
          sidebarExpanded
            ? 'lg:w-72 lg:h-screen bg-opacity-50 bg-gray-600'
            : 'lg:w-12 lg:h-screen'
        } z-10 transition-color duration-500`}
      >
        <button
          onClick={toggleSidebar}
          className={`bg-gray-800 flex text-white px-4 py-2 transition-all duration-500 ml-auto`}
        >
          {sidebarExpanded ? 'Collapse' : 'Expand'}
        </button>
        {/* Sidebar content */}
        <div
          className={`fixed p-4 transition-opacity duration-400 ${
            sidebarExpanded ? 'opacity-100' : 'opacity-0'
          } flex flex-col justify-between h-full`}
        >
          <div>
            <h2 className="text-xl font-bold mb-4">Sidebar Content</h2>
            <p>Test</p>
          </div>

          <div className="mt-auto">
            <div className="border-t pt-2 w-full">
              <p className="pb-12">Bottom Content</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-8">
        <div>
          <div className="flex-1 ml-2">
            <h1>Checker</h1>
            <button
              onClick={defaultButtonPress}
              className="upload-button"
            >
              Default Button
            </button>
          </div>
          <div className="upload-section">
            <Dropzone onDrop={handleDrop}>
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="dropzone"
                >
                  <input {...getInputProps()} />
                  <p style={{ color: 'darkgray' }}>
                    Drag & drop an image file here or click to select one
                  </p>
                </div>
              )}
            </Dropzone>
          </div>

          {uploadedFile !== null && !uploadedFileCompleted && (
            <div className="flex flex-col items-center justify-center mt-8">
              <h2>Uploaded File: {uploadedFileName}</h2>
              <button
                onClick={uploadButtonPress}
                className="upload-button"
              >
                Confirm uploaded file
              </button>
              {loading && (
                <div className="loading-overlay flex flex-col items-center">
                  <div className="loading-spinner"></div>
                  <p className="mt-4">
                    Translation Progress: {translationProgress}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '85%',
            marginLeft: '10px',
          }}
        >
          <div
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            id="forgeViewer"
          ></div>
        </div>
      </div>
    </div>
  );
}
