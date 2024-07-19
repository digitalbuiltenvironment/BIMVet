import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, Conv1D, GlobalMaxPooling1D, Dense, Concatenate, Dropout
from tensorflow.keras.regularizers import l2
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle

# Read the CSV file into a pandas DataFrame
df = pd.read_csv('../datasets/train_set.csv')

# Drop any columns that are not relevant for classification
df = df.drop(columns=['Assembly Code', 'Assembly Description', 'Type Comments'])

EMPTYCONST = "*empty*"

# Define input sequences (example: Family, SubFamily, ObjectGroup)
sequences = ['Family', 'SubFamily', 'Description', 'ObjectGroup', 'ObjectName', 'Type Name', 'Structural Material', 'Material']

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

# Split data into features (X) and target variable (y)
y = df["Category"]
y_encoder = LabelEncoder()
y = y_encoder.fit_transform(y)

# Split the dataset into training and testing sets
X_train_seqs = [X_seq[:int(len(X_seq)*0.9)] for X_seq in X_seqs]
X_test_seqs = [X_seq[int(len(X_seq)*0.9):] for X_seq in X_seqs]
y_train = y[:int(len(y)*0.9)]
y_test = y[int(len(y)*0.9):]

# Define the CNN model using Functional API
input_layers = []
embedding_layers = []
for seq_index, seq in enumerate(sequences):
    input_layer = Input(shape=(max_len,), name=f"input_{seq}")
    embedding_layer = Embedding(input_dim=max_words, output_dim=10, input_length=max_len)(input_layer)
    conv_layer = Conv1D(128, 5, activation='relu')(embedding_layer)
    pool_layer = GlobalMaxPooling1D()(conv_layer)
    input_layers.append(input_layer)
    embedding_layers.append(pool_layer)

merged = Concatenate()(embedding_layers)
dense_layer = Dense(128, activation='relu', kernel_regularizer=l2(0.001))(merged)
dropout_layer = Dropout(0.5)(dense_layer)
output_layer = Dense(len(df['Category'].unique()), activation='softmax')(dropout_layer)

model = Model(inputs=input_layers, outputs=output_layer)

# Compile the model
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train_seqs, y_train, epochs=50, batch_size=32, validation_split=0.1)

# Evaluate the model on the testing set
loss, accuracy = model.evaluate(X_test_seqs, y_test)
print("Test Accuracy:", accuracy)

# Save the model to disk
model.save('FNN_model_py_seq_based.h5')
print("Model saved to disk.")

# Save the label_encoder to a file
with open('label_encoder_seq.pkl', 'wb') as le_file:
    pickle.dump(y_encoder, le_file)
print("LabelEncoder saved to disk.")