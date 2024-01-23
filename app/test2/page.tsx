'use client';
import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import './custom.css';

export default function Page() {
  const [uploadedFile, setUploadedFile] = useState<ArrayBuffer | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    console.log(file);
    const reader = new FileReader();
    reader.onload = () => {
      const filedata: ArrayBuffer = reader.result as ArrayBuffer;
      console.log(filedata);
      setUploadedFile(filedata);
      setUploadedFileName(file.name);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h1>FoodFriend Menu Upload</h1>
      <div className="upload-section">
        <Dropzone onDrop={handleDrop}>
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              className="dropzone"
            >
              <input {...getInputProps()} />
              <p>Drag & drop an image file here or click to select one</p>
            </div>
          )}
        </Dropzone>
      </div>

      {uploadedFile !== null && (
        <div>
          <h2>Uploaded File: {uploadedFileName}</h2>
          <button className="upload-button">Confirm uploaded images</button>
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          {/* {ocrText.length > 0 && (
              <div>
                <h2>OCR Text:</h2>
                {ocrText.map((text, index) => (
                  <p key={index}>{text}</p>
                ))}
              </div>
            )} */}
        </div>
      )}
    </div>
  );
}
