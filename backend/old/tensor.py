import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense

# Load data
df = pd.read_csv('mcoutput.csv')

# Concatenate relevant text features
df['Features'] = df['Family'] + ' ' + df['SubFamily'] + ' ' + df['ObjectGroup'] + ' ' + df['ObjectName'] + ' ' + df['Assembly Code'] + ' ' + df['Assembly Description'] + ' ' + df['Description'] + ' ' + df['Type Comments'] + ' ' + df['Type Name'] + ' ' + df['Structural Material'] + ' ' + df['Material']

# Split data into features (X) and target variable (y)
X = df['Features'].fillna('NaN')
y = df['Category']

# Encode labels
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.05, random_state=42)

# Tokenize text data
tokenizer = Tokenizer()
tokenizer.fit_on_texts(X_train)

X_train_seq = tokenizer.texts_to_sequences(X_train)
X_test_seq = tokenizer.texts_to_sequences(X_test)

# Pad sequences to ensure uniform length
max_len = max([len(seq) for seq in X_train_seq + X_test_seq])
X_train_padded = pad_sequences(X_train_seq, maxlen=max_len, padding='post')
X_test_padded = pad_sequences(X_test_seq, maxlen=max_len, padding='post')

# Define the model
model = Sequential([
    Embedding(input_dim=len(tokenizer.word_index) + 1, output_dim=100, input_length=max_len),
    LSTM(64),
    Dense(64, activation='relu'),
    Dense(len(label_encoder.classes_), activation='softmax')
])

# Compile the model
model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# Train the model
model.fit(X_train_padded, y_train, epochs=10, batch_size=64, validation_split=0.1)

# Evaluate the model
loss, accuracy = model.evaluate(X_test_padded, y_test)
print("Test Accuracy:", accuracy)

# Make predictions
predictions = np.argmax(model.predict(X_test_padded), axis=-1)

# Decode labels
decoded_predictions = label_encoder.inverse_transform(predictions)

# Print classification report and confusion matrix
print("\nClassification Report:")
print(classification_report(y_test, predictions))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))
