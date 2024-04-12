import csv

csv_file = 'test.csv'
output_file = 'filtered_data.csv'

# Define the encoding to use
encoding = 'latin1'  # You can change this if needed

current_mcr = ''
current_family = ''
current_subfamily = ''
current_object = ''
current_checklist = {}
firstcallflag = True

# Open the CSV file
with open(csv_file, 'r', encoding=encoding) as file:
    # Create a CSV reader object
    csv_reader = csv.reader(file)
    
    # Open the output CSV file in write mode
    with open(output_file, 'w', newline='', encoding=encoding) as output_file:
        # Create a CSV writer object
        csv_writer = csv.writer(output_file)
        
        # Iterate over each row in the CSV file
        for row in csv_reader:
            if row[0] == '5':
                current_checklist[str(row[21])] = f"{row[23]}||{row[25]}||{row[22]}"
            elif row[0] == '1':
                current_mcr = row[3]
            elif row[0] == '2':
                current_family = row[3]
            elif row[0] == '3':
                current_subfamily = row[3]
            elif row[0] == '4':
                if firstcallflag:
                    firstcallflag = False
                else:
                    csv_writer.writerow([current_mcr, current_family, current_subfamily, current_object, str(current_checklist)])
                current_checklist = {}
                current_object = row[3]
            
            # 0: Level Type
            # 1: Code
            # 2: Title
            # 3: Subtitle
            # 4: Entity Type
            # 5: Team
            # 6: Team Member
            # 7: Standard (None)
            # 8: Geometry
            # 9: Reliability
            # 10: Accuracy
            # 11: Description
            # 12: Start Date (GMT)
            # 13: End Date (GMT)
            # 14: Status
            # 15: Attachments
            # 16: Checklist
            # 17: Info ID
            # 18: Info TYPE
            # 19: Info GROUP
            # 20: Info NAME
            # 21: Info DESCRIPTION
            # 22: Info VERIFICATION RULE
            # 23: Info VALUE
            # 24: Info UNITS
            # 25: Info TAGS
            # 26: Unique ID
            # 27: Element ID
            