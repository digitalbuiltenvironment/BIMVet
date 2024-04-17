import os
import pandas as pd

# Get list of files in current directory
files = [f for f in os.listdir('.') if os.path.isfile(f)]

# Filter files with "output" in the name and ending with ".csv"
output_files = [f for f in files if "output" in f.lower() and f.lower().endswith('.csv')]

# Iterate through output files
for idx, file in enumerate(output_files, start=1):
    fileName = file.split('-', 1)[-1].split('.')[0]
    # Read data from CSV file
    df = pd.read_csv(file, usecols=range(12))
    
    # Remove ObjectID column
    df = df.drop(columns=['ObjectID'])
    
    # Keep only unique rows
    df = df.drop_duplicates()
    
    # Generate output file name
    output_file = f'cleaned_data_{idx}-{fileName}.csv'
    
    # Export to CSV
    df.to_csv(output_file, index=False)
    
    print(f"Processed '{file}' and saved cleaned data to '{output_file}'")
