import joblib
import pandas as pd

EMPTYCONST = "*empty*"
# Load data
df = pd.read_csv("predict2.csv")


def create_features(row):
    # Concatenate relevant text features
    catFamily = row["Family"]
    if pd.isna(catFamily):
        catFamily = EMPTYCONST
    else:
        catFamily = catFamily + "_*family*"

    catSubFamily = row["SubFamily"]
    if pd.isna(catSubFamily):
        catSubFamily = EMPTYCONST
    else:
        catSubFamily = catSubFamily + "_*subfamily*"
    catObjectGroup = (
        row["ObjectGroup"] if not pd.isna(row["ObjectGroup"]) else EMPTYCONST
    )

    catObjectName = row["ObjectName"]
    if pd.isna(catSubFamily):
        catSubFamily = EMPTYCONST
    else:
        catSubFamily = catSubFamily + "_*objectname*"

    catAssemblyCode = (
        row["Assembly Code"] if not pd.isna(row["Assembly Code"]) else EMPTYCONST
    )

    catAssemblyDescription = (
        row["Assembly Description"]
        if not pd.isna(row["Assembly Description"])
        else EMPTYCONST
    )

    catDescription = (
        row["Description"] if not pd.isna(row["Description"]) else EMPTYCONST
    )

    catTypeComments = (
        row["Type Comments"] if not pd.isna(row["Type Comments"]) else EMPTYCONST
    )

    catTypeName = row["Type Name"] if not pd.isna(row["Type Name"]) else EMPTYCONST

    catStructuralMaterial = row["Structural Material"]
    if pd.isna(catSubFamily):
        catSubFamily = EMPTYCONST
    else:
        catSubFamily = catSubFamily + "_*structuralmaterial*"

    catMaterial = row["Material"]
    if pd.isna(catSubFamily):
        catSubFamily = EMPTYCONST
    else:
        catSubFamily = catSubFamily + "_*material*"

    row["Features"] = "{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}".format(
        catFamily,
        catSubFamily,
        catObjectGroup,
        catObjectName,
        catAssemblyCode,
        catAssemblyDescription,
        catDescription,
        catTypeComments,
        catTypeName,
        catStructuralMaterial,
        catMaterial,
    )

    return row["Features"]


# Define your custom tokenizer function
def custom_tokenizer(text):
    # Tokenize the text
    tokens = text.split("|")

    # Assign higher IDF weight to 'Family' tokens
    weighted_tokens = []
    for token in tokens:
        if "_*family*" in token:
            weighted_tokens.extend(
                [token] * 4
            )  # Assigning a higher weight for 'Family'
        elif "_*subfamily*" in token:
            weighted_tokens.extend(
                [token] * 1
            )  # Assigning a higher weight for 'SubFamily'
        elif "_*objectname*" in token:
            weighted_tokens.extend(
                [token] * 2
            )  # Assigning a higher weight for 'ObjectName'
        elif token == EMPTYCONST:
            weighted_tokens.extend([token] * 0)  # Assigning a 0 weight for 'empty'
        else:
            weighted_tokens.append(token)

    return weighted_tokens

modelfile = "top_model_4_weight_family_10_weight_objectname_5_weight_subfamily_3_weight_structuralmaterial_2_weight_material_2.pkl"

loaded_model, vectorizer = joblib.load(modelfile)
# Load the saved model and vectorizer
# loaded_model, vectorizer = joblib.load("random_forest_model.pkl")

# # Set the custom tokenizer function in the TfidfVectorizer
# vectorizer.tokenizer = custom_tokenizer

for index, row in df.iterrows():
    # Concatenate relevant text features
    features = create_features(row)
    category = row["Category"]
    # print(category)

    # Vectorize the text features using the loaded TfidfVectorizer
    features_tfidf = vectorizer.transform([features])

    # Make predictions on the vectorized data using the trained model
    predicted_class = loaded_model.predict(features_tfidf)[0]

    # Get the probability estimates for all classes
    probabilities = loaded_model.predict_proba(features_tfidf)[0]

    # Get the index of the predicted class
    predicted_class_index = list(loaded_model.classes_).index(predicted_class)
    # Print the predicted category and its confidence level
    print(f"Row {index}: Predicted Category - {predicted_class}, ({probabilities[predicted_class_index]})")
    
print(f"Model: {modelfile}")

