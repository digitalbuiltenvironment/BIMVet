import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.model_selection import KFold
from sklearn.metrics import accuracy_score

# Load the dataset
data = pd.read_csv('mcoutput_old.csv')

# Handle missing values if any
data.replace("<By Category>", "*EMPTY*", inplace=True)
data.fillna("*EMPTY*", inplace=True)

# Convert categorical features to numerical values
label_encoders = {}
for column in data.columns:
    if data[column].dtype == 'object':
        label_encoders[column] = LabelEncoder()
        data[column] = label_encoders[column].fit_transform(data[column])

# Select features and target variable
X = data.drop('Category', axis=1)
y = data['Category']

# Normalize the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=32)
# Define a dictionary of hyperparameters to tune
train_score = {}
test_score = {}
n_neighbors = np.arange(1, 30, 1)
# for neighbor in n_neighbors:
#     knn = KNeighborsClassifier(n_neighbors=neighbor, weights='distance')
#     knn.fit(X_train, y_train)
#     train_score[neighbor]=knn.score(X_train, y_train)
#     test_score[neighbor]=knn.score(X_test, y_test)

# for key, value in test_score.items():
#     if value==max(test_score.values()):
#         print(key)
        
# Initialize GridSearchCV
parameter={'n_neighbors': np.arange(1, 30, 1), 'weights': ['uniform', 'distance']}
kf=KFold(n_splits=2,shuffle=True,random_state=32)
knn=KNeighborsClassifier()
knn_cv=GridSearchCV(knn, param_grid=parameter, cv=kf, verbose=1)
knn_cv.fit(X_train, y_train)
best_parameters=knn_cv.best_params_
print(best_parameters['n_neighbors'])

knn=KNeighborsClassifier(n_neighbors=best_parameters['n_neighbors'], weights='distance')
knn.fit(X_train, y_train)
y_pred=knn.predict(X_test)
accuracy_score=accuracy_score(y_test, y_pred)*100
print("Accuracy for testing dataset after tuning : {:.2f}%".format(accuracy_score))