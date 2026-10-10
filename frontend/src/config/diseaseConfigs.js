// Each health check is driven entirely by one of these configs, so the
// same page component (HealthCheckPage) can render all three without
// duplicating layout code.
//
// Field types:
//   number  -> plain numeric input
//   select  -> dropdown with `options`
//   toggle  -> Yes/No buttons (stored as 1/0)
//   bmi     -> special-cased: renders Height(cm) + Weight(kg) inputs,
//              calculates BMI automatically, submits as `bmiFieldKey`

export const DISEASES = {
  diabetes: {
    key: "diabetes",
    title: "Diabetes Check",
    tagline: "A quick estimate of diabetes risk from basic health details.",
    icon: "🩸",
    color: "#2f9e75",
    apiPath: "diabetes",
    fields: [
      { key: "gender", label: "Gender", type: "select", options: ["Female", "Male", "Other"] },
      { key: "age", label: "Age (years)", type: "number", placeholder: "e.g. 45" },
      { key: "hypertension", label: "Do you have high blood pressure?", type: "toggle" },
      { key: "heart_disease", label: "Any history of heart disease?", type: "toggle" },
      {
        key: "smoking", label: "Smoking history", type: "select",
        options: [
          { value: "never", label: "Never smoked" },
          { value: "former", label: "Used to, but quit" },
          { value: "current", label: "Currently smoke" },
          { value: "unknown", label: "Prefer not to say" },
        ],
      },
      { key: "bmi", label: "Height & Weight", type: "bmi" },
      {
        key: "HbA1c_level", label: "HbA1c level (%)", type: "number", placeholder: "e.g. 5.7",
        hint: "From a recent blood test, if you have one",
      },
      {
        key: "blood_glucose_level", label: "Blood glucose (mg/dL)", type: "number", placeholder: "e.g. 120",
        hint: "A recent fasting or random reading",
      },
    ],
    whyItMatters: {
      age: "Risk tends to rise with age, especially after 45.",
      hypertension: "High blood pressure often occurs alongside diabetes and shares risk factors.",
      heart_disease: "A history of heart disease is linked to how the body manages blood sugar.",
      smoking: "Smoking can affect how the body responds to insulin.",
      bmi: "A higher body mass index is linked to insulin resistance.",
      HbA1c_level: "This measures average blood sugar over the past 2-3 months — one of the clearest diabetes signals.",
      blood_glucose_level: "A direct snapshot of how much sugar is in your blood right now.",
    },
    ranges: {
      HbA1c_level: { min: 3, max: 10, normalMin: 4, normalMax: 5.6, unit: "%" },
      blood_glucose_level: { min: 60, max: 300, normalMin: 70, normalMax: 99, unit: " mg/dL" },
      bmi: { min: 12, max: 45, normalMin: 18.5, normalMax: 24.9, unit: "" },
      age: { min: 1, max: 90, normalMin: null, normalMax: null, unit: " yrs" },
    },
    tips: [
      "Use your most recent HbA1c and glucose readings if you have them — they make the biggest difference to accuracy.",
      "If you don't have lab values handy, leave your best estimate; the tool still works with approximate numbers.",
      "\"Heart disease history\" means ever diagnosed, not necessarily current.",
    ],
    samples: {
      higher: { gender: "Female", age: 67, hypertension: 1, heart_disease: 1, smoking: "former", height: 160, weight: 94, HbA1c_level: 6.6, blood_glucose_level: 160 },
      lower: { gender: "Male", age: 28, hypertension: 0, heart_disease: 0, smoking: "never", height: 175, weight: 70, HbA1c_level: 5.0, blood_glucose_level: 90 },
    },
    modelInfoNote: "Trained on 100,000 patient records.",
  },

  heart: {
    key: "heart",
    title: "Heart Health Check",
    tagline: "A quick estimate of heart disease risk from a basic checkup's worth of details.",
    icon: "❤️",
    color: "#d9486b",
    apiPath: "heart",
    fields: [
      { key: "age", label: "Age (years)", type: "number", placeholder: "e.g. 58" },
      { key: "sex", label: "Sex", type: "select", options: ["Male", "Female"] },
      {
        key: "cp", label: "Chest pain type", type: "select",
        options: [
          { value: "typical angina", label: "Typical chest pain during exertion" },
          { value: "atypical angina", label: "Unusual chest discomfort" },
          { value: "non-anginal", label: "Chest pain not heart-related" },
          { value: "asymptomatic", label: "No chest pain" },
        ],
      },
      { key: "trestbps", label: "Resting blood pressure (systolic)", type: "number", placeholder: "e.g. 130" },
      { key: "chol", label: "Cholesterol (mg/dL)", type: "number", placeholder: "e.g. 220", hint: "From a recent blood test, if you have one" },
      { key: "fbs", label: "Is your fasting blood sugar over 120 mg/dL?", type: "toggle" },
      { key: "thalch", label: "Max heart rate (during exercise/activity)", type: "number", placeholder: "e.g. 150" },
      { key: "exang", label: "Does exercise ever bring on chest pain?", type: "toggle" },
    ],
    whyItMatters: {
      age: "Heart disease risk increases steadily with age.",
      sex: "Risk patterns differ somewhat between men and women, especially before menopause.",
      cp: "The type of chest discomfort is one of the strongest clues doctors use.",
      trestbps: "High resting blood pressure makes the heart work harder over time.",
      chol: "High cholesterol contributes to blocked arteries.",
      fbs: "High blood sugar is linked to higher cardiovascular risk.",
      thalch: "A lower max heart rate under exertion can signal reduced heart capacity.",
      exang: "Chest pain triggered by exercise is a classic sign doctors look for.",
    },
    ranges: {
      trestbps: { min: 80, max: 200, normalMin: 90, normalMax: 120, unit: " mmHg" },
      chol: { min: 100, max: 400, normalMin: 125, normalMax: 200, unit: " mg/dL" },
      thalch: { min: 60, max: 220, normalMin: null, normalMax: null, unit: " bpm" },
      age: { min: 1, max: 100, normalMin: null, normalMax: null, unit: " yrs" },
    },
    tips: [
      "Resting blood pressure and cholesterol are most accurate from a recent checkup or blood test.",
      "Max heart rate can come from a fitness tracker, treadmill test, or your own estimate during exercise.",
      "This model deliberately skips a few lab tests (like ECG results) that need a cardiologist visit to get.",
    ],
    samples: {
      higher: { age: 67, sex: "Male", cp: "asymptomatic", trestbps: 160, chol: 286, fbs: 0, thalch: 108, exang: 1 },
      lower: { age: 29, sex: "Female", cp: "typical angina", trestbps: 110, chol: 180, fbs: 0, thalch: 172, exang: 0 },
    },
    modelInfoNote: "Trained on 920 patient records across 4 hospitals.",
  },

  stroke: {
    key: "stroke",
    title: "Stroke Risk Check",
    tagline: "A quick estimate of stroke risk from lifestyle and basic health details.",
    icon: "🧠",
    color: "#5b63d3",
    apiPath: "stroke",
    fields: [
      { key: "gender", label: "Gender", type: "select", options: ["Female", "Male", "Other"] },
      { key: "age", label: "Age (years)", type: "number", placeholder: "e.g. 67" },
      { key: "hypertension", label: "Do you have high blood pressure?", type: "toggle" },
      { key: "heart_disease", label: "Any history of heart disease?", type: "toggle" },
      { key: "ever_married", label: "Have you ever been married?", type: "toggle" },
      { key: "avg_glucose_level", label: "Average glucose level (mg/dL)", type: "number", placeholder: "e.g. 120" },
      { key: "bmi", label: "Height & Weight", type: "bmi" },
      {
        key: "smoking_status", label: "Smoking history", type: "select",
        options: [
          { value: "never smoked", label: "Never smoked" },
          { value: "formerly smoked", label: "Used to, but quit" },
          { value: "smokes", label: "Currently smoke" },
          { value: "Unknown", label: "Prefer not to say" },
        ],
      },
    ],
    whyItMatters: {
      age: "Stroke risk rises sharply with age, especially past 55.",
      hypertension: "High blood pressure is the single biggest controllable stroke risk factor.",
      heart_disease: "Certain heart conditions increase the chance of clots that can cause a stroke.",
      ever_married: "This reflects broader lifestyle patterns in the data rather than marriage itself causing risk.",
      avg_glucose_level: "High blood sugar can damage blood vessels over time.",
      bmi: "Higher BMI is linked to several stroke risk factors like blood pressure.",
      smoking_status: "Smoking damages blood vessels and raises clotting risk.",
    },
    ranges: {
      avg_glucose_level: { min: 50, max: 300, normalMin: 70, normalMax: 99, unit: " mg/dL" },
      bmi: { min: 12, max: 45, normalMin: 18.5, normalMax: 24.9, unit: "" },
      age: { min: 1, max: 100, normalMin: null, normalMax: null, unit: " yrs" },
    },
    tips: [
      "This model errs toward caution — it flags more people as elevated-risk than will actually have a stroke, since missing a real case matters more than a false alarm.",
      "Stroke risk from lifestyle data alone is inherently hard to predict precisely — treat this as a nudge to get checked, not a diagnosis.",
      "\"Ever married\" reflects a pattern in the training data's population, not a direct medical cause.",
    ],
    samples: {
      higher: { gender: "Male", age: 67, hypertension: 0, heart_disease: 1, ever_married: 1, avg_glucose_level: 228.69, height: 165, weight: 100, smoking_status: "formerly smoked" },
      lower: { gender: "Female", age: 25, hypertension: 0, heart_disease: 0, ever_married: 0, avg_glucose_level: 90, height: 165, weight: 60, smoking_status: "never smoked" },
    },
    modelInfoNote: "Trained on 5,110 patient records.",
  },
};

export const DISEASE_LIST = Object.values(DISEASES);
