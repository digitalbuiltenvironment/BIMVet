import time
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score
from imblearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

# Load the dataset
data = pd.read_csv("../datasets/train_set.csv")

# Drop unnecessary columns
data = data.drop(columns=["Assembly Code", "Assembly Description"])

# Handle missing values if any
data.replace("<By Category>", "*EMPTY*", inplace=True)
data.fillna("*EMPTY*", inplace=True)

# Split data into features and target variable
X = data.drop(columns=["Category"])
y = data["Category"]

# Encode categorical variables
label_encoders = {}
for column in X.select_dtypes(include=["object"]).columns:
    label_encoders[column] = LabelEncoder()
    X[column] = label_encoders[column].fit_transform(X[column])

# Start timing
start_time = time.time()

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define a pipeline with Naive Bayes classifier
pipeline = Pipeline([
    ('classifier', MultinomialNB())
])

# Define the hyperparameter grid to search
param_grid = {
    'classifier__alpha': [0.1, 0.5, 1.0, 2.0]  # Adjust the values as needed
}

# Perform grid search with cross-validation
grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy')
grid_search.fit(X_train, y_train)

# Get the best hyperparameters
best_alpha = grid_search.best_params_['classifier__alpha']

# Initialize and fit the Naive Bayes classifier with the best hyperparameters
nb_classifier = MultinomialNB(alpha=best_alpha)
nb_classifier.fit(X_train, y_train)

# Make predictions
y_pred = nb_classifier.predict(X_test)

# Evaluate the classifier
accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)

# End timing
end_time = time.time()

# Calculate total runtime
total_time = end_time - start_time
print(f"Total runtime: {total_time} seconds")

# Load the additional test dataset
test_data = pd.read_csv("../datasets/test_set.csv")

# Drop unnecessary columns
test_data = test_data.drop(columns=["Assembly Code", "Assembly Description"])

# Handle missing values if any
test_data.replace("<By Category>", "*EMPTY*", inplace=True)
test_data.fillna("*EMPTY*", inplace=True)

# Encode categorical variables using the same label encoders as the training set
for column in test_data.select_dtypes(include=["object"]).columns:
    if column in label_encoders:
        test_data[column] = test_data[column].apply(lambda x: x if x in label_encoders[column].classes_ else "*UNSEEN*")
        label_encoders[column].classes_ = np.append(label_encoders[column].classes_, "*UNSEEN*")
        test_data[column] = label_encoders[column].transform(test_data[column])

# Split data into features and target variable
X_new_test = test_data.drop(columns=["Category"])
y_new_test = test_data["Category"]

# Make predictions on the new test dataset
y_new_pred = nb_classifier.predict(X_new_test)

# Evaluate the classifier on the new test dataset
new_accuracy = accuracy_score(y_new_test, y_new_pred)
print("New Test Set Accuracy:", new_accuracy)
