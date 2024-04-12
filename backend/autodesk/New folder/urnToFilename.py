import os
import base64

def base64_to_text(encoded_string):
    try:
        # Add padding characters if necessary
        missing_padding = len(encoded_string) % 4
        if missing_padding != 0:
            encoded_string += '=' * (4 - missing_padding)
        
        # Decode base64 string
        decoded_bytes = base64.b64decode(encoded_string)
        decoded_text = decoded_bytes.decode('utf-8')
        return decoded_text
    except Exception as e:
        print(f"Error decoding base64 string: {e}")
        return None

# Get list of files in current directory
files = [f for f in os.listdir('.') if os.path.isfile(f)]

# Filter files with "output" in the name and ending with ".csv"
output_files = [f for f in files if f.lower().endswith('.csv')]

for output_file in output_files:
    urn = output_file.split(".")[0].split("-")[-1]
    outputNumber = output_file.split("-")[0]
    # print(urn)
    decoded_text = base64_to_text(urn)
    if decoded_text:
        fileName = decoded_text.split("bimvetbucket/")[-1].split(".rvt")[0].replace("%20", "_").replace(".", "_")
        new_file_name = f"{outputNumber}-{fileName}.csv"
        os.rename(output_file, new_file_name)