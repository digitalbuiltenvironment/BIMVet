import pandas as pd
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib
import warnings

# Ignore specific warning
warnings.filterwarnings(
    "ignore", message="The least populated class in y has only 1 members"
)


# Load data
df = pd.read_csv("mcoutput.csv")
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
catObjectGroup = df["ObjectGroup"].fillna(EMPTYCONST)
catObjectName = (
    df["ObjectName"]
    .fillna(EMPTYCONST)
    .apply(lambda x: x + "_*objectname*" if x != EMPTYCONST else x)
)
catAssemblyCode = df["Assembly Code"].fillna(EMPTYCONST)
catAssemblyDescription = df["Assembly Description"].fillna(EMPTYCONST)
catDescription = df["Description"].fillna(EMPTYCONST)
catTypeComments = df["Type Comments"].fillna(EMPTYCONST)
catTypeName = df["Type Name"].fillna(EMPTYCONST)
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
    + catAssemblyCode
    + "|"
    + catAssemblyDescription
    + "|"
    + catDescription
    + "|"
    + catTypeComments
    + "|"
    + catTypeName
    + "|"
    + catStructuralMaterial
    + "|"
    + catMaterial
)

# Split data into features (X) and target variable (y)
X = df["Features"].fillna(EMPTYCONST)
y = df["Category"]


# Custom tokenizer function with variable weights for different categories
def custom_tokenizer(
    text,
    weight_family=1,
    weight_subfamily=1,
    weight_objectname=1,
    weight_structuralmaterial=1,
    weight_material=1,
):
    # Tokenize the text
    tokens = text.split("|")

    # Assign weights to tokens based on hyperparameters
    weighted_tokens = []
    for token in tokens:
        if "_*family*" in token:
            weighted_tokens.extend([token] * weight_family)
        elif "_*subfamily*" in token:
            weighted_tokens.extend([token] * weight_subfamily)
        elif "_*objectname*" in token:
            weighted_tokens.extend([token] * weight_objectname)
        elif "_*structuralmaterial*" in token:
            weighted_tokens.extend([token] * weight_structuralmaterial)
        elif "_*material*" in token:
            weighted_tokens.extend([token] * weight_material)
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
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 2,
        "weight_objectname": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 4,
        "weight_objectname": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 3,
        "weight_objectname": 5,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 4,
        "weight_objectname": 5,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 3,
        "weight_objectname": 5,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 2,
        "weight_objectname": 6,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 6,
        "weight_subfamily": 2,
        "weight_objectname": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 6,
        "weight_objectname": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 6,
        "weight_objectname": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 6,
        "weight_objectname": 2,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 6,
        "weight_objectname": 5,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 5,
        "weight_objectname": 4,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 5,
        "weight_objectname": 3,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 3,
        "weight_objectname": 5,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 4,
        "weight_objectname": 6,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 4,
        "weight_objectname": 6,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 4,
        "weight_objectname": 7,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 5,
        "weight_objectname": 7,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 10,
        "weight_subfamily": 5,
        "weight_objectname": 7,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 8,
        "weight_subfamily": 4,
        "weight_objectname": 7,
        "weight_structuralmaterial": 2,
        "weight_material": 2,
    },
    {
        "weight_family": 20,
        "weight_subfamily": 10,
        "weight_objectname": 15,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 20,
        "weight_subfamily": 15,
        "weight_objectname": 10,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 20,
        "weight_subfamily": 10,
        "weight_objectname": 10,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
    {
        "weight_family": 20,
        "weight_subfamily": 15,
        "weight_objectname": 15,
        "weight_structuralmaterial": 3,
        "weight_material": 3,
    },
]

# Initialize a list to store top 5 token weights and their associated accuracies
top_token_weights = []

# Initialize a list to store mean cross-validation accuracies
mean_accuracies = []

# Initialize a list to store param_grids
param_grids = []
# Initialize lists to store top 5 and bottom 2 models
top_models = []
bottom_models = []

# Iterate over each set of weights
for weights in weights_to_test:
    print("Testing weights:", weights)
    # Vectorize text data using TF-IDF with custom tokenizer and the current set of weights
    vectorizer = TfidfVectorizer(
        tokenizer=lambda x: custom_tokenizer(x, **weights), token_pattern=None
    )
    X_tfidf = vectorizer.fit_transform(X)

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
    # cv = 3 for smaller datasets, cv = 5 for bigger
    grid_search = GridSearchCV(estimator=rf_classifier, param_grid=param_grid, cv=3)
    grid_search.fit(X_tfidf, y)

    # Get the best estimator from grid search
    best_estimator = grid_search.best_estimator_

    # Store best param_grid
    param_grids.append(grid_search.best_params_)

    # Evaluate the model using cross-validation
    cross_val_scores = cross_val_score(best_estimator, X_tfidf, y, cv=5)
    mean_accuracy = cross_val_scores.mean()
    mean_accuracies.append(mean_accuracy)

    # Store top 5 and bottom 2 token weights and their associated accuracies
    top_tokens = sorted(weights.items(), key=lambda x: x[1], reverse=True)[:5]
    bottom_tokens = sorted(weights.items(), key=lambda x: x[1], reverse=False)[:2]
    top_models.append((mean_accuracy, top_tokens, param_grid, best_estimator, vectorizer))
    bottom_models.append((mean_accuracy, bottom_tokens, param_grid, best_estimator, vectorizer))

    print("Weights:", weights)
    print("Mean Cross-Validation Accuracy:", mean_accuracy)
    print()
    
# Print top 5 models before saving
print("Top 5 Models:")
for idx, (accuracy, tokens, param_grid, best_estimator, vectorizer) in enumerate(top_models[:5], 1):
    print("Model", idx)
    print("Mean Cross-Validation Accuracy:", accuracy)
    print("Token Weights:")
    for token, weight in tokens:
        print("- {} (Weight: {})".format(token, weight))
    print("Param Grid:")
    print(param_grid)
    print()
    
# Save the top 5 models
for idx, (accuracy, tokens, param_grid, best_estimator, vectorizer) in enumerate(top_models[:5], 1):
    # Extract token weights from the model description
    tokens_str = "_".join(["{}_{}".format(token, weight) for token, weight in tokens])
    # Construct the filename based on token weights and param_grid
    filename = "top_model_{}_{}.pkl".format(idx, tokens_str)
    joblib.dump((best_estimator, vectorizer), filename)

# Save the bottom 2 models
for idx, (accuracy, tokens, param_grid, best_estimator, vectorizer) in enumerate(bottom_models[:2], 1):
    # Extract token weights from the model description
    tokens_str = "_".join(["{}_{}".format(token, weight) for token, weight in tokens])
    # Construct the filename based on token weights and param_grid
    filename = "bottom_model_{}_{}.pkl".format(idx, tokens_str)
    joblib.dump((best_estimator, vectorizer), filename)
