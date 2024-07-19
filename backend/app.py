from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

EMPTYCONST = "*empty*"

# Load the model and vectorizer
modelfile = "rf_final.pkl"
loaded_model, vectorizer = joblib.load(modelfile)


def create_features(row):
    # Concatenate relevant text features
    catFamily = row["Family"]
    if pd.isna(catFamily):
        catFamily = EMPTYCONST

    catSubFamily = row["SubFamily"]
    if pd.isna(catSubFamily):
        catSubFamily = EMPTYCONST
        
    catObjectGroup = (
        row["ObjectGroup"] if not pd.isna(row["ObjectGroup"]) else EMPTYCONST
    )

    catObjectName = row["ObjectName"]
    if pd.isna(catSubFamily):
        catObjectName = EMPTYCONST

    catDescription = row["Description"]
    if pd.isna(catSubFamily):
        catDescription = EMPTYCONST

    catTypeName = row["Type Name"] if not pd.isna(row["Type Name"]) else EMPTYCONST

    catStructuralMaterial = row["Structural Material"]
    if pd.isna(catSubFamily):
        catStructuralMaterial = EMPTYCONST

    catMaterial = row["Material"]
    if pd.isna(catSubFamily):
        catMaterial = EMPTYCONST

    row["Features"] = "{}|{}|{}|{}|{}|{}|{}|{}".format(
        catFamily,
        catSubFamily,
        catObjectGroup,
        catObjectName,
        catDescription,
        catTypeName,
        catStructuralMaterial,
        catMaterial,
    )

    return row["Features"]


@app.route("/predict", methods=["POST"])
def predict():
    # Get JSON data from request
    data = request.get_json()

    # Convert JSON data to DataFrame with first row as header
    df = pd.DataFrame(data[1:], columns=data[0])

    # Convert column names to strings and strip whitespace
    df.columns = df.columns.astype(str).str.strip()

    required_columns = [
        "Family",
        "SubFamily",
        "ObjectGroup",
        "ObjectName",
        "Description",
        "Type Name",
        "Structural Material",
        "Material",
    ]
    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        return (
            jsonify(
                {"error": f'Missing required columns: {", ".join(missing_columns)}'}
            ),
            400,
        )

    predictions = []
    for index, row in df.iterrows():
        # Concatenate relevant text features
        features = create_features(row)

        # Vectorize the text features using the loaded TfidfVectorizer
        features_tfidf = vectorizer.transform([features])

        # Make predictions on the vectorized data using the trained model
        predicted_class = loaded_model.predict(features_tfidf)[0]

        # Get the probability estimates for all classes
        probabilities = loaded_model.predict_proba(features_tfidf)[0]

        # Get the index of the predicted class
        predicted_class_index = list(loaded_model.classes_).index(predicted_class)

        # Append the prediction and its confidence to the results
        print(f"{row['objectNamewithID']}, Prediction: {predicted_class}, Confidence: {probabilities[predicted_class_index]:.2g}")

        predictions.append(
            {
                "objectNamewithID": row["objectNamewithID"],
                "externalID": row["objectExternalID"],
                "row_index": index,
                "predicted_category": predicted_class,
                "confidence": probabilities[predicted_class_index],
            }
        )

    # Return the predictions as JSON
    return jsonify(predictions)


if __name__ == "__main__":
    app.run(debug=True)
