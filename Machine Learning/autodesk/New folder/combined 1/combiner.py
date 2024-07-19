import os
import pandas as pd
import re

# Get list of files in current directory
files = [f for f in os.listdir('.') if os.path.isfile(f)]

# Filter cleaned data files ("cleaned_output*.csv")
cleaned_files = [f for f in files if f.lower().startswith('cleaned_data_') and f.lower().endswith('.csv')]

# Initialize an empty list to store DataFrames
dfs = []

# Read each cleaned CSV file and append its DataFrame to the list
for file in cleaned_files:
    df = pd.read_csv(file)
    
    filtered_rows = []
    for index, row in df.iterrows():
        if 'unnamed' not in str(row['SubFamily']).lower():
            filtered_rows.append(row)
    if filtered_rows:
        dfs.append(pd.DataFrame(filtered_rows))
    
    # dfs.append(df)

# Concatenate all DataFrames into one
combined_df = pd.concat(dfs, ignore_index=True)

# Drop duplicate rows
combined_df = combined_df.drop_duplicates()

# Add a new column "Category" with empty values at the end of the DataFrame
combined_df['Category'] = ''

# Export the combined DataFrame to a new CSV file
combined_df.to_csv('combined_cleaned_data.csv', index=False)

print("Combined cleaned data saved to 'combined_cleaned_data.csv'")
