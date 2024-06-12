import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score
from imblearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

# Load the dataset
data = pd.read_csv("mcoutput_old.csv")

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
