import pandas as pd
import joblib
from sklearn.metrics import classification_report

# Load the trained model
model_filename = 'random_forest_model.pkl'
loaded_model = joblib.load(model_filename)

# Load the evaluation dataset (if separate from training data)
test_file_path = '../datasets/train_set.csv'
test_df = pd.read_csv(test_file_path)

# Separate features and target variable
X_test = test_df.drop('Category', axis=1)
y_test = test_df['Category']

# Predict and evaluate the model
y_pred = loaded_model.predict(X_test)
print(classification_report(y_test, y_pred))
