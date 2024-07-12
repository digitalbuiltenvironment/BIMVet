'use client';
import React, { useEffect, useState } from 'react';
import { launchViewer } from './ViewerFunctions';
import { uploadfilestobucket } from './UploadFile';
import { extractMetadata } from './GetMetadata';
import Sidebar from './components/Sidebar';
import Dropzone from 'react-dropzone';
import BackGroundComponent from './components/BackGroundComponent';
import { useTheme } from 'next-themes';
import 'iconify-icon';
import './custom.css';

export default function Page() {
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>('');
  const [translationProgress, setTranslationProgress] =
    useState<string>('Loading...');
  //Sidebar section
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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
    setShowPopup(false);
    setSidebarExpanded(false);
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
    setShowPopup(false);
    setSidebarExpanded(false);
    setLoading(true);
    if (uploadedFile !== null) {
      uploadfilestobucket(uploadedFile, (progress) => {
        setTranslationProgress(progress);
      })
        .then((result) => {
          setUploadedFileBase64(result);
          setLoading(false);
          setUploadedFileCompleted(true);
          extractMetadata(
            'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3Rlc3RvYmplY3QucnZ0'
          );
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
          setUploadedFileCompleted(true);
        });
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  if (!scriptLoaded) {
    return <div>Loading Scripts...</div>;
  }

  const { theme, setTheme } = useTheme();

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <BackGroundComponent>
      {/* Popup */}
      {showPopup && (
        <div
          className={`popup-overlay fadeIn`}
          onClick={closePopup}
        >
          <div
            className={`absolute fadeIn ${
              theme === 'dark' ? 'popup-content-dark' : 'popup-content'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={defaultButtonPress}
              className="absolute top-0 left-2 upload-button"
            >
              Load Last Model
            </button>

            <div className="upload-section">
              <button
                className={`absolute top-2 right-2 text-2xl cursor-pointer ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
                onClick={closePopup}
              >
                <iconify-icon icon="zondicons:close-outline"></iconify-icon>
              </button>
              <div className="mt-12">
                <Dropzone onDrop={handleDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <div
                      {...getRootProps()}
                      className="dropzone"
                    >
                      <input {...getInputProps()} />
                      <p
                        className={`text-xl ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}
                      >
                        Drag & drop a file here or click to select one
                      </p>
                    </div>
                  )}
                </Dropzone>
                {uploadedFile !== null && (
                  <div>
                    <h2>Uploaded File: {uploadedFileName}</h2>
                    <button
                      onClick={uploadButtonPress}
                      className="upload-button"
                    >
                      Confirm uploaded file
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar
          sidebarExpanded={sidebarExpanded}
          toggleSidebar={toggleSidebar}
        />
        <div className="flex-1 p-2">
          <div>
            <button
              className="z-50 absolute top-5 right-5 cursor-pointer no-selection"
              onClick={togglePopup}
            >
              <div
                className={`flex items-center ml-2 text-4xl p-0.5 pr-2 border-2 rounded-md cursor-pointer no-selection ${
                  theme === 'dark' ? 'border-white' : 'border-black'
                }`}
              >
                <iconify-icon icon="mdi:file-upload-outline"></iconify-icon>
                <p className="text-base cursor-pointer">Upload</p>
              </div>
            </button>
            <div className="flex-1 ml-2">
              <h1 className="text-3xl opacity-90 font-bold mb-6">Checker</h1>
            </div>

            {uploadedFile !== null && !uploadedFileCompleted && (
              <div className="flex flex-col items-center justify-center mt-8">
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
              width: '98.5%',
              height: '90%',
              top: '1%',
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
    </BackGroundComponent>
  );
}
