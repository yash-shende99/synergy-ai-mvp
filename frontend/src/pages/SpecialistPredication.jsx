import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../context/AppContext";
import { useContext } from 'react';

function SpecialistPredication() {
    // Disease severity mapping
    const diseaseSeverity = {
        'Fungal infection': 'low',
        'Allergy': 'low',
        'GERD': 'low',
        'Chronic cholestasis': 'medium',
        'Drug Reaction': 'medium',
        'Peptic ulcer diseae': 'medium',
        'AIDS': 'high',
        'Diabetes': 'medium',
        'Gastroenteritis': 'medium',
        'Bronchial Asthma': 'high',
        'Hypertension': 'high',
        'Migraine': 'low',
        'Cervical spondylosis': 'low',
        'Paralysis (brain hemorrhage)': 'emergency',
        'Jaundice': 'high',
        'Malaria': 'high',
        'Chicken pox': 'medium',
        'Dengue': 'high',
        'Typhoid': 'high',
        'hepatitis A': 'high',
        'Hepatitis B': 'high',
        'Hepatitis C': 'high',
        'Hepatitis D': 'high',
        'Hepatitis E': 'high',
        'Alcoholic hepatitis': 'high',
        'Tuberculosis': 'high',
        'Common Cold': 'low',
        'Pneumonia': 'high',
        'Dimorphic hemmorhoids(piles)': 'low',
        'Heart attack': 'emergency',
        'Varicose veins': 'low',
        'Hypothyroidism': 'medium',
        'Hyperthyroidism': 'medium',
        'Hypoglycemia': 'high',
        'Osteoarthristis': 'low',
        'Arthritis': 'low',
        '(vertigo) Paroymsal Positional Vertigo': 'low',
        'Acne': 'low',
        'Urinary tract infection': 'medium',
        'Psoriasis': 'low',
        'Impetigo': 'low'
    };

    // Full symptom list
    const { ml_url } = useContext(AppContext);

    const allSymptoms = [
        'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing',
        'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity',
        'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition',
        'spotting_ urination', 'fatigue', 'weight_gain', 'anxiety',
        'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
        'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough',
        'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration',
        'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea',
        'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation',
        'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
        'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload',
        'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise',
        'blurred_and_distorted_vision', 'phlegm', 'throat_irritation',
        'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion',
        'chest_pain', 'weakness_in_limbs', 'fast_heart_rate',
        'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool',
        'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising',
        'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes',
        'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
        'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips',
        'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness',
        'stiff_neck', 'swelling_joints', 'movement_stiffness', 'spinning_movements',
        'loss_of_balance', 'unsteadiness', 'weakness_of_one_body_side',
        'loss_of_smell', 'bladder_discomfort', 'foul_smell_of urine',
        'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching',
        'toxic_look_(typhos)', 'depression', 'irritability', 'muscle_pain',
        'altered_sensorium', 'red_spots_over_body', 'belly_pain',
        'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes',
        'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum',
        'rusty_sputum', 'lack_of_concentration', 'visual_disturbances',
        'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma',
        'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption',
        'fluid_overload.1', 'blood_in_sputum', 'prominent_veins_on_calf',
        'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads',
        'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails',
        'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
    ];

    const navigate = useNavigate();

    // Format symptom names for display
    const formatSymptomName = (symptom) => {
        return symptom
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())
            .replace(/\b(Of|And|In)\b/g, char => char.toLowerCase());
    };

    // Component state
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Filter symptoms based on search input
    const filteredSymptoms = allSymptoms.filter(symptom =>
        formatSymptomName(symptom).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add symptom to selection
    const handleAddSymptom = (symptom) => {
        if (!selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
            setSearchTerm('');
            setError(null);
        }
    };

    // Remove symptom from selection
    const handleRemoveSymptom = (symptom) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        setPrediction(null);
    };

    // Clear all selections
    const clearAll = () => {
        setSelectedSymptoms([]);
        setPrediction(null);
        setError(null);
    };

    // Predict specialist and disease
    const predict = async () => {
        if (selectedSymptoms.length < 3) {
            setError("Please select at least 3 symptoms for accurate prediction");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${ml_url}/predict`, {
                symptoms: selectedSymptoms
            });
            
            // Add severity to the prediction
            const predictionWithSeverity = {
                ...response.data,
                severity: diseaseSeverity[response.data.diagnosis.primary_prediction] || 'medium'
            };
            
            setPrediction(predictionWithSeverity);
        } catch (err) {
            console.error("Error:", err);
            setError(err.response?.data?.message || "Failed to get prediction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Get severity color and label
    const getSeverityInfo = (severity) => {
        switch (severity) {
            case 'emergency':
                return { color: 'bg-red-600', label: 'Emergency', icon: '🚨' };
            case 'high':
                return { color: 'bg-orange-500', label: 'High', icon: '⚠️' };
            case 'medium':
                return { color: 'bg-yellow-500', label: 'Medium', icon: 'ℹ️' };
            case 'low':
                return { color: 'bg-green-500', label: 'Low', icon: '✅' };
            default:
                return { color: 'bg-gray-500', label: 'Unknown', icon: '❓' };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <h1 className="text-2xl md:text-3xl font-bold text-center">
                        Medical Diagnosis & Specialist Predictor
                    </h1>
                    <p className="text-center text-blue-100 mt-2">
                        Select at least 3 symptoms to get diagnosis and specialist recommendation
                    </p>
                </div>

                <div className="p-6">
                    {/* Symptom Search */}
                    <div className="mb-6 relative">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Search Symptoms:
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                placeholder="Type to search symptoms..."
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Search dropdown */}
                        {(isSearchFocused || searchTerm) && filteredSymptoms.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-all duration-200">
                                {filteredSymptoms.map((symptom) => (
                                    <div
                                        key={symptom}
                                        onClick={() => handleAddSymptom(symptom)}
                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 flex items-center"
                                    >
                                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        {formatSymptomName(symptom)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Symptoms */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-700">
                                Selected Symptoms:
                                <span className={`ml-2 text-sm font-medium ${selectedSymptoms.length < 3 ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                    ({selectedSymptoms.length}/3 minimum)
                                </span>
                            </h2>
                            {selectedSymptoms.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-sm text-red-500 hover:text-red-700 flex items-center"
                                >
                                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Clear All
                                </button>
                            )}
                        </div>

                        {selectedSymptoms.length === 0 ? (
                            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                                No symptoms selected yet. Search above to add symptoms.
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedSymptoms.map((symptom) => (
                                    <div
                                        key={symptom}
                                        className={`bg-blue-100 text-blue-800 px-3 py-2 rounded-full flex items-center animate-fade-in ${selectedSymptoms.length < 3 ? 'border border-yellow-300' : ''
                                            }`}
                                    >
                                        {formatSymptomName(symptom)}
                                        <button
                                            onClick={() => handleRemoveSymptom(symptom)}
                                            className="ml-2 text-red-500 hover:text-red-700 focus:outline-none transition-colors"
                                            aria-label={`Remove ${formatSymptomName(symptom)}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={`mb-6 p-3 rounded flex items-start ${selectedSymptoms.length < 3
                                ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700'
                                : 'bg-red-100 border-l-4 border-red-500 text-red-700'
                            }`}>
                            <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                    selectedSymptoms.length < 3
                                        ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                } />
                            </svg>
                            <div>
                                {error}
                                {selectedSymptoms.length < 3 && selectedSymptoms.length > 0 && (
                                    <div className="mt-1 text-sm">
                                        You've selected {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''}. Please add {3 - selectedSymptoms.length} more.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Prediction Button */}
                    <button
                        onClick={predict}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 shadow-md ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : selectedSymptoms.length < 3
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                            } flex items-center justify-center`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing Symptoms...
                            </>
                        ) : (
                            <>
                                {selectedSymptoms.length < 3 ? (
                                    `Select ${3 - selectedSymptoms.length} more symptom${3 - selectedSymptoms.length !== 1 ? 's' : ''}`
                                ) : (
                                    'Get Diagnosis & Specialist'
                                )}
                            </>
                        )}
                    </button>

                    {/* Prediction Results */}
                    {prediction && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Diagnosis Results
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Disease Card */}
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Primary Diagnosis</h3>
                                    <p className="text-2xl font-bold text-blue-800">{prediction.diagnosis.primary_prediction}</p>
                                    <div className="mt-2 flex items-center">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${getSeverityInfo(prediction.severity).color}`}>
                                            {getSeverityInfo(prediction.severity).icon} {getSeverityInfo(prediction.severity).label} Severity
                                        </span>
                                    </div>
                                    <div className="mt-3">
                                        <div className="h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-green-500 rounded-full"
                                                style={{ width: `${prediction.diagnosis.confidence}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-right text-sm text-gray-500 mt-1">
                                            Confidence: {prediction.diagnosis.confidence}%
                                        </p>
                                    </div>
                                </div>

                                {/* Specialist Card */}
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Recommended Specialist</h3>
                                    <p className="text-2xl font-bold text-blue-800">{prediction.recommendation.specialist}</p>
                                    <div className="mt-3">
                                        <div className="h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-green-500 rounded-full"
                                                style={{ width: `${prediction.recommendation.confidence}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-right text-sm text-gray-500 mt-1">
                                            Confidence: {prediction.recommendation.confidence}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Top 3 Predictions */}
                            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Other Possible Conditions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {prediction.diagnosis.top3_predictions.map((item, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-gray-700">{item.disease}</span>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {item.confidence}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Matched Symptoms */}
                            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Matched Symptoms</h3>
                                <ul className="space-y-2">
                                    {prediction.matched_symptoms.map((symptom, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">{formatSymptomName(symptom)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Next Steps */}
                            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps</h3>
                                {prediction.severity === 'emergency' ? (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-3">
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <strong className="text-red-700">EMERGENCY: </strong>
                                        </div>
                                        <p className="text-red-700 mt-1">
                                            Based on your symptoms, this appears to be a medical emergency. Please seek immediate medical attention or call emergency services.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-700">
                                        Based on your symptoms, we recommend consulting a {prediction.recommendation.specialist.toLowerCase()}.
                                        {prediction.severity === 'high' && ' This condition may require prompt medical attention.'}
                                    </p>
                                )}
                            </div>

                            {/* Appointment Booking */}
                            <div className="mt-6 bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                                <h3 className="text-sm font-medium text-blue-800 mb-3">
                                    {prediction.severity === 'emergency' ? 'Emergency Assistance' : 'Ready to Consult?'}
                                </h3>
                                <div className="flex flex-col items-center">
                                    {prediction.severity === 'emergency' ? (
                                        <>
                                            <p className="text-gray-700 mb-4 text-center">
                                                This requires immediate medical attention. Please call emergency services or go to the nearest hospital.
                                            </p>
                                            <button
                                                onClick={() =>navigate(`/appoinment/67e99d4f1a628be7d769923d`)}
                                                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                                </svg>
                                                Book Emergency Slot
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-gray-700 mb-4 text-center">
                                                Click below to {prediction.severity === 'high' ? 'book an urgent appointment' : 'book an appointment'} with a {prediction.recommendation.specialist.toLowerCase()}
                                            </p>
                                            <button
                                                onClick={() => navigate(`/doctors/${prediction.recommendation.specialist}`, {
                                                    state: { urgent: prediction.severity === 'high' }
                                                })}
                                                className={`w-full md:w-auto px-6 py-3 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center ${prediction.severity === 'high' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                {prediction.severity === 'high' ? 'Book Urgent Appointment' : 'Book Appointment'} with {prediction.recommendation.specialist}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500">
                    <p>Note: For best results, select at least 3 symptoms. This tool provides suggestions only and is not a substitute for professional medical advice.</p>
                </div>
            </div>
        </div>
    );
}

export default SpecialistPredication;