import pandas as pd
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load data
df = pd.read_csv('mcoutput.csv')
EMPTYCONST = '*empty*'

# Concatenate relevant text features
catFamily = df['Family'].fillna(EMPTYCONST).apply(lambda x: x + '_*family*' if x != EMPTYCONST else x)
catSubFamily = df['SubFamily'].fillna(EMPTYCONST).apply(lambda x: x + '_*subfamily*' if x != EMPTYCONST else x)
catObjectGroup = df['ObjectGroup'].fillna(EMPTYCONST)
catObjectName = df['ObjectName'].fillna(EMPTYCONST).apply(lambda x: x + '_*objectname*' if x != EMPTYCONST else x)
catAssemblyCode = df['Assembly Code'].fillna(EMPTYCONST)
catAssemblyDescription = df['Assembly Description'].fillna(EMPTYCONST)
catDescription = df['Description'].fillna(EMPTYCONST)
catTypeComments = df['Type Comments'].fillna(EMPTYCONST)
catTypeName = df['Type Name'].fillna(EMPTYCONST)
catStructuralMaterial = df['Structural Material'].fillna(EMPTYCONST).apply(lambda x: x + '_*structuralmaterial*' if x != EMPTYCONST else x)
catMaterial = df['Material'].fillna(EMPTYCONST).apply(lambda x: x + '_*material*' if x != EMPTYCONST else x)


df['Features'] = catFamily+'|'+catSubFamily+'|'+catObjectGroup+'|'+catObjectName+'|'+catAssemblyCode+'|'+catAssemblyDescription+'|'+catDescription+'|'+catTypeComments+'|'+catTypeName+'|'+catStructuralMaterial+'|'+catMaterial

# Split data into features (X) and target variable (y)
X = df['Features'].fillna(EMPTYCONST)
y = df['Category']

# Custom tokenizer function with variable weights for different categories
def custom_tokenizer(text, weight_family=1, weight_subfamily=1, weight_objectname=1, weight_structuralmaterial=1, weight_material=1):
    # Tokenize the text
    tokens = text.split('|')
    
    # Assign weights to tokens based on hyperparameters
    weighted_tokens = []
    for token in tokens:
        if '_*family*' in token:
            weighted_tokens.extend([token] * weight_family)
        elif '_*subfamily*' in token:
            weighted_tokens.extend([token] * weight_subfamily)
        elif '_*objectname*' in token:
            weighted_tokens.extend([token] * weight_objectname)
        elif '_*structuralmaterial*' in token:
            weighted_tokens.extend([token] * weight_structuralmaterial)
        elif '_*material*' in token:
            weighted_tokens.extend([token] * weight_material)
        elif token == EMPTYCONST:
            weighted_tokens.extend([token] * 0)  # Assigning a 0 weight for 'empty'
        else:
            weighted_tokens.append(token)
    
    return weighted_tokens

# Define a list of weights to test
weights_to_test = [
    {'weight_family': 8, 'weight_subfamily': 2, 'weight_objectname': 4, 'weight_structuralmaterial': 3, 'weight_material': 3},
    {'weight_family': 8, 'weight_subfamily': 2, 'weight_objectname': 4, 'weight_structuralmaterial': 2, 'weight_material': 2},
    {'weight_family': 8, 'weight_subfamily': 4, 'weight_objectname': 4, 'weight_structuralmaterial': 2, 'weight_material': 2},
    {'weight_family': 10, 'weight_subfamily': 3, 'weight_objectname': 5, 'weight_structuralmaterial': 2, 'weight_material': 2},
    {'weight_family': 8, 'weight_subfamily': 4, 'weight_objectname': 5, 'weight_structuralmaterial': 3, 'weight_material': 3},
    {'weight_family': 8, 'weight_subfamily': 3, 'weight_objectname': 5, 'weight_structuralmaterial': 3, 'weight_material': 3},
    {'weight_family': 10, 'weight_subfamily': 2, 'weight_objectname': 6, 'weight_structuralmaterial': 2, 'weight_material': 2},
    {'weight_family': 6, 'weight_subfamily': 2, 'weight_objectname': 4, 'weight_structuralmaterial': 2, 'weight_material': 2},
    # Add more sets of weights as needed
]

# Initialize a list to store top 5 token weights and their associated accuracies
top_token_weights = []

# Initialize a list to store mean cross-validation accuracies
mean_accuracies = []

# Iterate over each set of weights
for weights in weights_to_test:
    # Vectorize text data using TF-IDF with custom tokenizer and the current set of weights
    vectorizer = TfidfVectorizer(tokenizer=lambda x: custom_tokenizer(x, **weights))
    X_tfidf = vectorizer.fit_transform(X)

    # Initialize Random Forest classifier
    rf_classifier = RandomForestClassifier(random_state=42)

    # Define hyperparameters grid for tuning
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
    }

    # Perform grid search with cross-validation
    grid_search = GridSearchCV(estimator=rf_classifier, param_grid=param_grid, cv=5)
    grid_search.fit(X_tfidf, y)

    # Get the best estimator from grid search
    best_estimator = grid_search.best_estimator_

    # Evaluate the model using cross-validation
    cross_val_scores = cross_val_score(best_estimator, X_tfidf, y, cv=5)
    mean_accuracy = cross_val_scores.mean()
    mean_accuracies.append(mean_accuracy)

    # Store top 5 token weights and their associated accuracies
    top_tokens = sorted(weights.items(), key=lambda x: x[1], reverse=True)[:5]
    top_token_weights.append((top_tokens, mean_accuracy))

    print("Weights:", weights)
    print("Mean Cross-Validation Accuracy:", mean_accuracy)
    print()

sorted_results = sorted(zip(mean_accuracies, top_token_weights), reverse=True)

# Print only the top 5 most accurate models
print("Top 5 Most Accurate Models:")
for idx, (accuracy, (tokens, _)) in enumerate(sorted_results[:5], 1):
    print("Top Tokens (Weight, Accuracy) for Model {}:".format(idx))
    for token, weight in tokens:
        print("- {} (Weight: {})".format(token, weight))
    print("Mean Cross-Validation Accuracy:", accuracy)
    print()

# Print mean cross-validation accuracies for all sets of weights
print("Mean Cross-Validation Accuracies:", mean_accuracies)

# Print param_grid
print("param_grid:", param_grid)
