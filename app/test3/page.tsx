'use client';
import React, { useEffect, useState } from 'react';
import { launchViewer } from './ViewerFunctions';
import { uploadfilestobucket } from './UploadFile';
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
    // This code will run whenever myState changes
    loadInViewer(uploadedFileBase64);
    // console.log('myState has changed:', uploadedFileBase64);

    // You can put any logic or function calls related to myState changes here
  }, [uploadedFileBase64]);

  const defaultButtonPress = () => {
    loadInViewer(
      'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltdmV0YnVja2V0L3Rlc3RvYmplY3QucnZ0'
    );
  };

  const [uploadedFile, setUploadedFile] = useState<ArrayBuffer | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
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
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadButtonPress = () => {
    // setLoading(true);
    if (uploadedFile !== null) {
      uploadfilestobucket(uploadedFile, (progress) => {
        setTranslationProgress(progress);
      })
        .then((result) => {
          setUploadedFileBase64(result);
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  };

  if (!scriptLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <h1>File Upload</h1>
        <button
          onClick={defaultButtonPress}
          className="upload-button"
        >
          Default Button
        </button>
        <div className="upload-section">
          <Dropzone onDrop={handleDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className="dropzone"
              >
                <input {...getInputProps()} />
                <p style={{ color: 'darkgray' }}>Drag & drop an image file here or click to select one</p>
              </div>
            )}
          </Dropzone>
        </div>

        {uploadedFile !== null && (
          <div>
            <h2>Uploaded File: {uploadedFileName}</h2>
            <button
              onClick={uploadButtonPress}
              className="upload-button"
            >
              Confirm uploaded images
            </button>
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                {/* Display translation progress */}
                <p>Translation Progress: {translationProgress}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{ position: 'absolute', width: '100%', height: '85%' }}
        id="forgeViewer"
      ></div>
    </div>
  );
}
