import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score
import pickle

# Load the model from the file
with open('knn_model.pkl', 'rb') as file:
    knn_loaded = pickle.load(file)

# Assume new_data is the new dataset you want to predict
new_data = pd.read_csv('../datasets/test_set.csv')

# Handle missing values in new data
new_data.replace("<By Category>", "*EMPTY*", inplace=True)
new_data.fillna("*EMPTY*", inplace=True)

label_encoders = {}
# Convert categorical features to numerical values
for column in new_data.columns:
    if new_data[column].dtype == 'object':
        label_encoders[column] = LabelEncoder()
        new_data[column] = label_encoders[column].fit_transform(new_data[column])

# Select features and target variable
X = new_data.drop('Category', axis=1)
y = new_data['Category']
print(y)
# Normalize the features
scaler = StandardScaler()
new_data_scaled = scaler.fit_transform(X)

# Make predictions using the loaded model
predictions = knn_loaded.predict(new_data_scaled)

accuracy = accuracy_score(y, predictions)
print("Accuracy: {:.2f}%".format(accuracy * 100))
