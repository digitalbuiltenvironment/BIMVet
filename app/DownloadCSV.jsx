// DownloadCSV.jsx
import React from 'react';
import { CSVDownload } from 'react-csv';

const DownloadCSV = ({ csvData }) => {
  return (
    <div>
      <h2>Download CSV</h2>
      <CSVDownload data={csvData} filename="output.csv" target="_blank">
        Download CSV
      </CSVDownload>
    </div>
  );
};

export default DownloadCSV;
