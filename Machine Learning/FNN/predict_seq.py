import pandas as pd
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
import numpy as np

# Read the CSV file into a pandas DataFrame
df = pd.read_csv('../datasets/test_set.csv')

# Drop any columns that are not relevant for classification
df = df.drop(columns=['Assembly Code', 'Assembly Description', 'Description', 'Type Comments'])

EMPTYCONST = "*empty*"

# Define the same sequences as used in the training script
sequences = ['Family', 'SubFamily', 'ObjectGroup', 'ObjectName', 'Type Name', 'Structural Material', 'Material']

# Tokenize and pad each sequence separately
max_words = 200  # Maximum number of words to consider in tokenizer
max_len = 50  # Maximum length of sequences
tokenizer = Tokenizer(num_words=max_words)

X_seqs = []
for seq in sequences:
    X_seq = df[seq].fillna(EMPTYCONST).apply(lambda x: x + "_*" + seq.lower() + "*" if x != EMPTYCONST else x)
    tokenizer.fit_on_texts(X_seq)
    X_seq = tokenizer.texts_to_sequences(X_seq)
    X_seq = pad_sequences(X_seq, maxlen=max_len)
    X_seqs.append(X_seq)

# Load the saved model
model = load_model('FNN_model_py_seq_based.h5')

# Load the label_encoder from file
with open('label_encoder_seq.pkl', 'rb') as le_file:
    loaded_label_encoder = pickle.load(le_file)
print("LabelEncoder loaded from disk.")

# Combine all sequences into one input list for prediction
X = [X_seq for X_seq in X_seqs]

# Predictions
predictions = model.predict(X)

# Convert predictions to class labels
predicted_labels = loaded_label_encoder.inverse_transform(predictions.argmax(axis=-1))

# Calculate accuracy
y = df["Category"]
accuracy = np.mean(predicted_labels == y)
print(f"Accuracy: {accuracy}")

# Display results
# counter = 0
# for text, label in zip(X, predicted_labels):
#     counter += 1
#     print(f"{counter} Text: {text}")
#     print(f"Predicted Label: {label}")
#     print()
