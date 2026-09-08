# AI, Machine Learning, Deep Learning & GenAI Curriculum Guide

> **Target Audience:** Students in Machine Learning, Deep Learning, and Generative AI  
> **Course Tracks:** Classical ML (Scikit-Learn), Deep Learning ANN & CNN (Keras), and Generative AI RAG (LangChain)  
> **Structure:** Progressive 2-tier roadmap (Beginner to Intermediate) with exact dataset links, architecture blueprints, and 6-chapter milestones.

---

## Executive Curriculum Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       THE 11-PROJECT AI CURRICULUM                                      │
├──────────────────────┬────────────────────────────────────────────┬─────────────────────────────────────┤
│ Track                │ 🟢 Beginner Projects                       │ 🟡 Intermediate Projects            │
├──────────────────────┼────────────────────────────────────────────┼─────────────────────────────────────┤
│ 1. Classical ML      │ • NASA Exoplanet Habitability Screener     │ • Customer Churn & Retention Pipeline│
│    (Scikit-Learn)    │ • California House Price Predictor         │ • Airline Flight Delay Forecaster   │
│                      │ • Credit Card Fraud Detection (Skewed Data)│                                     │
├──────────────────────┼────────────────────────────────────────────┼─────────────────────────────────────┤
│ 2. Deep Learning     │ • Diabetes Early Risk Screener (ANN)       │ • Chest X-Ray Pneumonia (Transfer)  │
│    (Keras / TF)      │ • Cats vs. Dogs Image Classifier (CNN)     │ • Skin Lesion Identifier (HAM10000) │
├──────────────────────┼────────────────────────────────────────────┼─────────────────────────────────────┤
│ 3. Generative AI     │ • AI Jokes & Riddle Generator (API/Prompts)│ • Multi-PDF Research Assistant (RAG)│
│    (LangChain / LLM) │                                            │                                     │
└──────────────────────┴────────────────────────────────────────────┴─────────────────────────────────────┘
```

---

# Part 1: Classical Machine Learning (Scikit-Learn)

---

## Project 1.1: 🪐 NASA Exoplanet Habitability Screener
* **Track:** Machine Learning | **Level:** 🟢 Beginner | **Type:** Binary Classification

### 1. Real-World Premise & What Students Build
Students analyze open telemetry from NASA's Kepler Space Telescope to classify whether distant planets discovered outside our solar system are located in the **Habitable "Goldilocks" Zone** (capable of sustaining liquid water) or are hostile, uninhabitable worlds.

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** NASA Kepler Exoplanet Search Results / Kepler KOI (Cumulative Table).
* **Source:** [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) or [Kaggle Kepler Exoplanet Dataset](https://www.kaggle.com/datasets/nasa/kepler-exoplanet-search-results).
* **Dataset Size:** ~9,500 planetary candidates, ~20 numerical columns.
* **Key Input Features:**
  * `koi_period`: Orbital period (in Earth days).
  * `koi_prad`: Planetary radius (relative to Earth).
  * `koi_teq`: Equilibrium surface temperature (Kelvin).
  * `koi_insol`: Insolation flux (solar energy received relative to Earth).
  * `koi_steff`: Host star effective temperature (Kelvin).
* **Target Variable:** `koi_disposition` (Filtered to: `CONFIRMED` / Habitable Candidate vs. `FALSE_POSITIVE`).

### 3. Core Concepts & Tech Stack
* **Libraries:** `scikit-learn`, `pandas`, `numpy`, `matplotlib`, `seaborn`.
* **Preprocessing:** Filtering non-numeric flags, handling missing telescope sensor readings with `SimpleImputer(strategy='median')`, feature scaling with `StandardScaler`.
* **Algorithms:** `LogisticRegression` (probabilistic baseline) and `KNeighborsClassifier` (distance-based classification).
* **Evaluation Metrics:** Confusion Matrix, Accuracy, Precision, and plotting 2D Decision Boundaries (Planetary Radius vs. Distance from Host Star).

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: Welcome to the Exoplanet Hunt:** Project hook, downloading NASA telemetry, verifying Python environment.
* **Chapter 2: The Goldilocks Zone Physics:** Exploring astronomical features and plotting planetary temperature distributions.
* **Chapter 3: Preprocessing Space Telemetry:** Handling missing values, scaling orbital features, creating 80/20 train/test splits.
* **Chapter 4: Training the Exoplanet Classifier:** Training `LogisticRegression` and understanding model odds ratios.
* **Chapter 5: Visualizing the Decision Boundary:** Plotting the 2D Goldilocks zone corridor where planets are classified as habitable.
* **Chapter 6: Reflect & Expand:** Testing with newly discovered exoplanets, adding `DecisionTreeClassifier` comparisons.

---

## Project 1.2: 🏠 California House Price Predictor
* **Track:** Machine Learning | **Level:** 🟢 Beginner | **Type:** Continuous Regression

### 1. Real-World Premise & What Students Build
Students act as real estate data scientists, building an end-to-end regression model that predicts the median cash value of California homes based on census district metrics (income, house age, room ratios, proximity to the coast).

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** California Housing Dataset.
* **Source:** Built directly into Scikit-Learn via `sklearn.datasets.fetch_california_housing` or [Kaggle California Housing](https://www.kaggle.com/datasets/camnugent/california-housing-prices).
* **Dataset Size:** 20,640 census block records, 8 numerical features.
* **Key Input Features:**
  * `MedInc`: Median income in block group.
  * `HouseAge`: Median house age in block.
  * `AveRooms`: Average number of rooms per household.
  * `AveBedrms`: Average number of bedrooms.
  * `Population`: Block group population.
  * `AveOccup`: Average household members.
  * `Latitude` & `Longitude`: Geographical location coordinates.
* **Target Variable:** `MedHouseVal`: Median home value (in hundreds of thousands of dollars).

### 3. Core Concepts & Tech Stack
* **Libraries:** `scikit-learn`, `pandas`, `numpy`, `matplotlib`.
* **Preprocessing:** Correlation analysis (`df.corr()`), feature scaling with `StandardScaler`.
* **Algorithms:** `LinearRegression` (interpretable baseline) and `Ridge` (regularized regression).
* **Evaluation Metrics:** Mean Absolute Error (MAE in actual dollars), Root Mean Squared Error (RMSE), and $R^2$ Score (variance explained).

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: The Real Estate Problem:** Introduction to housing economics, loading dataset from Scikit-Learn.
* **Chapter 2: Geospatial & Income Analysis:** Visualizing house prices on California latitude/longitude coordinates.
* **Chapter 3: Data Cleaning & Feature Scaling:** Why feature scaling is essential for gradient descent and regularized models.
* **Chapter 4: Fitting Linear & Ridge Models:** Training the models and inspecting coefficient weights (e.g., impact of median income).
* **Chapter 5: Evaluating Dollar Accuracy:** Computing MAE ($) and diagnosing where the model makes high errors.
* **Chapter 6: Reflect & Expand:** Adding polynomial features (`PolynomialFeatures`) to capture non-linear relationships.

---

## Project 1.3: 💳 Credit Card Fraud Detection (Skewed Data)
* **Track:** Machine Learning | **Level:** 🟢 Beginner / Intermediate | **Type:** Imbalanced Anomaly Classification

### 1. Real-World Premise & What Students Build
Students build a financial fraud filter that detects unauthorized credit card transactions in real time, confronting the reality of extreme class imbalance where only 0.17% of transactions are fraudulent.

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** Credit Card Fraud Detection Dataset (ULB Machine Learning Group).
* **Source:** [Kaggle Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud).
* **Dataset Size:** 284,807 transactions, 30 features (492 frauds = 0.172%).
* **Key Input Features:**
  * `Time`: Seconds elapsed between this transaction and the first transaction.
  * `Amount`: Transaction dollar amount.
  * `V1` through `V28`: Anonymized numerical features derived from PCA (Principal Component Analysis) to protect user identity.
* **Target Variable:** `Class` (0 = Legitimate, 1 = Fraudulent).

### 3. Core Concepts & Tech Stack
* **Libraries:** `scikit-learn`, `imbalanced-learn`, `pandas`, `seaborn`.
* **The Imbalance Trap:** Learning why a naive model predicting "All Legitimate" gets 99.8% accuracy but is completely useless.
* **Resampling & Weighting:** `RandomUnderSampler` vs. `class_weight='balanced'`.
* **Algorithms:** `LogisticRegression` and `RandomForestClassifier`.
* **Evaluation Metrics:** Precision-Recall AUC (`average_precision_score`), Confusion Matrix, Recall (catching maximum fraud), Precision (avoiding annoying real customers).

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: The Banking Dilemma:** The cost of fraud vs. customer friction; downloading the ULB dataset.
* **Chapter 2: The Accuracy Paradox:** Demonstrating how 99.8% accuracy fails completely on imbalanced data.
* **Chapter 3: Scaling Time & Amount:** Using `RobustScaler` on skewed dollar distributions.
* **Chapter 4: Balancing the Dataset:** Applying `class_weight='balanced'` and testing stratified train/test splits (`StratifiedKFold`).
* **Chapter 5: Precision vs. Recall Tradeoff:** Plotting Precision-Recall curves and tuning probability decision thresholds.
* **Chapter 6: Reflect & Expand:** Exporting the trained model with `joblib` and building a simulated transaction screener.

---

## Project 1.4: 📉 Customer Churn & Retention Pipeline
* **Track:** Machine Learning | **Level:** 🟡 Intermediate | **Type:** End-to-End Classification Pipeline

### 1. Real-World Premise & What Students Build
Students build a commercial customer retention engine for a telecom provider. The model flags subscribers at high risk of canceling their contracts so the retention team can offer targeted promotional incentives.

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** Telco Customer Churn Dataset (IBM Business Analytics).
* **Source:** [Kaggle Telco Customer Churn](https://www.kaggle.com/datasets/blastchar/telco-customer-churn).
* **Dataset Size:** 7,043 customer accounts, 21 mixed features.
* **Key Input Features:**
  * Categorical: `Contract` (Month-to-month, 1-year, 2-year), `PaymentMethod`, `TechSupport`, `InternetService`.
  * Numerical: `tenure` (months with company), `MonthlyCharges`, `TotalCharges` (contains blank strings needing conversion).
* **Target Variable:** `Churn` (`Yes` / `No`).

### 3. Core Concepts & Tech Stack
* **Libraries:** `scikit-learn`, `pandas`, `imbalanced-learn`.
* **Production Pipelines:** Using `ColumnTransformer` to pair `OneHotEncoder` for categories and `StandardScaler` for numbers.
* **Scikit-Learn Pipeline:** Wrapping transformations and models inside `Pipeline` objects to prevent data leakage during cross-validation.
* **Algorithms:** `RandomForestClassifier` and `HistGradientBoostingClassifier`.
* **Evaluation & Tuning:** `GridSearchCV` hyperparameter tuning, ROC-AUC score, and feature importance bar charts.

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: Customer Churn Economics:** Why keeping existing customers is 5x cheaper than acquiring new ones.
* **Chapter 2: Auditing Messy Data:** Fixing dirty strings in `TotalCharges` and analyzing categorical tenure rates.
* **Chapter 3: The Unified ColumnTransformer:** Building scikit-learn transformers that handle numbers and text in one pass.
* **Chapter 4: Building the Leak-Free Pipeline:** Chaining preprocessing and ensemble classifiers into a single `Pipeline`.
* **Chapter 5: Hyperparameter Tuning with GridSearch:** Optimizing tree depths, learning rates, and estimator counts.
* **Chapter 6: Reflect & Expand:** Extracting top 5 churn drivers (e.g., Month-to-month contracts + Fiber Optic without tech support).

---

## Project 1.5: ✈️ Airline Flight Delay Forecaster
* **Track:** Machine Learning | **Level:** 🟡 Intermediate | **Type:** Cyclical Time & High-Cardinality Classification

### 1. Real-World Premise & What Students Build
Students build a flight operations forecasting tool that predicts whether a scheduled commercial domestic flight will suffer a significant delay (>15 minutes) using seasonal, route, and scheduled departure data.

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** US Bureau of Transportation Statistics (BTS) Airline On-Time Performance.
* **Source:** [Kaggle Flight Delay Dataset (2015-2020)](https://www.kaggle.com/datasets/usdot/flight-delays) or [BTS Open Transportation Portal](https://www.transtats.bts.gov/).
* **Dataset Size:** Sampled subset of 100,000 to 250,000 flight records.
* **Key Input Features:**
  * `MONTH`, `DAY_OF_WEEK`: Calendar variables.
  * `SCHEDULED_DEPARTURE`: Departure time formatted as `HHMM` (0001 to 2359).
  * `AIRLINE` / `CARRIER`: Two-letter airline codes (AA, DL, UA, WN).
  * `ORIGIN_AIRPORT` & `DESTINATION_AIRPORT`: 3-letter IATA airport codes (high cardinality).
  * `DISTANCE`: Flight distance in miles.
* **Target Variable:** Binary flag `IS_DELAYED` (1 if `ARRIVAL_DELAY > 15` minutes, else 0).

### 3. Core Concepts & Tech Stack
* **Libraries:** `scikit-learn`, `pandas`, `numpy`, `seaborn`.
* **Cyclical Feature Engineering:** Converting scheduled departure hours into continuous wave signals using Sine and Cosine transformations ($\sin(2\pi \cdot \text{hour} / 24)$ and $\cos(2\pi \cdot \text{hour} / 24)$).
* **High-Cardinality Encoding:** Using `TargetEncoder` or frequency encoding on airport hubs to prevent memory explosion from hundreds of one-hot columns.
* **Algorithms:** `HistGradientBoostingClassifier` (optimized for large datasets) vs. `LogisticRegression`.
* **Evaluation:** ROC-AUC and Precision at Top 10% (can we reliably identify the 10% worst delayed flights?).

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: Aviation Scheduling Logistics:** Understanding flight delays, airspace bottlenecks, and the 15-minute standard.
* **Chapter 2: Cyclical Time Math:** Converting 11:59 PM and 12:01 AM from distant numbers into adjacent points on a circle.
* **Chapter 3: Encoding Airport Networks:** Applying `TargetEncoder` to handle 300+ airport destinations cleanly.
* **Chapter 4: Training Gradient Boosted Trees:** Fast training with `HistGradientBoostingClassifier` on large tabular batches.
* **Chapter 5: Evaluating Route Risk:** Analyzing which airports and departure windows carry the highest delay probabilities.
* **Chapter 6: Reflect & Expand:** Exporting the pipeline and testing on real-time flight schedules.

---

# Part 2: Deep Learning ANN & CNN (Keras)

---

## Project 2.1: 🩺 Diabetes Early Risk Screener (ANN)
* **Track:** Deep Learning (Keras) | **Level:** 🟢 Beginner | **Type:** Tabular Multi-Layer Perceptron (Binary)

### 1. Real-World Premise & What Students Build
Students build a deep neural network classifier that processes patient clinical records (glucose, insulin, body mass index, blood pressure) to output an early diagnostic risk probability for diabetes.

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** Pima Indians Diabetes Database.
* **Source:** [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/34/pima+indians+diabetes) or [Kaggle Pima Indians Diabetes](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database).
* **Dataset Size:** 768 patient records, 8 clinical measurement features.
* **Key Input Features:**
  * `Pregnancies`: Number of times pregnant.
  * `Glucose`: Plasma glucose concentration (2 hours in oral glucose tolerance test).
  * `BloodPressure`: Diastolic blood pressure (mm Hg).
  * `Insulin`: 2-Hour serum insulin (mu U/ml).
  * `BMI`: Body mass index (weight in kg / (height in m)$^2$).
  * `DiabetesPedigreeFunction`: Genetic pedigree score.
  * `Age`: Patient age in years.
* **Target Variable:** `Outcome` (0 = Healthy, 1 = Diabetic).

### 3. Core Concepts & Tech Stack
* **Framework:** `TensorFlow / Keras`, `scikit-learn`, `matplotlib`.
* **Data Cleaning:** Handling biological impossibilities (zero values in BloodPressure, Glucose, and BMI replaced by median).
* **Keras Architecture:**
  * Input layer with `StandardScaler` normalized data.
  * Hidden layers: `Dense(16, activation='relu')` followed by `Dense(8, activation='relu')`.
  * Output layer: `Dense(1, activation='sigmoid')` for probability output.
* **Loss & Optimizer:** `binary_crossentropy` with `Adam(learning_rate=0.001)`.
* **Diagnosis:** Plotting Training Loss vs. Validation Loss across epochs to inspect learning stability.

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: Deep Learning in Healthcare:** The role of neural networks in clinical screening; loading the dataset.
* **Chapter 2: Cleaning Clinical Data:** Imputing medically impossible zeros in glucose and BMI with median values.
* **Chapter 3: Architecting the Feedforward Network:** Defining layers, neurons, and the ReLU/Sigmoid activations in Keras.
* **Chapter 4: Compiling & Fitting the Model:** Understanding forward propagation, loss computation, backpropagation, and batch sizes.
* **Chapter 5: Diagnosing Training Curves:** Plotting loss curves to detect early signs of overfitting.
* **Chapter 6: Reflect & Expand:** Testing with custom patient measurements and adjusting probability classification thresholds.

---

## Project 2.2: 🐱🐶 Cats vs. Dogs Image Classifier (CNN)
* **Track:** Deep Learning (Keras) | **Level:** 🟢 Beginner | **Type:** Computer Vision / Binary CNN

### 1. Real-World Premise & What Students Build
Students enter computer vision by building a Convolutional Neural Network from scratch that processes raw, colorful pet photographs and accurately determines whether the animal pictured is a cat or a dog.

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** Microsoft Dogs vs. Cats Dataset.
* **Source:** [Kaggle Dogs vs Cats](https://www.kaggle.com/datasets/chetankv/dogs-cats-images) or `tensorflow_datasets` (`cats_vs_dogs`).
* **Dataset Size:** 25,000 labeled JPEG images (12,500 cats, 12,500 dogs); recommended to use a clean subset of 2,000–3,000 images for fast student training.
* **Image Dimensions:** Varied sizes, standardized to $150 \times 150 \times 3$ (RGB).
* **Target Variable:** Binary (0 = Cat, 1 = Dog).

### 3. Core Concepts & Tech Stack
* **Framework:** `TensorFlow / Keras`.
* **Data Ingestion:** Using `tf.keras.utils.image_dataset_from_directory` for memory-efficient streaming from disk.
* **Preprocessing:** Rescaling pixel values from $[0, 255]$ to $[0.0, 1.0]$ with `Rescaling(1./255)`.
* **CNN Architecture:**
  * 3 Convolutional Blocks: `Conv2D(32, (3,3), activation='relu')` $\rightarrow$ `MaxPooling2D(2,2)` $\rightarrow$ `Conv2D(64)` $\rightarrow$ `MaxPooling2D` $\rightarrow$ `Conv2D(128)` $\rightarrow$ `MaxPooling2D`.
  * Flattening layer: `Flatten()`.
  * Dense Head: `Dense(64, activation='relu')` followed by `Dense(1, activation='sigmoid')`.
* **Evaluation:** Accuracy, validation loss tracking, and visualizing sample predictions.

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: How Computers See Images:** Pixels, RGB channels, and why standard neural networks fail on high-res images.
* **Chapter 2: Streaming Images from Folders:** Setting up training/validation directory splits without loading everything into RAM.
* **Chapter 3: The Magic of Convolution & Pooling:** How $3\times3$ spatial filters extract edges, curves, and textures.
* **Chapter 4: Compiling & Training the CNN:** Monitoring training epochs and watching validation accuracy climb past 80%.
* **Chapter 5: Visualizing Predictions:** Writing a display function to show a grid of images labeled with predictions and confidence scores.
* **Chapter 6: Reflect & Expand:** Uploading personal photos of students' own pets to stress-test the model.

---

## Project 2.3: 🩻 Chest X-Ray Pneumonia Diagnostic (Transfer Learning)
* **Track:** Deep Learning (Keras) | **Level:** 🟡 Intermediate | **Type:** Medical Vision / Transfer Learning CNN

### 1. Real-World Premise & What Students Build
Students build a clinical imaging tool that inspects pediatric chest X-ray radiographs to detect signs of bacterial or viral pneumonia. Instead of training from scratch, students leverage an industry-standard pre-trained backbone (`MobileNetV2` or `ResNet50`).

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** Chest X-Ray Images (Pneumonia) by Paul Mooney.
* **Source:** [Kaggle Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia).
* **Dataset Size:** 5,863 JPEG X-ray radiographs across 2 categories (`NORMAL` vs. `PNEUMONIA`).
* **Image Specifications:** Grayscale radiographs converted to 3-channel RGB, resized to $224 \times 224 \times 3$.
* **Target Variable:** Binary (0 = Normal, 1 = Pneumonia).

### 3. Core Concepts & Tech Stack
* **Framework:** `TensorFlow / Keras`.
* **Transfer Learning Workflow:**
  * Loading a pre-trained ImageNet backbone: `MobileNetV2(weights='imagenet', include_top=False)`.
  * Freezing base weights (`base_model.trainable = False`).
  * Adding a custom classification head: `GlobalAveragePooling2D()` $\rightarrow$ `Dropout(0.3)` $\rightarrow$ `Dense(1, activation='sigmoid')`.
* **Two-Phase Training:**
  * Phase 1 (Feature Extraction): Train only the custom dense head (5 epochs).
  * Phase 2 (Fine-Tuning): Unfreeze the top 20 convolutional layers of the base model and train with a micro-learning rate ($10^{-5}$).
* **Evaluation:** Confusion Matrix, ROC-AUC score, sensitivity/recall focus.

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: AI in Radiology:** Overview of radiograph opacity, pneumonia symptoms, and the medical stakes of false negatives.
* **Chapter 2: Data Ingestion & Imbalance Check:** Loading radiograph datasets and handling the class ratio (3,800 Pneumonia vs. 1,300 Normal).
* **Chapter 3: The Power of Transfer Learning:** Why pre-trained ImageNet features (edges, textures, shapes) transfer to X-rays.
* **Chapter 4: Freezing & Head Training:** Freezing the backbone and training the custom `GlobalAveragePooling2D` classification head.
* **Chapter 5: Fine-Tuning the Deep Conv Layers:** Unfreezing the top layers with a $1e-5$ learning rate to achieve $>95\%$ accuracy.
* **Chapter 6: Reflect & Expand:** Evaluating medical false negatives and discussing AI ethical boundaries in clinical deployment.

---

## Project 2.4: 🔬 Skin Lesion Multi-Class Identifier (HAM10000)
* **Track:** Deep Learning (Keras) | **Level:** 🟡 Intermediate | **Type:** Dermatology Vision / Multi-Class CNN

### 1. Real-World Premise & What Students Build
Students build a dermatological diagnostic assistant that classifies close-up dermatoscopic skin lesion photographs across 7 distinct skin disease categories (including malignant Melanoma, Basal Cell Carcinoma, and benign Nevi).

### 2. Recommended Dataset & Data Specs
* **Dataset Name:** The HAM10000 Dataset ("Human Against Machine with 10,000 training images").
* **Source:** [Harvard Dataverse HAM10000](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/DBW86T) or [Kaggle Skin Cancer MNIST: HAM10000](https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000).
* **Dataset Size:** 10,015 dermatoscopic RGB images with a metadata CSV file.
* **The 7 Diagnostic Target Classes:**
  1. `MEL`: Melanoma (malignant)
  2. `NV`: Melanocytic nevi (benign moles)
  3. `BCC`: Basal cell carcinoma
  4. `AKIEC`: Actinic keratoses
  5. `BKL`: Benign keratosis-like lesions
  6. `DF`: Dermatofibroma
  7. `VASC`: Vascular lesions
* **Image Dimensions:** Standardized to $128 \times 128 \times 3$ or $224 \times 224 \times 3$.

### 3. Core Concepts & Tech Stack
* **Framework:** `TensorFlow / Keras`, `pandas`, `seaborn`.
* **Multi-Input Metadata Integration:** Pairing images with patient age and anatomical lesion site.
* **Data Augmentation:** Heavy augmentation (`RandomFlip`, `RandomRotation(0.3)`, `RandomZoom(0.2)`) to mitigate severe class imbalance (benign moles outnumber rare cancers 10:1).
* **Architecture:** Transfer Learning (`EfficientNetB0` or deep custom CNN) with `Dense(7, activation='softmax')`.
* **Loss & Metrics:** `categorical_crossentropy`, Top-1 Accuracy, Top-2 Accuracy, and per-class Recall heatmaps.

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: The ABCDEs of Dermatology:** Clinical characteristics of Melanoma vs. benign moles; loading the HAM10000 dataset.
* **Chapter 2: Resolving the Lesion Metadata CSV:** Linking image filenames with patient age, sex, and anatomical location.
* **Chapter 3: Aggressive Data Augmentation:** Using Keras preprocessing layers to multiply samples of rare malignant lesions.
* **Chapter 4: Architecting the 7-Class Softmax Network:** Compiling with categorical crossentropy and class weight adjustments.
* **Chapter 5: Evaluating Per-Class Sensitivity:** Generating a $7\times7$ confusion matrix heatmap to verify that Melanoma recall is high.
* **Chapter 6: Reflect & Expand:** Exporting the model to TensorFlow Lite (`TFLite`) for simulated mobile dermatology apps.

---

# Part 3: Generative AI & LangChain

---

## Project 3.1: 🎭 AI Jokes & Riddle Generator (Interactive LLM API)
* **Track:** Generative AI | **Level:** 🟢 Beginner | **Type:** Prompt Engineering & Interactive LLM Client

### 1. Real-World Premise & What Students Build
Students build an entertaining, interactive comedy and riddle generator that accepts user categories (Tech, Animals, Space, Coding), custom tones (Dad joke, Dark humor, Witty, Kid-friendly), and manages multi-stage dramatic reveals for punchlines.

### 2. Recommended Dataset & Data Specs
* **Dataset Requirement:** **None!** (Operates entirely via Foundation Model API calls).
* **API Providers:** OpenAI API (`gpt-4o-mini`), Anthropic Claude, or Google Gemini API.
* **Input Specifications:** User selections via interactive terminal CLI (`category`, `humor_style`, `difficulty_rating`).
* **Output Specifications:** Clean formatted text with separated setup and punchline.

### 3. Core Concepts & Tech Stack
* **Framework:** `LangChain` (or direct API client), Python `os` / `dotenv`.
* **Security:** Managing API keys securely via `.env` files and environment variables.
* **Prompt Engineering:**
  * System Messages: Establishing strict persona and humor constraints.
  * `PromptTemplate` / `ChatPromptTemplate`: Parameterized prompts with `{topic}` and `{style}` variables.
  * Few-Shot Prompting: Providing 2–3 exemplar jokes to teach the model clean timing and formatting.
* **Temperature & Top-P:** Experimenting with temperature settings ($0.2$ for predictable puns vs. $0.9$ for creative, unexpected punchlines).
* **Output Parsing:** `StrOutputParser` and separating the punchline with an interactive `input("Press Enter for the punchline...")` dramatic pause.

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: Hello, Generative AI!:** API keys, billing safety, setting up the `.env` file, and making the first 1-line completion.
* **Chapter 2: The Art of the Prompt Template:** Building parameterized prompt templates with dynamic user topic inputs.
* **Chapter 3: Controlling Creativity with Temperature:** Hands-on experiments comparing low temperature (deterministic) vs. high temperature (creative).
* **Chapter 4: Few-Shot Prompting Techniques:** Showing the model exemplars to enforce punchline timing and tone.
* **Chapter 5: The Interactive CLI Experience:** Building a clean terminal game loop with timed reveals and replay options.
* **Chapter 6: Reflect & Expand:** Adding an "AI Comedy Critic" chain that evaluates and scores user-submitted jokes.

---

## Project 3.2: 📚 Multi-PDF Research Assistant with Page Citations (RAG)
* **Track:** Generative AI | **Level:** 🟡 Intermediate | **Type:** Retrieval-Augmented Generation (RAG)

### 1. Real-World Premise & What Students Build
Students build an enterprise-grade academic research assistant that ingests multiple lengthy research papers, indexes their contents into a local vector database, and answers complex technical questions with exact source document and page number citations.

### 2. Recommended Dataset & Documents
* **Source Documents:** A collection of 3 to 5 open-access academic AI research papers (PDFs):
  1. *"Attention Is All You Need"* (Vaswani et al., Transformer architecture)
  2. *"BERT: Pre-training of Deep Bidirectional Transformers"* (Devlin et al.)
  3. *"RAG for Knowledge-Intensive NLP Tasks"* (Lewis et al.)
* **Document Volume:** ~50 to 80 pages of dense, technical, multi-column scientific text.

### 3. Core Concepts & Tech Stack
* **Frameworks:** `LangChain`, `ChromaDB` (or `FAISS`), `PyPDFLoader`, OpenAI / HuggingFace Embeddings.
* **The Full RAG Architecture Pipeline:**
  $$\text{PDFs} \longrightarrow \text{Chunking (Recursive)} \longrightarrow \text{Embeddings} \longrightarrow \text{Vector Store} \longrightarrow \text{Similarity Search} \longrightarrow \text{LLM Generation}$$
* **Chunking Strategy:** `RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)` with semantic separators (`\n\n`, `\n`, ` `).
* **Metadata Preservation:** Storing source file names and `page` metadata on every vector chunk.
* **Retrieval Chain:** Building modern LCEL chains with `create_stuff_documents_chain` and `create_retrieval_chain`.
* **Prompt Guardrails & Citations:** Enforcing strict grounding: *"If the answer cannot be found in the retrieved documents, state that you do not know. Every answer must conclude with exact page citations: [Source: DocumentName.pdf, Page X]"*.

### 4. Step-by-Step 6-Chapter Learning Roadmap
* **Chapter 1: The RAG Architecture:** Why LLMs hallucinate and how vector search provides an external library of facts.
* **Chapter 2: Parsing Multi-Column PDFs:** Ingesting academic PDFs with `PyPDFDirectoryLoader` and auditing extracted text.
* **Chapter 3: Strategic Text Chunking:** Why chunk size and overlap matter; breaking 80 pages into searchable paragraphs.
* **Chapter 4: Vectors, Embeddings & ChromaDB:** Converting text into 1,536-dimensional math vectors and saving the index to disk.
* **Chapter 5: Building the Citation Retrieval Chain:** Constructing the LangChain retrieval chain and enforcing exact page citations.
* **Chapter 6: Reflect & Expand:** Testing with complex cross-document comparison questions and building an interactive Q&A console.

---

# Summary Comparison Matrix

| # | Project Title | Track | Level | Primary Dataset / Source | Key Algorithm / Architecture |
|:---|:---|:---|:---|:---|:---|
| **1.1** | **NASA Exoplanet Screener** | ML | 🟢 Beginner | NASA Kepler KOI Archive | `LogisticRegression`, `KNN`, Decision Boundaries |
| **1.2** | **California House Prices** | ML | 🟢 Beginner | Scikit-Learn California Housing | `LinearRegression`, `Ridge`, MAE ($) |
| **1.3** | **Credit Card Fraud Detection** | ML | 🟢 Beginner | ULB Credit Card Fraud (Kaggle) | `RobustScaler`, `class_weight='balanced'`, PR-AUC |
| **1.4** | **Customer Churn Pipeline** | ML | 🟡 Intermediate | IBM Telco Churn (Kaggle) | `ColumnTransformer`, `Pipeline`, `RandomForest` |
| **1.5** | **Airline Flight Delay Forecaster** | ML | 🟡 Intermediate | US BTS Airline On-Time Data | Cyclical Sine/Cosine, `TargetEncoder`, `HistGBM` |
| **2.1** | **Diabetes Risk Screener** | DL (ANN) | 🟢 Beginner | Pima Indians Diabetes (UCI) | Keras `Dense`, `ReLU`, `Sigmoid`, Loss Curves |
| **2.2** | **Cats vs. Dogs Classifier** | DL (CNN) | 🟢 Beginner | Microsoft Dogs vs Cats (Kaggle) | `Conv2D`, `MaxPooling2D`, `Flatten`, Binary Crossentropy |
| **2.3** | **Chest X-Ray Pneumonia** | DL (CNN) | 🟡 Intermediate | Paul Mooney X-Rays (Kaggle) | Transfer Learning (`MobileNetV2`), Fine-Tuning |
| **2.4** | **Skin Lesion Identifier** | DL (CNN) | 🟡 Intermediate | HAM10000 Skin Lesions (Harvard) | 7-Class `Softmax`, Data Augmentation, Top-2 Accuracy |
| **3.1** | **AI Jokes & Riddle Generator**| GenAI | 🟢 Beginner | Live LLM APIs (OpenAI/Claude) | `PromptTemplate`, Few-Shot, Temperature Tuning |
| **3.2** | **Multi-PDF Research Assistant**| GenAI (RAG) | 🟡 Intermediate | Academic Papers (arXiv PDFs) | `ChromaDB`, `RecursiveCharacterTextSplitter`, Citations |
