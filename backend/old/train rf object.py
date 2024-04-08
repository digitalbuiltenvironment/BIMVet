import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

# Generate a larger random dataset
np.random.seed(42)  # Set seed for reproducibility

num_samples = 1000

data = {
    'Type': np.random.choice(['Door', 'Floor'], num_samples),
    'OverallLeafHeight': np.random.randint(100, 200, num_samples),
    'FlushBoltw/Socket': np.random.choice([True, False, None], num_samples),
    'AcousticRating': np.random.choice(['Good', 'Excellent', 'Poor', ''], num_samples),
    'Default Thickness': np.random.choice([0.2, 0.3, None], num_samples),
    'ParameterFilledCorrectly': np.random.choice([0, 1], num_samples)
}
df = pd.DataFrame(data)

# Handling missing values
df = df.dropna()  # Remove rows with missing values

# Convert boolean variable to numerical using Label Encoding
label_encoder = LabelEncoder()
df['FlushBoltw/Socket'] = label_encoder.fit_transform(df['FlushBoltw/Socket'])

# Perform one-hot encoding for 'AcousticRating'
df = pd.get_dummies(df, columns=['AcousticRating'], drop_first=True)
# Perform one-hot encoding for 'AcousticRating'
df = pd.get_dummies(df, columns=['Type'], drop_first=True)

# Split the data into features (X) and target variable (y)
X = df.drop('ParameterFilledCorrectly', axis=1)
y = df['ParameterFilledCorrectly']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Display the preprocessed data
print("X_train:")
print(X_train)
print("\ny_train:")
print(y_train)
# Initialize the Random Forest classifier
rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)

# Train the model
rf_classifier.fit(X_train, y_train)

# Make predictions on the test set
predictions = rf_classifier.predict(X_test)

# Evaluate the model
print("Classification Report:")
print(classification_report(y_test, predictions, zero_division=1))
