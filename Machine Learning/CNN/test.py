import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from tensorflow.keras.models import Sequential
import numpy as np
from tensorflow.keras.layers import Dense, Dropout, Conv1D, MaxPooling1D, Flatten, Embedding, GlobalMaxPooling1D
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
import matplotlib.pyplot as plt

# Read the CSV file into a pandas DataFrame
train_df = pd.read_csv('../datasets/train_set.csv')

train_df = train_df.drop(columns=['Assembly Code', 'Assembly Description', 'Type Name'])

# Define preprocessing for categorical features
categorical_features = ['Family', 'SubFamily', 'ObjectGroup', 'ObjectName', 'Description', 'Type Comments', 'Structural Material', 'Material']
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))])

# Combine preprocessors
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', categorical_transformer, categorical_features)])

# Split the data into training and testing sets
X = train_df.drop('Category', axis=1)
y = train_df['Category']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit and transform the training data
X_train_processed = preprocessor.fit_transform(X_train)
X_test_processed = preprocessor.transform(X_test)


# Initialize LabelEncoder
label_encoder = LabelEncoder()

y_encoder = LabelEncoder()
y_train = y_encoder.fit_transform(y_train)
y_test_encoded = y_encoder.fit_transform(y_test)

# Define the neural network model
model_cnn = Sequential([
    Embedding(input_dim=X_train.shape[1], output_dim=100, input_shape=(timesteps, features)),
    Conv1D(filters=64, kernel_size=3, activation='relu'),
    MaxPooling1D(pool_size=2),
    Conv1D(filters=32, kernel_size=3, activation='relu'),
    GlobalMaxPooling1D(),
    Dense(64, activation='relu'),
    Dropout(0.5),
    Dense(len(train_df['Category'].unique()), activation='softmax')
])


# Compile and train the model
model_cnn.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
history = model_cnn.fit(X_train_processed, y_train, epochs=50, batch_size=32, validation_data=(X_test_processed, y_test_encoded))

# Evaluate the model on the testing set
loss, accuracy = model_cnn.evaluate(X_test_processed, y_test_encoded)
print("Test Accuracy:", accuracy)

# Save the model to disk
model_cnn.save('FNN_model_pipline.h5')
print("Model saved to disk.")

# Plot training history
plt.figure(figsize=(12, 6))

# Plot training & validation accuracy values
plt.plot(history.history['accuracy'])
plt.plot(history.history['val_accuracy'])
plt.title('Model accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend(['Train', 'Test'], loc='upper left')
plt.show()

# Save the model to disk
model_cnn.save('CNN_model_pipline.h5')
print("Model saved to disk.")