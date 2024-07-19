import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, Flatten, Dropout
from tensorflow.keras.regularizers import l2
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import pickle
# Read the CSV file into a pandas DataFrame
df = pd.read_csv('../datasets/train_set.csv')

# # Drop any columns that are not relevant for classification
df = df.drop(columns=['Assembly Code', 'Assembly Description', 'Description', 'Type Comments'])

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
# catDescription = (
#     df["Description"]
#     .fillna(EMPTYCONST)
#     .apply(lambda x: x + "_*description*" if x != EMPTYCONST else x)
# )
# catTypeComments = df["Type Comments"].fillna(EMPTYCONST)
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
    + catTypeName
    + "|"
    + catStructuralMaterial
    + "|"
    + catMaterial
)

# Split data into features (X) and target variable (y)

# Encode categorical variable 'Category'
label_encoder = LabelEncoder()
df['Category'] = label_encoder.fit_transform(df['Category'])

X = df["Features"].fillna(EMPTYCONST)
y = df["Category"]

# Tokenize and pad sequences
max_words = 200  # Maximum number of words to consider in tokenizer
max_len = 50  # Maximum length of sequences
tokenizer = Tokenizer(num_words=max_words)
tokenizer.fit_on_texts(X)
X = tokenizer.texts_to_sequences(X)
X = pad_sequences(X, maxlen=max_len)

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)

y_train = np.array(y_train, dtype=np.int64)
y_test = np.array(y_test, dtype=np.int64)

# Define the neural network model
model = Sequential([
    Embedding(input_dim=len(tokenizer.word_index) + 1, output_dim=10, input_length=max_len),
    Flatten(),
    Dense(128, activation='relu', kernel_regularizer=l2(0.001)),
    Dropout(0.5),
    Dense(64, activation='relu', kernel_regularizer=l2(0.001)),
    Dropout(0.3),
    Dense(len(df['Category'].unique()), activation='softmax')
])

# Compile the model
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.1)

# Evaluate the model on the testing set
loss, accuracy = model.evaluate(X_test, y_test)
print("Test Accuracy:", accuracy)

# Save the model to disk
model.save('FNN_model_py.h5')
print("Model saved to disk.")


# Save the label_encoder to a file
with open('label_encoder.pkl', 'wb') as le_file:
    pickle.dump(label_encoder, le_file)