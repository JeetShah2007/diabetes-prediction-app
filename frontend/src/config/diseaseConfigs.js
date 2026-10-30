// Each health check is driven entirely by one of these configs, so the
// same page component (HealthCheckPage) can render all three without
// duplicating layout code.
//
// Field types:
//   number  -> numeric input (optional min/max = plausible human limits)
//   select  -> dropdown with `options`
//   toggle  -> Yes/No buttons (stored as 1/0)
//   bmi     -> special-cased: renders Height(cm) + Weight(kg) inputs,
//              calculates BMI automatically, submits under this field's key
//
// `checklist` questions (symptoms / warning signs / background) do NOT go
// into the prediction model. They stay in the browser and only shape the
// "Next steps" advice and the emergency warning.

// Change this if you deploy outside India.
export const EMERGENCY_NUMBER = "112";

// Links shown on every page and on the home page.
// Always click-test links before publishing; sites move pages around.
export const COMMON_RESOURCES = [
  {
    label: "e-Sanjeevani",
    note: "Free video consultation with a government doctor",
    url: "https://esanjeevani.mohfw.gov.in/",
  },
  {
    label: "National Health Portal (India)",
    note: "Health information from the Government of India",
    url: "https://www.nhp.gov.in/",
  },
  {
    label: "Practo",
    note: "Find and book doctors near you (private service)",
    url: "https://www.practo.com/",
  },
];

