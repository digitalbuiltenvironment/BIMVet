'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dropzone from 'react-dropzone';
import BackGroundComponent from '../components/BackGroundComponent';
import { useTheme } from 'next-themes';
import 'iconify-icon';
import '../custom.css';

export default function Page() {
  //Sidebar section
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const { theme, setTheme } = useTheme();

  const [uploadedFile, setUploadedFile] = useState<ArrayBuffer | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileCompleted, setUploadedFileCompleted] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [uploadedFileFull, setUploadedFileFull] = useState<File | null>(null);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

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
      setUploadedFileFull(file);
      setUploadedFileCompleted(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const parseCSV = (text: string) => {
    const rows = text.split('\n').map((row) => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      return headers.reduce((acc, header, index) => {
        acc[header] = row[index];
        return acc;
      }, {} as { [key: string]: string });
    });
    return data;
  };

  const uploadButtonPress = () => {
    setUploadedFileCompleted(true);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parsedData = parseCSV(text);
      setCsvData(parsedData);
    };
    reader.readAsText(uploadedFileFull);
    // const parsedData = parseCSV(text);
    // setCsvData(parsedData);
  };

  const handlePrevious = () => {
    if (currentRowIndex > 0) {
      setCurrentRowIndex(currentRowIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentRowIndex < csvData.length - 1) {
      setCurrentRowIndex(currentRowIndex + 1);
    }
  };

  const handleJumpToRow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(event.target.value, 10) - 1;
    if (index >= 0 && index < csvData.length) {
      setCurrentRowIndex(index);
    }
  };

  const handleCheckClick = () => {
    if (currentRowIndex < csvData.length - 1) {
      // Create a copy of csvData
      const updatedCsvData = [...csvData];

      // Remove the current row from updatedCsvData
      updatedCsvData.splice(currentRowIndex, 1);

      // Update csvData with the modified array
      setCsvData(updatedCsvData);

      // If you also need to adjust currentRowIndex after removing the row
      if (currentRowIndex >= updatedCsvData.length) {
        setCurrentRowIndex(updatedCsvData.length - 1);
      }
    }
  };

  const copyToClipboard = async (text) => {
    try {
      text = text.replace(/\"/g, '').trim();
      await navigator.clipboard.writeText(text);
      console.log('Object ID copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      console.log('Failed to copy object ID to clipboard.');
    }
  };

  const renderParameterPoints = (parameters: string, rowName: string) => {
    if (!parameters) return null;
    if (rowName.includes('Parameter')) {
      const parameterList = parameters
        .split('|')
        .map((param, index) => <li key={index}>{param.trim()}</li>);
      return <p className="ml-10">{parameterList}</p>;
    } else if (rowName.includes('Acceptable')) {
      if (parameters.toLowerCase() === 'true') {
        return 'Yes';
      } else {
        return 'No';
      }
    } else {
      return parameters;
    }
  };

  return (
    <BackGroundComponent>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          sidebarExpanded={sidebarExpanded}
          toggleSidebar={toggleSidebar}
        />
        <div className="flex-1 p-2">
          <div className="flex-1 ml-2">
            <h1 className="text-3xl opacity-90 font-bold mb-6">
              Report Viewer
            </h1>
          </div>
          {!uploadedFileCompleted && (
            <div className="mt-12">
              <Dropzone onDrop={handleDrop}>
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="dropzone"
                  >
                    <input {...getInputProps()} />
                    <p
                      className={`text-xl text-white ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      Drag & drop a file here or click to select one
                    </p>
                  </div>
                )}
              </Dropzone>
              {uploadedFile !== null && (
                <div className="flex mt-4 items-center justify-center grid">
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
          )}
          {csvData.length > 0 && (
            <div className="ml-12 mr-12 mt-12">
              <button
                className="flex items-center row-auto z-50 absolute top-20 right-40 cursor-pointer no-selection ml-2"
                onClick={handleCheckClick}
              >
                <div
                  className={`flex items-center ml-2 text-4xl p-0.5 pr-2 pl-1 border-2 rounded-md cursor-pointer no-selection ${
                    theme === 'dark' ? 'border-white' : 'border-black'
                  }`}
                >
                  <iconify-icon
                    icon="ph:check-fat-bold"
                    style={{ color: 'lightgreen' }}
                  ></iconify-icon>
                  <p className="ml-2 text-base cursor-pointer">Checked</p>
                </div>
              </button>
              <div className="flex flex-col ml-[12rem]">
                {Object.entries(csvData[currentRowIndex]).map(
                  ([key, value]) => (
                    <p
                      key={key}
                      onClick={() => copyToClipboard(value)}
                      className="cursor-pointer"
                    >
                      <strong>{key}:</strong>{' '}
                      {renderParameterPoints(value, key)}
                    </p>
                  )
                )}
              </div>
              <div className="flex items-center justify-center mt-10">
                <button
                  onClick={handlePrevious}
                  className="text-4xl mr-4"
                >
                  <iconify-icon
                    icon={'solar:map-arrow-left-linear'}
                  ></iconify-icon>
                </button>
                <span className="w-fit">
                  <input
                    className="w-[3rem]"
                    type="number"
                    value={currentRowIndex + 1}
                    onChange={handleJumpToRow}
                  />{' '}
                  / {csvData.length}
                </span>
                <button
                  onClick={handleNext}
                  className="text-4xl ml-4"
                >
                  <iconify-icon
                    icon={'solar:map-arrow-right-linear'}
                  ></iconify-icon>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BackGroundComponent>
  );
}
