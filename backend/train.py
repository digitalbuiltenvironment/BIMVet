import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Sample data (replace this with your actual dataset)
# data = {
#     'Type Name': ['door', 'door', 'wall', 'wall', 'staircase', 'glass roof'],
#     'Object Description': ['glass door', 'wooden door', 'dry wall', 'brick wall', 'metal staircase', 'glass roof'],
#     'Structural Material': ['glass', 'wood', 'drywall', 'brick', 'metal', 'glass'],
#     'Category': ['glass door', 'general door', 'dry wall', 'brick wall', 'staircase', 'glass roof']
# }

# df = pd.DataFrame(data)
df = pd.read_csv('test4.csv')

# Concatenate relevant text features
df['Features'] = df['Type Name'] + ' ' + df['Object Description'] + ' ' + df['Structural Material']

# Split data into features (X) and target variable (y)
X = df['Features']
y = df['Category']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Vectorize text data using TF-IDF
vectorizer = TfidfVectorizer()
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# Initialize Random Forest classifier
rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)

# Train the model
rf_classifier.fit(X_train_tfidf, y_train)

# Make predictions on the test set
predictions = rf_classifier.predict(X_test_tfidf)

# Evaluate the model
accuracy = accuracy_score(y_test, predictions)
print("Accuracy:", accuracy)

# Print classification report and confusion matrix
print("\nClassification Report:")
print(classification_report(y_test, predictions))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))
