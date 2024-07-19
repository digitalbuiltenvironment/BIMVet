import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import networkx as nx
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import SparseCategoricalCrossentropy
from tensorflow.keras.metrics import SparseCategoricalAccuracy
from sklearn.preprocessing import LabelEncoder

# Read the CSV file into a pandas DataFrame
train_df = pd.read_csv('../datasets/train_set.csv')

train_df = train_df.drop(columns=['Assembly Code', 'Assembly Description', 'Type Name'])
# List of categorical columns to encode
categorical_columns = ['Family', 'SubFamily', 'ObjectGroup', 'ObjectName', 'Description', 'Type Comments', 'Structural Material', 'Material']

# Initialize LabelEncoder
label_encoders = {}

# Encode each categorical column
for col in categorical_columns:
    label_encoder = LabelEncoder()
    train_df[col] = label_encoder.fit_transform(train_df[col])
    label_encoders[col] = label_encoder  # Store the label encoder for future use

# Split data into train and test sets
X = train_df.drop(columns=['Category'])  # Features
y = train_df['Category']  # Target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Construct the graph (example using NetworkX, adjust as per your data)
G = nx.from_pandas_edgelist(train_df, source=X, target=y, edge_attr=True)

# Convert graph to adjacency matrix (example)
adj_matrix = nx.to_numpy_matrix(G)

# Define GNN model architecture
def create_gnn_model(input_shape, num_classes):
    inputs = Input(shape=input_shape)
    # Define your GNN layers here (example: Graph Convolutional layers)
    # Adjust based on your specific GNN architecture needs
    
    # Example: Dense layers for node embeddings
    x = Dense(64, activation='relu')(inputs)
    x = Dropout(0.5)(x)
    x = Dense(32, activation='relu')(x)
    x = Dropout(0.3)(x)
    
    # Output layer for classification
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=inputs, outputs=outputs)
    return model

# Example usage
input_shape = adj_matrix.shape  # Adjust based on your adjacency matrix shape
num_classes = len(train_df['Category'].unique())  # Number of classes for classification

# Create and compile the GNN model
model_gnn = create_gnn_model(input_shape, num_classes)
model_gnn.compile(optimizer=Adam(learning_rate=0.001),
                  loss=SparseCategoricalCrossentropy(),
                  metrics=[SparseCategoricalAccuracy()])

# Train the model
model_gnn.fit(adj_matrix, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))

# Evaluate the model
loss, accuracy = model_gnn.evaluate(adj_matrix, y_train)
print(f'Training Accuracy: {accuracy}')
loss, accuracy = model_gnn.evaluate(X_test, y_test)
print(f'Testing Accuracy: {accuracy}')
