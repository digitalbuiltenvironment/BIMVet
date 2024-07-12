import pandas as pd
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib
import warnings
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split

# Ignore specific warning
warnings.filterwarnings(
    "ignore", message="The least populated class in y has only 1 members"
)


# Load data
df = pd.read_csv("../datasets/train_set.csv")
EMPTYCONST = "*empty*"

# Concatenate relevant text features
catFamily = (
    df["Family"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*family*" if x != EMPTYCONST else x)
)
catSubFamily = (
    df["SubFamily"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*subfamily*" if x != EMPTYCONST else x)
)
catObjectGroup = (
    df["ObjectGroup"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*objectgroup*" if x != EMPTYCONST else x)
)
catObjectName = (
    df["ObjectName"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*objectname*" if x != EMPTYCONST else x)
)
# catAssemblyCode = df["Assembly Code"].fillna(EMPTYCONST)
# catAssemblyDescription = df["Assembly Description"].fillna(EMPTYCONST)
catDescription = (
    df["Description"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*description*" if x != EMPTYCONST else x)
)
catTypeComments = (
    df["Type Comments"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*typecomments*" if x != EMPTYCONST else x)
)
# catTypeName = df["Type Name"].fillna(EMPTYCONST)
catStructuralMaterial = (
    df["Structural Material"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*structuralmaterial*" if x != EMPTYCONST else x)
)
catMaterial = (
    df["Material"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*material*" if x != EMPTYCONST else x)
)


df["Features"] = (
    catFamily
    + "|"
    + catSubFamily
    + "|"
    + catObjectGroup
    + "|"
    + catObjectName
    + "|"
    # + catAssemblyCode
    # + "|"
    # + catAssemblyDescription
    # + "|"
    + catDescription
    + "|"
    + catTypeComments
    + "|"
    # + catTypeName
    # + "|"
    + catStructuralMaterial
    + "|"
    + catMaterial
)

# Split data into features (X) and target variable (y)
X = df["Features"].fillna(EMPTYCONST)
y = df["Category"]

WEIGHT_FAMILY = 8
WEIGHT_SUBFAMILY = 2
WEIGHT_OBJECTNAME = 2
WEIGHT_STRUCTURALMATERIAL = 2
WEIGHT_MATERIAL = 2
WEIGHT_DESCRIPTION = 2


# Custom tokenizer function with variable weights for different categories
def custom_tokenizer(text):
    # Tokenize the text
    tokens = text.split("|")

    # Assign weights to tokens based on hyperparameters
    weighted_tokens = []
    for token in tokens:
        if "_*family*" in token:
            weighted_tokens.extend([token] * WEIGHT_FAMILY)
        elif "_*subfamily*" in token:
            weighted_tokens.extend([token] * WEIGHT_SUBFAMILY)
        elif "_*objectname*" in token:
            weighted_tokens.extend([token] * WEIGHT_OBJECTNAME)
        elif "_*description*" in token:
            weighted_tokens.extend([token] * WEIGHT_DESCRIPTION)
        elif "_*structuralmaterial*" in token:
            weighted_tokens.extend([token] * WEIGHT_STRUCTURALMATERIAL)
        elif "_*material*" in token:
            weighted_tokens.extend([token] * WEIGHT_MATERIAL)
        elif token == EMPTYCONST:
            weighted_tokens.extend([token] * 0)  # Assigning a 0 weight for 'empty'
        else:
            weighted_tokens.append(token)

    return weighted_tokens


# Define a list of weights to test
weights_to_test = [
    {
        "weight_family": 8,
        "weight_subfamily": 2,
        "weight_objectname": 4,
        "weight_description": 3,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 2,
        "weight_objectname": 4,
        "weight_description": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 4,
        "weight_objectname": 4,
        "weight_description": 3,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 3,
        "weight_objectname": 5,
        "weight_description": 3,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 4,
        "weight_objectname": 5,
        "weight_description": 5,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 3,
        "weight_objectname": 5,
        "weight_description": 4,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 2,
        "weight_objectname": 6,
        "weight_description": 3,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 6,
        "weight_subfamily": 2,
        "weight_objectname": 4,
        "weight_description": 2,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 6,
        "weight_objectname": 4,
        "weight_description": 3,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 6,
        "weight_objectname": 4,
        "weight_description": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 6,
        "weight_objectname": 2,
        "weight_description": 2,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 6,
        "weight_objectname": 5,
        "weight_description": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 5,
        "weight_objectname": 4,
        "weight_description": 5,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 5,
        "weight_objectname": 3,
        "weight_description": 3,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 3,
        "weight_objectname": 5,
        "weight_description": 2,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 4,
        "weight_objectname": 6,
        "weight_description": 2,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 4,
        "weight_objectname": 6,
        "weight_description": 2,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 4,
        "weight_objectname": 7,
        "weight_description": 3,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 5,
        "weight_objectname": 7,
        "weight_description": 2,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 5,
        "weight_objectname": 7,
        "weight_description": 3,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 4,
        "weight_objectname": 7,
        "weight_description": 3,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 20,
        "weight_subfamily": 10,
        "weight_objectname": 15,
        "weight_description": 2,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 20,
        "weight_subfamily": 15,
        "weight_objectname": 10,
        "weight_description": 4,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 20,
        "weight_subfamily": 10,
        "weight_objectname": 10,
        "weight_description": 4,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 20,
        "weight_subfamily": 15,
        "weight_objectname": 15,
        "weight_description": 4,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
]

# Initialize a list to store F1 scores
f1_scores = []

# Initialize a list to store param_grids
param_grids = []
# Initialize a list to store top models with their F1 scores
top_models_with_f1 = []

# Iterate over each set of weights
for weights in weights_to_test:
    print("Testing weights:", weights)
    # Vectorize text data using TF-IDF with custom tokenizer and the current set of weights
    WEIGHT_FAMILY = weights["weight_family"]
    WEIGHT_SUBFAMILY = weights["weight_subfamily"]
    WEIGHT_OBJECTNAME = weights["weight_objectname"]
    WEIGHT_DESCRIPTION = weights["weight_description"]
    WEIGHT_STRUCTURALMATERIAL = weights["weight_structuralmaterial"]
    WEIGHT_MATERIAL = weights["weight_material"]

    vectorizer = TfidfVectorizer(tokenizer=custom_tokenizer, token_pattern=None)
    X_tfidf = vectorizer.fit_transform(X)

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X_tfidf, y, test_size=0.2, random_state=42
    )

    # Initialize Random Forest classifier
    rf_classifier = RandomForestClassifier(random_state=42)

    # Define hyperparameters grid for tuning
    param_grid = {
        "n_estimators": [50, 100, 200],
        "max_depth": [None, 10, 20],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf": [1, 2, 4],
    }

    # Perform grid search with cross-validation
    grid_search = GridSearchCV(estimator=rf_classifier, param_grid=param_grid, cv=3)
    grid_search.fit(X_train, y_train)

    # Get the best estimator from grid search
    best_estimator = grid_search.best_estimator_

    # Evaluate the model using F1-score on the testing set
    y_pred = best_estimator.predict(X_test)
    f1 = f1_score(y_test, y_pred, average="weighted")

    # Append the top model along with its F1-score
    top_models_with_f1.append(
        ((weights, grid_search.best_params_, best_estimator, vectorizer), f1)
    )

    # print("Weights:", weights)
    print("F1-score on Testing Set:", f1)
    print()

# Sort the top models based on F1-score
top_models_with_f1.sort(key=lambda x: x[1], reverse=True)

# Save the top 5 models based on F1-score
for idx, ((weights, best_params, best_estimator, vectorizer), f1_score) in enumerate(
    top_models_with_f1[:5], 1
):
    # Extract token weights from the model description
    tokens_str = "_".join(
        ["{}_{}".format(token, weight) for token, weight in weights.items()]
    )
    # Construct the filename based on token weights and best parameters
    filename = "top_model_{}_{}_{}.pkl".format(idx, tokens_str, f1_score)
    joblib.dump((best_estimator, vectorizer), filename)

# Save the bottom 2 models
for idx, ((weights, best_params, best_estimator, vectorizer), f1_score) in enumerate(
    top_models_with_f1[-2:], 1
):
    # Extract token weights from the model description
    tokens_str = "_".join(
        ["{}_{}".format(token, weight) for token, weight in weights.items()]
    )
    # Construct the filename based on token weights and best parameters
    filename = "bottom_model_{}_{}_{}.pkl".format(idx, tokens_str, f1_score)
    joblib.dump((best_estimator, vectorizer), filename)
