import pandas as pd
import os

# Function to count "NOT SURE" values in the Category column
def count_not_sure(csv_file):
    # Read the CSV file into a DataFrame
    df = pd.read_csv(csv_file)
    # Count the occurrences of "NOT SURE" in the Category column
    not_sure_count = (df['Category'] == 'NOT SURE').sum()
    return not_sure_count

# Get a list of CSV files in the current directory
csv_files = [file for file in os.listdir() if file.endswith('.csv')]

# Iterate over each CSV file and count "NOT SURE" values
for csv_file in csv_files:
    not_sure_count = count_not_sure(csv_file)
    print(f'In {csv_file}, "NOT SURE" count: {not_sure_count}')
