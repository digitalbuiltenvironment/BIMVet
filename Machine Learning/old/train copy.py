import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

# Load data
df = pd.read_csv('mcoutput.csv')

# Concatenate relevant text features
df['Features'] = df['Family'] + '_*Family*|' + df['SubFamily'] + '_*SubFamily*|' + df['ObjectGroup'] + '|' + df['ObjectName'] + '_*ObjectName*|' + df['Assembly Code'] + '|' + df['Assembly Description'] + '|' + df['Description'] + '|' + df['Type Comments'] + '|' + df['Type Name'] + '|' + df['Structural Material'] + '|' + df['Material']


# Split data into features (X) and target variable (y)
X = df['Features'].fillna('NaN')
y = df['Category']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.05, random_state=42)

# Custom tokenizer function with higher weight for 'Family'
def custom_tokenizer(text):
    # Tokenize the text
    tokens = text.split('|')
    
    # Assign higher IDF weight to 'Family' tokens
    weighted_tokens = []
    for token in tokens:
        if '_*Family*' in token:
            weighted_tokens.extend([token] * 4)  # Assigning a higher weight of 2 for 'Family'
            print(token)
        elif '_*SubFamily*' in token:
            weighted_tokens.extend([token] * 1)  # Assigning a higher weight of 1 for 'SubFamily'
        elif '_*ObjectName*' in token:
            weighted_tokens.extend([token] * 2)  # Assigning a higher weight of 1 for 'ObjectName'
        else:
            weighted_tokens.append(token)
    
    return weighted_tokens

# Vectorize text data using TF-IDF with custom tokenizer
vectorizer = TfidfVectorizer(tokenizer=custom_tokenizer)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# Initialize Random Forest classifier
rf_classifier = RandomForestClassifier(random_state=42)

# Define hyperparameters grid for tuning
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
}

# Perform grid search with cross-validation
grid_search = GridSearchCV(estimator=rf_classifier, param_grid=param_grid, cv=5)
grid_search.fit(X_train_tfidf, y_train)

# Get the best parameters and estimator from grid search
best_params = grid_search.best_params_
best_estimator = grid_search.best_estimator_

# Train the model with best parameters
best_estimator.fit(X_train_tfidf, y_train)

# Save the trained model and vectorizer to files
joblib.dump(best_estimator, 'random_forest_model.pkl')
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')

# Make predictions on the test set
predictions = best_estimator.predict(X_test_tfidf)

# Evaluate the model
accuracy = accuracy_score(y_test, predictions)
print("Accuracy:", accuracy)

# Print classification report and confusion matrix
print("\nClassification Report:")
print(classification_report(y_test, predictions))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))