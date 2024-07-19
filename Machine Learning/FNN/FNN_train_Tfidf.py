import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, Flatten
import numpy as np

# Read the CSV file into a pandas DataFrame
df = pd.read_csv('../datasets/train_set.csv')

# # Drop any columns that are not relevant for classification
# df = df.drop(columns=['Assembly Code', 'Assembly Description', 'Description', 'Type Comments'])

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
catAssemblyCode = df["Assembly Code"].fillna(EMPTYCONST)
catAssemblyDescription = df["Assembly Description"].fillna(EMPTYCONST)
catDescription = (
    df["Description"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*description*" if x != EMPTYCONST else x)
)
catTypeComments = df["Type Comments"].fillna(EMPTYCONST)
catTypeName = df["Type Name"].fillna(EMPTYCONST)
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
    + "|"
    + catAssemblyCode
    + "|"
    + catAssemblyDescription
    + "|"
    + catDescription
    + "|"
    + catTypeComments
    + "|"
    + catTypeName
    + "|"
    + catStructuralMaterial
    + "|"
    + catMaterial
)

# Split data into features (X) and target variable (y)
X = df["Features"].fillna(EMPTYCONST)
y = df["Category"]

WEIGHT_FAMILY = 8
WEIGHT_SUBFAMILY = 2
WEIGHT_OBJECTNAME = 2
WEIGHT_STRUCTURALMATERIAL = 2
WEIGHT_MATERIAL = 2
WEIGHT_DESCRIPTION = 2


# Custom tokenizer function with variable weights for different categories
def custom_tokenizer(text):
    # Tokenize the text
    tokens = text.split("|")

    # Assign weights to tokens based on hyperparameters
    weighted_tokens = []
    for token in tokens:
        if "_*family*" in token:
            weighted_tokens.extend([token] * WEIGHT_FAMILY)
        elif "_*subfamily*" in token:
            weighted_tokens.extend([token] * WEIGHT_SUBFAMILY)
        elif "_*objectname*" in token:
            weighted_tokens.extend([token] * WEIGHT_OBJECTNAME)
        elif "_*description*" in token:
            weighted_tokens.extend([token] * WEIGHT_DESCRIPTION)
        elif "_*structuralmaterial*" in token:
            weighted_tokens.extend([token] * WEIGHT_STRUCTURALMATERIAL)
        elif "_*material*" in token:
            weighted_tokens.extend([token] * WEIGHT_MATERIAL)
        elif token == EMPTYCONST:
            weighted_tokens.extend([token] * 0)  # Assigning a 0 weight for 'empty'
        else:
            weighted_tokens.append(token)

    return weighted_tokens

# Encode categorical variable 'Category'
label_encoder = LabelEncoder()
df['Category'] = label_encoder.fit_transform(df['Category'])

# Split data into features (X) and target variable (y)
X = df["Features"].fillna(EMPTYCONST)
y = df["Category"]

vectorizer = TfidfVectorizer(tokenizer=custom_tokenizer, token_pattern=None)
X_tfidf = vectorizer.fit_transform(X)

# Convert X_tfidf to a dense numpy array
X_tfidf_dense = X_tfidf.toarray()

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_tfidf_dense, y, test_size=0.1, random_state=42)

# Define the neural network model
model = Sequential([
    Embedding(input_dim=X_train.shape[1], output_dim=100, input_length=X_train.shape[1]),
    Flatten(),
    Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
    Dense(64, activation='relu'),
    Dense(len(df['Category'].unique()), activation='softmax')
])

# Compile the model
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, epochs=100, batch_size=32, validation_split=0.1)

# Evaluate the model on the testing set
loss, accuracy = model.evaluate(X_test, y_test)
print("Test Accuracy:", accuracy)

# Save the model to disk
model.save('FNN_model_py_Tifidf.h5')
print("Model saved to disk.")
