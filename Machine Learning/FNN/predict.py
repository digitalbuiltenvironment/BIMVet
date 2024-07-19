import pandas as pd
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
import numpy as np

# Read the CSV file into a pandas DataFrame
df = pd.read_csv("../datasets/test_set.csv")

# # Drop any columns that are not relevant for classification
df = df.drop(columns=["Assembly Code", "Assembly Description", "Type Name"])

EMPTYCONST = "*empty*"

# Concatenate relevant text features
catFamily = (
    df["Family"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*family*" if x != EMPTYCONST else x)
)
catSubFamily = (
    df["SubFamily"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*subfamily*" if x != EMPTYCONST else x)
)
catObjectGroup = df["ObjectGroup"].fillna(EMPTYCONST)
catObjectName = (
    df["ObjectName"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*objectname*" if x != EMPTYCONST else x)
)
# catAssemblyCode = df["Assembly Code"].fillna(EMPTYCONST)
# catAssemblyDescription = df["Assembly Description"].fillna(EMPTYCONST)
catDescription = (
    df["Description"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*description*" if x != EMPTYCONST else x)
)
catTypeComments = df["Type Comments"].fillna(EMPTYCONST)
# catTypeName = df["Type Name"].fillna(EMPTYCONST)
catStructuralMaterial = (
    df["Structural Material"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*structuralmaterial*" if x != EMPTYCONST else x)
)
catMaterial = (
    df["Material"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*material*" if x != EMPTYCONST else x)
)


df["Features"] = (
    catFamily
    + "|"
    + catSubFamily
    + "|"
    + catObjectGroup
    + "|"
    + catObjectName
    # + "|"
    # + catAssemblyCode
    # + "|"
    # + catAssemblyDescription
    + "|"
    + catDescription
    + "|"
    + catTypeComments
    # + "|"
    # + catTypeName
    + "|"
    + catStructuralMaterial
    + "|"
    + catMaterial
)

# Load the saved model
model = load_model("FNN_model_py.h5")

# Load the label_encoder from file
with open("label_encoder.pkl", "rb") as le_file:
    loaded_label_encoder = pickle.load(le_file)
print("LabelEncoder loaded from disk.")

X_data = df["Features"].fillna(EMPTYCONST)
y = df["Category"]

# Tokenize and pad the new text data
max_words = 5000  # Maximum number of words to consider in tokenizer
max_len = 50  # Maximum length of sequences
tokenizer = Tokenizer(num_words=max_words)
tokenizer.fit_on_texts(X_data)
# Convert text to sequences and pad them
X = tokenizer.texts_to_sequences(X_data)
X = pad_sequences(X, maxlen=max_len)

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
