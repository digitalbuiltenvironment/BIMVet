# Import necessary libraries
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from imblearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

# Load your dataset
data = pd.read_csv('mcoutput.csv')

# Encode categorical variables
label_encoders = {}
for column in data.select_dtypes(include=['object']).columns:
    label_encoders[column] = LabelEncoder()
    data[column] = label_encoders[column].fit_transform(data[column].astype(str))

# Split the data into features and target
X = data.drop(columns=['Category'])
y = data['Category']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define column transformer for handling missing values
numerical_features = X.select_dtypes(include=['int64', 'float64']).columns
categorical_features = X.select_dtypes(include=['int']).columns

numerical_transformer = SimpleImputer(strategy='mean')
categorical_transformer = SimpleImputer(strategy='most_frequent')

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Create a pipeline that first applies the preprocessor and then SMOTE and finally the classifier
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(random_state=42))
])

# Define the parameter grid for Grid Search
param_grid = {
    'classifier__n_estimators': [100, 200, 300],
    'classifier__max_depth': [10, 20, 30, None],
    'classifier__min_samples_split': [2, 5, 10],
    'classifier__min_samples_leaf': [1, 2, 4],
    'classifier__bootstrap': [True, False]
}

# Initialize Grid Search
# grid_search = GridSearchCV(estimator=pipeline, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2, error_score='raise')
grid_search = GridSearchCV(estimator=pipeline, param_grid=param_grid, cv=3, n_jobs=-1, verbose=0, error_score='raise')

# Fit Grid Search to the training data
try:
    grid_search.fit(X_train, y_train)
except ValueError as e:
    print(f"Error during model fitting: {e}")

# Check the best parameters and best model if fitting was successful
if grid_search.best_estimator_:
    best_params = grid_search.best_params_
    best_pipeline = grid_search.best_estimator_

    # Predict on the test set with the best model
    y_pred = best_pipeline.predict(X_test)

    # Evaluate the best model
    accuracy = accuracy_score(y_test, y_pred)

    print(f'Best Parameters: {best_params}')
    print(f'Accuracy: {accuracy}')
else:
    print("Model fitting was not successful.")
