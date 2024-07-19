import os
import csv

# Get list of files in current directory
files = [f for f in os.listdir('.') if os.path.isfile(f)]

# Filter files with "output" in the name and ending with ".csv"
output_files = [f for f in files if f.lower().endswith('.rvt')]

with open('output.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    for output_file in output_files:
        writer.writerow([output_file])