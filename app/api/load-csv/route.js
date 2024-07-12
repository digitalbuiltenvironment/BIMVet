import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function GET(req) {
    const csvFilePath = "./mcr_param/MCRdata.csv";
    const csvData = fs.readFileSync(csvFilePath, 'utf8');

    return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
            header: false,
            complete: function(results) {
                const transformedData = transformData(results.data);
                resolve(NextResponse.json(transformedData));
            },
            error: function(error) {
                reject(NextResponse.json({ error: 'Error parsing CSV', details: error }));
            }
        });
    });
}

function transformData(parsedData) {
    const result = {};
    parsedData.forEach(row => {
        const [MCR, Name, Family, Code, Parameters] = row;
        // console.log(`MCR: ${MCR}, Name: ${Name}, Family: ${Family}, Code: ${Code}`);
        const parsedParams = JSON.parse(Parameters.replace(/""/g, '"').replace(/'/g, '"'));

        result[Name] = {
            Family,
            MCR,
            Parameters: parsedParams
        };
    });
    return result;
}