export const DISEASES = {
  diabetes: {
    key: "diabetes",
    title: "Diabetes Check",
    topicName: "diabetes",
    tagline: "Estimate your diabetes risk from your health details and recent blood tests.",
    icon: "🩸",
    color: "#2f9e75",
    apiPath: "diabetes",
    fields: [
      { key: "gender", label: "Gender", shortLabel: "Gender", type: "select", options: ["Female", "Male", "Other"] },
      { key: "age", label: "Age (years)", shortLabel: "Age", type: "number", placeholder: "e.g. 45", min: 1, max: 120 },
      {
        key: "hypertension",
        label: "Has a doctor ever told you that you have high blood pressure (hypertension)?",
        shortLabel: "High blood pressure",
        type: "toggle",
      },
      {
        key: "heart_disease",
        label: "Has a doctor ever diagnosed a heart condition in you (such as a heart attack or blocked arteries)?",
        shortLabel: "Heart disease history",
        type: "toggle",
      },
      {
        key: "smoking", label: "Tobacco smoking history", shortLabel: "Smoking",
        type: "select",
        options: [
          { value: "never", label: "Never smoked" },
          { value: "former", label: "Used to smoke, now quit" },
          { value: "current", label: "Currently smoke" },
          { value: "unknown", label: "Prefer not to say" },
        ],
      },
      { key: "bmi", label: "Height & Weight", shortLabel: "BMI", type: "bmi" },
      {
        key: "HbA1c_level", label: "HbA1c (%)", shortLabel: "HbA1c",
        type: "number", placeholder: "e.g. 5.7", min: 3, max: 20,
        hint: "A blood test showing your average sugar over the last 2–3 months. Below 5.7% is normal; 5.7–6.4% is the pre-diabetes range; 6.5% or more suggests diabetes.",
      },
      {
        key: "blood_glucose_level", label: "Blood glucose (mg/dL)", shortLabel: "Blood glucose",
        type: "number", placeholder: "e.g. 110", min: 30, max: 600,
        hint: "Best taken fasting (no food for 8 hours). Normal fasting is below 100; 126 or more on repeat tests suggests diabetes.",
      },
    ],
    whyItMatters: {
      gender: "Risk patterns differ slightly between men and women.",
      age: "Risk tends to rise with age, especially after 45.",
      hypertension: "High blood pressure often occurs alongside diabetes and shares risk factors.",
      heart_disease: "Heart disease and diabetes are closely linked and often appear together.",
      smoking: "Smoking can make the body less responsive to insulin.",
      bmi: "Extra body weight, especially around the waist, is linked to insulin resistance.",
      HbA1c_level: "This is one of the clearest diabetes signals because it shows your average blood sugar over months, not just today.",
      blood_glucose_level: "A direct snapshot of how much sugar is in your blood.",
    },
    ranges: {
      HbA1c_level: { min: 3, max: 10, normalMin: 4, normalMax: 5.6, unit: "%" },
      blood_glucose_level: { min: 60, max: 300, normalMin: 70, normalMax: 99, unit: " mg/dL" },
      bmi: { min: 12, max: 45, normalMin: 18.5, normalMax: 24.9, unit: "" },
      age: { min: 1, max: 90, normalMin: null, normalMax: null, unit: " yrs" },
    },
    tips: [
      "Use your latest HbA1c and glucose reports if you have them. They make the biggest difference to accuracy.",
      "No recent test? Any diagnostic lab can do an HbA1c and fasting glucose test, usually without a prescription.",
      "\"Heart condition\" means ever diagnosed by a doctor, not necessarily current.",
    ],
    checklist: {
      emergency: {
        title: "Warning signs that need urgent care",
        intro: "Tick any that are happening right now.",
        items: [
          { id: "dka_breath", label: "Vomiting or stomach pain together with very fast breathing or fruity-smelling breath" },
          { id: "dka_confusion", label: "Confusion, extreme sleepiness or fainting" },
        ],
      },
      symptoms: {
        title: "Symptoms you may have noticed",
        items: [
          { id: "thirst", label: "Feeling very thirsty, or drinking much more water than usual" },
          { id: "urination", label: "Passing urine much more often than usual, especially at night" },
          { id: "weightloss", label: "Losing weight without trying" },
          { id: "vision", label: "Blurred vision" },
          { id: "healing", label: "Cuts or wounds that heal slowly, or frequent infections" },
          { id: "numbness", label: "Tingling, numbness or burning in the hands or feet" },
          { id: "fatigue", label: "Feeling unusually tired most of the time" },
        ],
      },
      history: {
        title: "Your background",
        items: [
          { id: "family", label: "A parent, brother or sister has diabetes" },
          { id: "gdm", label: "I had diabetes during pregnancy (gestational diabetes)" },
          { id: "cholesterol", label: "A doctor has told me I have high cholesterol or triglycerides" },
          { id: "inactive", label: "I get less than about 30 minutes of physical activity on most days" },
        ],
      },
    },
    testsToAsk: [
      "HbA1c blood test",
      "Fasting blood glucose",
      "Blood pressure check",
      "Lipid profile (cholesterol)",
    ],
    resources: [
      { label: "WHO: Diabetes", note: "Clear overview of types, symptoms and prevention", url: "https://www.who.int/news-room/fact-sheets/detail/diabetes" },
      { label: "NHS: Type 2 diabetes", note: "Symptoms, tests and treatment explained simply", url: "https://www.nhs.uk/conditions/type-2-diabetes/" },
      { label: "International Diabetes Federation", note: "Global diabetes information and support", url: "https://idf.org/" },
    ],
    samples: {
      higher: { gender: "Female", age: 67, hypertension: 1, heart_disease: 1, smoking: "former", height: 160, weight: 94, HbA1c_level: 6.6, blood_glucose_level: 160 },
      lower: { gender: "Male", age: 28, hypertension: 0, heart_disease: 0, smoking: "never", height: 175, weight: 70, HbA1c_level: 5.0, blood_glucose_level: 90 },
    },
    modelInfoNote: "Built from 100,000 patient records in a public dataset. It has not been tested in a clinic.",
  },

  heart: {
    key: "heart",
    title: "Heart Health Check",
    topicName: "heart health",
    tagline: "Estimate your heart disease risk from the details of a basic checkup.",
    icon: "❤️",
    color: "#d9486b",
    apiPath: "heart",
    fields: [
      { key: "age", label: "Age (years)", shortLabel: "Age", type: "number", placeholder: "e.g. 58", min: 1, max: 120 },
      { key: "sex", label: "Sex", shortLabel: "Sex", type: "select", options: ["Male", "Female"] },
      {
        key: "cp", label: "Which best describes any chest pain you have had?", shortLabel: "Chest pain type",
        type: "select",
        options: [
          { value: "typical angina", label: "Pressure or tightness brought on by effort or stress, eased by rest" },
          { value: "atypical angina", label: "Chest discomfort that only partly fits the above" },
          { value: "non-anginal", label: "Chest pain that doesn't seem to come from the heart" },
          { value: "asymptomatic", label: "I don't get chest pain" },
        ],
      },
      {
        key: "trestbps", label: "Resting blood pressure, upper number (mm Hg)", shortLabel: "Resting blood pressure",
        type: "number", placeholder: "e.g. 130", min: 70, max: 250,
        hint: "Measured after sitting quietly for 5 minutes. For a reading of 130/85, enter 130.",
      },
      {
        key: "chol", label: "Total cholesterol (mg/dL)", shortLabel: "Cholesterol",
        type: "number", placeholder: "e.g. 200", min: 80, max: 700,
        hint: "From a lipid profile blood test. Below 200 is considered desirable.",
      },
      {
        key: "fbs", label: "Was your fasting blood sugar above 120 mg/dL on a lab test?", shortLabel: "Fasting blood sugar",
        type: "toggle",
      },
      {
        key: "thalch", label: "Highest heart rate reached during exercise (beats per minute)", shortLabel: "Max heart rate",
        type: "number", placeholder: "e.g. 150", min: 30, max: 230,
        hint: "From a stress test or hard exercise; a fitness tracker works too. If unsure, 220 minus your age is a rough guide to the maximum.",
      },
      {
        key: "exang", label: "Does physical effort (stairs, brisk walking) bring on chest pain or tightness?", shortLabel: "Exercise chest pain",
        type: "toggle",
      },
    ],
    whyItMatters: {
      age: "Heart disease risk increases steadily with age.",
      sex: "Risk patterns differ somewhat between men and women, especially before menopause.",
      cp: "The type of chest discomfort is one of the strongest clues doctors use.",
      trestbps: "High resting blood pressure makes the heart work harder over time.",
      chol: "High cholesterol can build up in the arteries and block blood flow.",
      fbs: "High blood sugar is linked to higher cardiovascular risk.",
      thalch: "A low maximum heart rate during exertion can signal reduced heart capacity.",
      exang: "Chest pain triggered by effort is a classic sign doctors look for.",
    },
    ranges: {
      trestbps: { min: 80, max: 200, normalMin: 90, normalMax: 120, unit: " mmHg" },
      chol: { min: 100, max: 400, normalMin: 125, normalMax: 200, unit: " mg/dL" },
      thalch: { min: 60, max: 220, normalMin: null, normalMax: null, unit: " bpm" },
      age: { min: 1, max: 100, normalMin: null, normalMax: null, unit: " yrs" },
    },
    tips: [
      "Blood pressure and cholesterol are most accurate from a recent checkup or blood test.",
      "Max heart rate can come from a stress test or a fitness tracker during hard exercise.",
      "This check leaves out tests that need a cardiologist (like an ECG or angiogram), so a doctor's exam can find things it can't.",
    ],
    checklist: {
      emergency: {
        title: "Warning signs that need urgent care",
        intro: "Tick any that are happening right now.",
        items: [
          { id: "chest_now", label: "Chest pain, pressure or tightness that is happening now, lasts more than a few minutes, or comes on at rest" },
          { id: "pain_spread", label: "Pain spreading to the arm, shoulder, jaw, neck or back" },
          { id: "breath_sweat", label: "Sudden breathlessness with cold sweat, nausea or light-headedness" },
          { id: "fainting", label: "Fainting or nearly fainting" },
        ],
      },
      symptoms: {
        title: "Symptoms you may have noticed",
        items: [
          { id: "breath_effort", label: "Getting breathless with light effort, or when lying flat" },
          { id: "swelling", label: "Swelling in the ankles, feet or legs" },
          { id: "palpitations", label: "A racing, fluttering or irregular heartbeat" },
          { id: "dizzy", label: "Dizziness or light-headedness" },
          { id: "fatigue", label: "Unusual tiredness that limits everyday activity" },
        ],
      },
      history: {
        title: "Your background",
        items: [
          { id: "family", label: "A close relative had heart disease early (father or brother before 55, mother or sister before 65)" },
          { id: "diabetes", label: "I have diabetes" },
          { id: "cholesterol", label: "A doctor has told me I have high cholesterol" },
          { id: "tobacco", label: "I currently smoke or chew tobacco" },
          { id: "inactive", label: "I get little regular physical activity" },
        ],
      },
    },
    testsToAsk: [
      "ECG (electrocardiogram)",
      "Lipid profile (cholesterol)",
      "Blood pressure monitoring",
      "Fasting glucose or HbA1c",
      "Stress test or echocardiogram, if your doctor advises",
    ],
    resources: [
      { label: "WHO: Cardiovascular diseases", note: "What causes heart disease and how to prevent it", url: "https://www.who.int/health-topics/cardiovascular-diseases" },
      { label: "NHS: Coronary heart disease", note: "Symptoms, tests and treatment explained simply", url: "https://www.nhs.uk/conditions/coronary-heart-disease/" },
      { label: "American Heart Association", note: "Heart-healthy living, warning signs and guides", url: "https://www.heart.org/" },
    ],
    samples: {
      higher: { age: 67, sex: "Male", cp: "asymptomatic", trestbps: 160, chol: 286, fbs: 0, thalch: 108, exang: 1 },
      lower: { age: 29, sex: "Female", cp: "typical angina", trestbps: 110, chol: 180, fbs: 0, thalch: 172, exang: 0 },
    },
    modelInfoNote: "Built from 920 patient records in a public dataset. It has not been tested in a clinic.",
  },

  stroke: {
    key: "stroke",
    title: "Stroke Risk Check",
    topicName: "stroke",
    tagline: "Estimate your stroke risk from your health history and lifestyle.",
    icon: "🧠",
    color: "#5b63d3",
    apiPath: "stroke",
    fields: [
      { key: "gender", label: "Gender", shortLabel: "Gender", type: "select", options: ["Female", "Male", "Other"] },
      { key: "age", label: "Age (years)", shortLabel: "Age", type: "number", placeholder: "e.g. 67", min: 1, max: 120 },
      {
        key: "hypertension",
        label: "Has a doctor ever told you that you have high blood pressure (hypertension)?",
        shortLabel: "High blood pressure",
        type: "toggle",
      },
      {
        key: "heart_disease",
        label: "Has a doctor ever diagnosed a heart condition in you (such as a heart attack, heart failure or blocked arteries)?",
        shortLabel: "Heart disease history",
        type: "toggle",
      },
      {
        key: "ever_married", label: "Are you, or have you ever been, married?", shortLabel: "Marital history",
        type: "toggle",
        hint: "Included because the original data recorded it. It mostly reflects age and life stage, not a medical cause.",
      },
      {
        key: "avg_glucose_level", label: "Average blood glucose (mg/dL)", shortLabel: "Blood glucose",
        type: "number", placeholder: "e.g. 105", min: 30, max: 600,
        hint: "From a recent blood test, fasting or random. Normal fasting is below 100.",
      },
      { key: "bmi", label: "Height & Weight", shortLabel: "BMI", type: "bmi" },
      {
        key: "smoking_status", label: "Tobacco smoking history", shortLabel: "Smoking",
        type: "select",
        options: [
          { value: "never smoked", label: "Never smoked" },
          { value: "formerly smoked", label: "Used to smoke, now quit" },
          { value: "smokes", label: "Currently smoke" },
          { value: "Unknown", label: "Prefer not to say" },
        ],
      },
    ],
    whyItMatters: {
      gender: "Risk patterns differ slightly between men and women.",
      age: "Stroke risk rises sharply with age, especially past 55.",
      hypertension: "High blood pressure is the biggest controllable risk factor for stroke.",
      heart_disease: "Some heart conditions can send clots to the brain.",
      ever_married: "This mostly reflects age and life stage in the data, not a medical cause.",
      avg_glucose_level: "High blood sugar can damage blood vessels over time.",
      bmi: "Extra body weight is linked to high blood pressure and diabetes, both stroke risks.",
      smoking_status: "Smoking damages blood vessels and makes clots more likely.",
    },
    ranges: {
      avg_glucose_level: { min: 50, max: 300, normalMin: 70, normalMax: 99, unit: " mg/dL" },
      bmi: { min: 12, max: 45, normalMin: 18.5, normalMax: 24.9, unit: "" },
      age: { min: 1, max: 100, normalMin: null, normalMax: null, unit: " yrs" },
    },
    tips: [
      "This check leans toward caution. It flags more people as higher risk than will actually have a stroke, because missing a real case matters more than a false alarm.",
      "Stroke is hard to predict from basic details alone. Treat a higher result as a nudge to get your blood pressure and heart checked.",
      "Any sudden stroke warning sign is an emergency. Don't use this check; call for help.",
    ],
    checklist: {
      emergency: {
        title: "Stroke warning signs: call for help immediately",
        intro: "Tick any that are happening now, or happened recently and then went away.",
        items: [
          { id: "face", label: "One side of the face is drooping, or I can't smile evenly" },
          { id: "arm", label: "Weakness or numbness in one arm or leg" },
          { id: "speech", label: "Slurred speech, trouble speaking, or trouble understanding others" },
          { id: "vision", label: "Sudden loss of vision or double vision" },
          { id: "balance", label: "Sudden dizziness, loss of balance or trouble walking" },
          { id: "headache", label: "A sudden, very severe headache with no known cause" },
          { id: "passed", label: "One of these signs happened earlier but went away on its own" },
        ],
      },
      history: {
        title: "Your background",
        items: [
          { id: "prev", label: "I have had a stroke or a \"mini-stroke\" (TIA) before" },
          { id: "afib", label: "A doctor has told me I have an irregular heartbeat (atrial fibrillation)" },
          { id: "family", label: "A parent, brother or sister has had a stroke" },
          { id: "diabetes", label: "I have diabetes" },
          { id: "cholesterol", label: "A doctor has told me I have high cholesterol" },
          { id: "alcohol", label: "I drink alcohol most days or in large amounts" },
          { id: "inactive", label: "I get little regular physical activity" },
        ],
      },
    },
    testsToAsk: [
      "Regular blood pressure monitoring",
      "ECG to check for an irregular heartbeat",
      "Lipid profile and blood glucose",
      "Carotid artery ultrasound, if your doctor advises",
    ],
    resources: [
      { label: "NHS: Stroke symptoms", note: "How to spot a stroke with the FAST check", url: "https://www.nhs.uk/conditions/stroke/symptoms/" },
      { label: "World Stroke Organization", note: "Stroke information and prevention", url: "https://www.world-stroke.org/" },
      { label: "American Stroke Association", note: "Warning signs, risk factors and recovery", url: "https://www.stroke.org/" },
    ],
    samples: {
      higher: { gender: "Male", age: 67, hypertension: 0, heart_disease: 1, ever_married: 1, avg_glucose_level: 228.69, height: 165, weight: 100, smoking_status: "formerly smoked" },
      lower: { gender: "Female", age: 25, hypertension: 0, heart_disease: 0, ever_married: 0, avg_glucose_level: 90, height: 165, weight: 60, smoking_status: "never smoked" },
    },
    modelInfoNote: "Built from 5,110 patient records in a public dataset. It has not been tested in a clinic.",
  },
};

export const DISEASE_LIST = Object.values(DISEASES);