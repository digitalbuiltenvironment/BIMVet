import pandas as pd
from tensorflow.keras.models import Sequential, load_model
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
import numpy as np

# Read the CSV file into a pandas DataFrame
df = pd.read_csv("../datasets/test_set.csv")

# # Drop any columns that are not relevant for classification
df = df.drop(columns=["Assembly Code", "Assembly Description", "Type Name"])

# Load the saved model
model = load_model("FNN_model.h5")
    
# Load the label_encoder from file
with open("label_encoder_ipynb.pkl", "rb") as le_file:
    loaded_label_encoder = pickle.load(le_file)
print("LabelEncoder loaded from disk.")

# Encode categorical variables using the loaded label encoders
for column in df.select_dtypes(include=['object']).columns:
    if column in loaded_label_encoder:
        df[column] = loaded_label_encoder[column].transform(df[column])
        
# Split features and labels
X = df.drop(columns=['Category'])
y = df['Category']

# Predictions
predictions = model.predict(X)

# Convert predictions to class labels
predicted_labels = loaded_label_encoder.inverse_transform(predictions.argmax(axis=-1))

# Calculate accuracy
accuracy = np.mean(predicted_labels == y)
print(f"Accuracy: {accuracy}")

# # Display results
# counter = 0
# for text, label in zip(X_data, predicted_labels):
#     counter += 1
#     print(f"{counter} Text: {text}")
#     print(f"Predicted Label: {label}")
#     print()
