import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from lime.lime_tabular import LimeTabularExplainer

# Load your labeled BIM data (replace with your actual data)
data = pd.read_csv("test2.csv")

# Convert categorical attributes to one-hot encoding
data_encoded = pd.get_dummies(data, columns=["AcousticRating"])

# Split data into features (X) and target (y)
X = data_encoded.drop(columns=["Valid"])
y = data_encoded["Valid"]

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the Random Forest model
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)

# Train the model
rf_model.fit(X_train, y_train)

# Make predictions on the test set
y_pred = rf_model.predict(X_test)

# Evaluate model performance
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.2f}")

# Initialize LIME explainer
categorical_features = [col.startswith("AcousticRating") for col in X_train.columns]
explainer = LimeTabularExplainer(X_train.values, mode="classification", categorical_features=categorical_features)


# Choose a specific BIM object (e.g., the first one in the test set)
bim_object = X_test.iloc[1]
print("BIM Object:\n" + str(bim_object))

# Explain the model's prediction for this BIM object
explanation = explainer.explain_instance(bim_object.values, rf_model.predict_proba, num_features=len(X.columns))

# Print the explanation
print("Explanation for BIM Object:")
print(explanation.as_list())# Make predictions on the test set

# Print the predicted class for the first BIM object
predicted_class = y_pred[1]
print("Predicted Class for the first BIM Object:", predicted_class)
# # Print the corresponding probability if it's a probability-based prediction
# if hasattr(rf_model, 'predict_proba'):
#     print(rf_model.get_params())
#     # Get the predicted probabilities for all classes
#     predicted_proba_all_classes = rf_model.predict_proba(X_test)[0]

#     # Extract the probability for the predicted class
#     predicted_proba = predicted_proba_all_classes[predicted_class]
    
#     print("Predicted Probability for the first BIM Object: {:.4f}".format(predicted_proba))
# else:
#     print("The model does not support probability estimates.")


# Now you can use this trained model and explanations to validate BIM object parameters
