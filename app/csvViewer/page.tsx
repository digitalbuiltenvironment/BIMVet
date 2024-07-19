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
  const [complianceCSV, setComplianceCSV] = useState<any[]>([]);
  const [noncomplianceCSV, setNoncomplianceCSV] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState(1);

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
      const compliance = parsedData.filter(
        (row) => row['Acceptable'] && row['Acceptable'].toLowerCase() === 'true'
      );
      const noncompliance = parsedData.filter(
        (row) =>
          !row['Acceptable'] || row['Acceptable'].toLowerCase() !== 'true'
      );
      setComplianceCSV(compliance);
      setNoncomplianceCSV(noncompliance);
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

  const handleOptionToggleClick = (option: number) => {
    setSelectedOption(option === selectedOption ? null : option);
    setCurrentRowIndex(0);
  };

  const handleCheckClick = () => {
    if (currentRowIndex < csvData.length - 1) {
      // Create a copy of csvData
      let updatedCsvData;
      switch (selectedOption) {
        case 1:
          updatedCsvData = [...csvData];
          break;
        case 2:
          updatedCsvData = [...complianceCSV];
          break;
        case 3:
          updatedCsvData = [...noncomplianceCSV];
          break;
        default:
          updatedCsvData = [...csvData];
          break;
      }
      // Remove the current row from updatedCsvData
      const removedRow = updatedCsvData.splice(currentRowIndex, 1)[0];
      switch (selectedOption) {
        case 1:
          // Update csvData with the modified array
          setCsvData(updatedCsvData);

          const objectId = removedRow['Object Id'];
          if (
            removedRow['Acceptable'] &&
            removedRow['Acceptable'].toLowerCase() === 'true'
          ) {
            // Remove from complianceCSV based on Object Id
            const updatedComplianceCSV = complianceCSV.filter(
              (row) => row['Object Id'] !== objectId
            );
            setComplianceCSV(updatedComplianceCSV);
          } else {
            // Remove from noncomplianceCSV based on Object Id
            const updatedNoncomplianceCSV = noncomplianceCSV.filter(
              (row) => row['Object Id'] !== objectId
            );
            setNoncomplianceCSV(updatedNoncomplianceCSV);
          }
          break;
        case 2:
          const objectId2 = removedRow['Object Id'];
          // Remove from complianceCSV based on Object Id
          const updatedCSVData = csvData.filter(
            (row) => row['Object Id'] !== objectId2
          );
          setComplianceCSV(updatedCsvData);
          setCsvData(updatedCSVData);
          break;
        case 3:
          const objectId3 = removedRow['Object Id'];
          // Remove from complianceCSV based on Object Id
          const updatedCSVData2 = csvData.filter(
            (row) => row['Object Id'] !== objectId3
          );
          setNoncomplianceCSV(updatedCsvData);
          setCsvData(updatedCSVData2);
          break;
        default:
          break;
      }
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
        .slice(1, -1)
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
      <title>BIMVet Report</title>
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
                      className={`text-xl ${
                        theme === 'dark'
                          ? 'text-white'
                          : theme === 'light'
                          ? 'text-black'
                          : 'text-white'
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
              <div>
                <button
                  className={`w-36 text-base cursor-pointer border-2 transition-all no-selection ${
                    theme === 'dark' ? 'border-white' : 'border-black'
                  } ${selectedOption === 1 ? 'active border-red-400' : ''} `}
                  onClick={() => handleOptionToggleClick(1)}
                  disabled={selectedOption === 1}
                >
                  All
                </button>
                <button
                  className={`w-36 text-base cursor-pointer border-2 transition-all no-selection ${
                    theme === 'dark' ? 'border-white' : 'border-black'
                  } ${selectedOption === 2 ? 'active border-red-400' : ''} `}
                  onClick={() => handleOptionToggleClick(2)}
                  disabled={selectedOption === 2}
                >
                  Compliance
                </button>
                <button
                  className={`w-36 text-base cursor-pointer border-2 transition-all no-selection ${
                    theme === 'dark' ? 'border-white' : 'border-black'
                  } ${selectedOption === 3 ? 'active border-red-400' : ''} `}
                  onClick={() => handleOptionToggleClick(3)}
                  disabled={selectedOption === 3}
                >
                  Non-Compliance
                </button>
                <p>
                  Total: {csvData.length} | Compliance: {complianceCSV.length} |
                  Non-Compliance: {noncomplianceCSV.length}
                </p>
              </div>
              <div className="flex flex-col ml-[12rem] mt-6">
                {selectedOption === 1
                  ? Object.entries(csvData[currentRowIndex]).map(
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
                    )
                  : selectedOption === 2
                  ? Object.entries(complianceCSV[currentRowIndex]).map(
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
                    )
                  : Object.entries(noncomplianceCSV[currentRowIndex]).map(
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
                  /{' '}
                  {selectedOption === 1
                    ? csvData.length
                    : selectedOption === 2
                    ? complianceCSV.length
                    : noncomplianceCSV.length}
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
