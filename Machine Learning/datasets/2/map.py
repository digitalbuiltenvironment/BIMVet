import pandas as pd

# Load the main data CSV file
data_file_path = 'Tofinish_MCRCategories (version 1).csv'  # Replace with the actual path to your data file
data_df = pd.read_csv(data_file_path)

# Load the mapping CSV file
mapping_file_path = 'mapping.csv'  # Replace with the actual path to your mapping file
mapping_df = pd.read_csv(mapping_file_path)

# Create a dictionary from the mapping DataFrame
# Assuming the mapping CSV has columns 'OldCategory' and 'NewCategory'
mapping_dict = dict(zip(mapping_df['OldCategory'], mapping_df['NewCategory']))

# Replace the 'Category' column in the main data DataFrame
data_df['Category'] = data_df['Category'].map(mapping_dict).fillna(data_df['Category'])

# Save the updated DataFrame to a new CSV file
output_file_path = 'updated_data.csv'
data_df.to_csv(output_file_path, index=False)

print(f"Updated data saved to {output_file_path}")
