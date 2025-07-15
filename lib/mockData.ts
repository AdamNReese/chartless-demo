import { Patient, Provider, TranscriptionResult, ClinicalEntity, ClinicalNote, ReviewSuggestion, SystemStatus } from '@/types';

export const mockPatient: Patient = {
  id: 'patient_123',
  mrn: 'MRN-001234',
  name: {
    first: 'John',
    last: 'Doe'
  },
  dateOfBirth: '1985-03-15',
  gender: 'Male',
  allergies: ['Penicillin', 'Shellfish'],
  medications: ['Lisinopril 10mg', 'Metformin 500mg']
};

export const mockProvider: Provider = {
  id: 'provider_456',
  name: 'Dr. Sarah Johnson',
  npi: '1234567890',
  specialty: 'Internal Medicine',
  credentials: 'MD, FACP'
};

export const mockTranscriptions: TranscriptionResult[] = [
  {
    id: 'trans_1',
    text: 'Good morning, Mr. Doe. How are you feeling today?',
    confidence: 0.98,
    timestamp: Date.now() - 300000,
    speakerInfo: {
      id: 'provider_456',
      name: 'Dr. Sarah Johnson',
      role: 'physician'
    }
  },
  {
    id: 'trans_2',
    text: 'I\'ve been having chest pain for the past 2 hours. It\'s sharp and radiates to my left arm.',
    confidence: 0.95,
    timestamp: Date.now() - 280000,
    speakerInfo: {
      id: 'patient_123',
      name: 'John Doe',
      role: 'patient'
    }
  },
  {
    id: 'trans_3',
    text: 'Can you describe the pain on a scale of 1 to 10? Any shortness of breath or nausea?',
    confidence: 0.97,
    timestamp: Date.now() - 260000,
    speakerInfo: {
      id: 'provider_456',
      name: 'Dr. Sarah Johnson',
      role: 'physician'
    }
  },
  {
    id: 'trans_4',
    text: 'I\'d say it\'s about a 7 out of 10. I do feel a bit nauseous but no shortness of breath.',
    confidence: 0.94,
    timestamp: Date.now() - 240000,
    speakerInfo: {
      id: 'patient_123',
      name: 'John Doe',
      role: 'patient'
    }
  },
  {
    id: 'trans_5',
    text: 'Let me check your blood pressure. It\'s 145 over 92. Heart rate is 88 beats per minute.',
    confidence: 0.96,
    timestamp: Date.now() - 220000,
    speakerInfo: {
      id: 'provider_456',
      name: 'Dr. Sarah Johnson',
      role: 'physician'
    }
  }
];

export const mockEntities: ClinicalEntity[] = [
  {
    id: 'entity_1',
    type: 'symptom',
    value: 'chest pain',
    confidence: 0.95,
    context: 'chest pain for the past 2 hours',
    icd10: 'R06.02',
    snomedCt: '29857009',
    location: { start: 18, end: 28 }
  },
  {
    id: 'entity_2',
    type: 'symptom',
    value: 'nausea',
    confidence: 0.88,
    context: 'I do feel a bit nauseous',
    icd10: 'R11.0',
    snomedCt: '422587007',
    location: { start: 34, end: 40 }
  },
  {
    id: 'entity_3',
    type: 'vital',
    value: 'blood pressure 145/92',
    confidence: 0.92,
    context: 'blood pressure. It\'s 145 over 92',
    snomedCt: '75367002',
    location: { start: 25, end: 45 }
  },
  {
    id: 'entity_4',
    type: 'vital',
    value: 'heart rate 88 bpm',
    confidence: 0.91,
    context: 'Heart rate is 88 beats per minute',
    snomedCt: '364075005',
    location: { start: 50, end: 67 }
  },
  {
    id: 'entity_5',
    type: 'medication',
    value: 'Lisinopril',
    confidence: 0.89,
    context: 'patient medications',
    snomedCt: '29046004',
    location: { start: 0, end: 10 }
  }
];

export const mockNote: ClinicalNote = {
  id: 'note_789',
  patientId: 'patient_123',
  providerId: 'provider_456',
  sessionId: 'session_001',
  timestamp: Date.now(),
  rawTranscription: mockTranscriptions.map(t => `${t.speakerInfo?.name}: ${t.text}`).join('\\n'),
  entities: mockEntities,
  structuredData: {
    chiefComplaint: 'Chest pain',
    historyOfPresentIllness: 'Patient reports chest pain for the past 2 hours. Pain is described as sharp and radiates to the left arm. Patient rates pain 7/10. Associated with nausea but no shortness of breath.',
    physicalExam: 'Vital signs: Blood pressure 145/92 mmHg, Heart rate 88 bpm. Patient appears in mild distress.',
    assessment: 'Chest pain, rule out acute coronary syndrome. Hypertension.',
    plan: 'Order ECG, cardiac enzymes, chest X-ray. Monitor vital signs. Consider cardiology consultation if abnormal findings.'
  },
  status: 'draft'
};

export const mockNotes: ClinicalNote[] = [
  {
    id: 'note_001',
    patientId: 'patient_123',
    providerId: 'provider_456',
    sessionId: 'session_001',
    timestamp: Date.now() - 3600000,
    rawTranscription: 'Patient presents with chest pain...',
    entities: [
      {
        id: 'entity_001_1',
        type: 'symptom',
        value: 'chest pain',
        confidence: 0.95,
        context: 'chest pain for the past 2 hours',
        icd10: 'R06.02',
        snomedCt: '29857009',
        location: { start: 18, end: 28 }
      },
      {
        id: 'entity_001_2',
        type: 'symptom',
        value: 'nausea',
        confidence: 0.88,
        context: 'Associated with nausea',
        icd10: 'R11.0',
        snomedCt: '422587007',
        location: { start: 34, end: 40 }
      },
      {
        id: 'entity_001_3',
        type: 'vital',
        value: 'blood pressure 145/92',
        confidence: 0.92,
        context: 'blood pressure 145/92 mmHg',
        snomedCt: '75367002',
        location: { start: 25, end: 45 }
      },
      {
        id: 'entity_001_4',
        type: 'vital',
        value: 'heart rate 88 bpm',
        confidence: 0.91,
        context: 'Heart rate 88 bpm',
        snomedCt: '364075005',
        location: { start: 50, end: 67 }
      },
      {
        id: 'entity_001_5',
        type: 'diagnosis',
        value: 'acute coronary syndrome',
        confidence: 0.78,
        context: 'rule out acute coronary syndrome',
        icd10: 'I24.9',
        snomedCt: '394659003',
        location: { start: 0, end: 25 }
      }
    ],
    structuredData: {
      chiefComplaint: 'Chest pain',
      historyOfPresentIllness: 'Patient reports chest pain for the past 2 hours. Pain is described as sharp and radiates to the left arm. Patient rates pain 7/10. Associated with nausea but no shortness of breath.',
      physicalExam: 'Vital signs: Blood pressure 145/92 mmHg, Heart rate 88 bpm. Patient appears in mild distress.',
      assessment: 'Chest pain, rule out acute coronary syndrome. Hypertension.',
      plan: 'Order ECG, cardiac enzymes, chest X-ray. Monitor vital signs. Consider cardiology consultation if abnormal findings.'
    },
    status: 'draft'
  },
  {
    id: 'note_002',
    patientId: 'patient_124',
    providerId: 'provider_456',
    sessionId: 'session_002',
    timestamp: Date.now() - 7200000,
    rawTranscription: 'Follow-up visit for diabetes management...',
    entities: [
      {
        id: 'entity_002_1',
        type: 'diagnosis',
        value: 'type 2 diabetes mellitus',
        confidence: 0.96,
        context: 'type 2 diabetes mellitus presents for routine follow-up',
        icd10: 'E11.9',
        snomedCt: '44054006',
        location: { start: 0, end: 25 }
      },
      {
        id: 'entity_002_2',
        type: 'medication',
        value: 'metformin',
        confidence: 0.94,
        context: 'good adherence to metformin',
        snomedCt: '387562000',
        location: { start: 30, end: 39 }
      },
      {
        id: 'entity_002_3',
        type: 'vital',
        value: 'blood glucose 120-140 mg/dL',
        confidence: 0.92,
        context: 'Blood glucose readings at home averaging 120-140 mg/dL',
        snomedCt: '33747000',
        location: { start: 45, end: 70 }
      },
      {
        id: 'entity_002_4',
        type: 'vital',
        value: 'weight 180 lbs',
        confidence: 0.90,
        context: 'Weight 180 lbs',
        snomedCt: '27113001',
        location: { start: 75, end: 90 }
      }
    ],
    structuredData: {
      chiefComplaint: 'Diabetes follow-up',
      historyOfPresentIllness: 'Patient with type 2 diabetes mellitus presents for routine follow-up. Reports good adherence to metformin. Blood glucose readings at home averaging 120-140 mg/dL.',
      physicalExam: 'Vital signs stable. Weight 180 lbs. No acute distress. Feet examination shows no ulcers or deformities.',
      assessment: 'Type 2 diabetes mellitus, well controlled.',
      plan: 'Continue metformin 500mg twice daily. Recheck HbA1c in 3 months. Diabetic foot care education provided.'
    },
    status: 'under_review'
  },
  {
    id: 'note_003',
    patientId: 'patient_125',
    providerId: 'provider_456',
    sessionId: 'session_003',
    timestamp: Date.now() - 10800000,
    rawTranscription: 'Hypertension management visit...',
    entities: [
      {
        id: 'entity_003_1',
        type: 'diagnosis',
        value: 'essential hypertension',
        confidence: 0.93,
        context: 'essential hypertension presents for routine follow-up',
        icd10: 'I10',
        snomedCt: '59621000',
        location: { start: 0, end: 20 }
      },
      {
        id: 'entity_003_2',
        type: 'medication',
        value: 'lisinopril',
        confidence: 0.95,
        context: 'taking lisinopril as prescribed',
        snomedCt: '29046004',
        location: { start: 25, end: 35 }
      },
      {
        id: 'entity_003_3',
        type: 'symptom',
        value: 'dizziness',
        confidence: 0.87,
        context: 'Occasional dizziness when standing up',
        icd10: 'R42',
        snomedCt: '404640003',
        location: { start: 40, end: 49 }
      },
      {
        id: 'entity_003_4',
        type: 'vital',
        value: 'blood pressure 135/85',
        confidence: 0.94,
        context: 'Blood pressure 135/85 mmHg',
        snomedCt: '75367002',
        location: { start: 54, end: 75 }
      }
    ],
    structuredData: {
      chiefComplaint: 'Hypertension follow-up',
      historyOfPresentIllness: 'Patient with essential hypertension presents for routine follow-up. Reports taking lisinopril as prescribed. Occasional dizziness when standing up.',
      physicalExam: 'Blood pressure 135/85 mmHg. Heart rate 72 bpm. No orthostatic changes. Cardiac exam normal.',
      assessment: 'Essential hypertension, adequately controlled.',
      plan: 'Continue lisinopril 10mg daily. Lifestyle modifications counseling provided. Follow-up in 6 months.'
    },
    status: 'finalized'
  },
  {
    id: 'note_004',
    patientId: 'patient_126',
    providerId: 'provider_456',
    sessionId: 'session_004',
    timestamp: Date.now() - 14400000,
    rawTranscription: 'Annual physical examination...',
    entities: [
      {
        id: 'entity_004_1',
        type: 'vital',
        value: 'blood pressure 125/80',
        confidence: 0.96,
        context: 'BP 125/80',
        snomedCt: '75367002',
        location: { start: 0, end: 20 }
      },
      {
        id: 'entity_004_2',
        type: 'vital',
        value: 'heart rate 68',
        confidence: 0.94,
        context: 'HR 68',
        snomedCt: '364075005',
        location: { start: 25, end: 35 }
      },
      {
        id: 'entity_004_3',
        type: 'vital',
        value: 'temperature 98.6°F',
        confidence: 0.93,
        context: 'Temp 98.6°F',
        snomedCt: '276885007',
        location: { start: 40, end: 55 }
      },
      {
        id: 'entity_004_4',
        type: 'procedure',
        value: 'annual physical examination',
        confidence: 0.91,
        context: 'routine annual physical examination',
        snomedCt: '185349003',
        location: { start: 60, end: 85 }
      }
    ],
    structuredData: {
      chiefComplaint: 'Annual physical examination',
      historyOfPresentIllness: 'Patient presents for routine annual physical examination. No acute complaints. Feels well overall.',
      physicalExam: 'Vital signs: BP 125/80, HR 68, Temp 98.6°F. General appearance well. Heart regular rate and rhythm. Lungs clear bilaterally.',
      assessment: 'Healthy adult, no acute issues.',
      plan: 'Routine screening labs ordered. Continue current medications. Follow-up in 1 year or as needed.'
    },
    status: 'draft'
  },
  {
    id: 'note_005',
    patientId: 'patient_127',
    providerId: 'provider_456',
    sessionId: 'session_005',
    timestamp: Date.now() - 18000000,
    rawTranscription: 'Patient with shortness of breath...',
    entities: [
      {
        id: 'entity_005_1',
        type: 'symptom',
        value: 'shortness of breath',
        confidence: 0.97,
        context: 'progressive shortness of breath over the past week',
        icd10: 'R06.00',
        snomedCt: '267036007',
        location: { start: 0, end: 19 }
      },
      {
        id: 'entity_005_2',
        type: 'symptom',
        value: 'fatigue',
        confidence: 0.89,
        context: 'Some fatigue',
        icd10: 'R53.1',
        snomedCt: '84229001',
        location: { start: 24, end: 31 }
      },
      {
        id: 'entity_005_3',
        type: 'vital',
        value: 'oxygen saturation 94%',
        confidence: 0.95,
        context: 'O2 sat 94% on room air',
        snomedCt: '442476006',
        location: { start: 36, end: 55 }
      },
      {
        id: 'entity_005_4',
        type: 'symptom',
        value: 'bilateral lower extremity edema',
        confidence: 0.92,
        context: 'Bilateral lower extremity edema',
        icd10: 'R60.0',
        snomedCt: '102491009',
        location: { start: 60, end: 90 }
      },
      {
        id: 'entity_005_5',
        type: 'diagnosis',
        value: 'congestive heart failure',
        confidence: 0.88,
        context: 'Congestive heart failure, acute exacerbation',
        icd10: 'I50.9',
        snomedCt: '42343007',
        location: { start: 95, end: 118 }
      },
      {
        id: 'entity_005_6',
        type: 'medication',
        value: 'furosemide',
        confidence: 0.90,
        context: 'Increase furosemide',
        snomedCt: '387475002',
        location: { start: 123, end: 133 }
      }
    ],
    structuredData: {
      chiefComplaint: 'Shortness of breath',
      historyOfPresentIllness: 'Patient reports progressive shortness of breath over the past week. Worse with exertion. No chest pain. Some fatigue.',
      physicalExam: 'Vital signs: BP 140/90, HR 95, O2 sat 94% on room air. Bilateral lower extremity edema. Crackles at lung bases.',
      assessment: 'Congestive heart failure, acute exacerbation.',
      plan: 'Chest X-ray, BNP, echo. Increase furosemide. Strict I/O monitoring. Cardiology consultation.'
    },
    status: 'under_review'
  }
];

export const mockSuggestions: ReviewSuggestion[] = [
  {
    id: 'suggestion_1',
    type: 'completeness',
    severity: 'warning',
    message: 'Review of systems section is missing',
    location: { section: 'reviewOfSystems' },
    suggestion: 'Add review of systems to enhance documentation completeness',
    autoFixable: false
  },
  {
    id: 'suggestion_2',
    type: 'medical',
    severity: 'error',
    message: 'Consider ordering troponin levels for chest pain evaluation',
    location: { section: 'plan' },
    suggestion: 'Add troponin levels to cardiac enzyme panel',
    autoFixable: true
  },
  {
    id: 'suggestion_3',
    type: 'coding',
    severity: 'warning',
    message: 'Chest pain needs ICD-10 code specification',
    location: { section: 'assessment' },
    suggestion: 'Specify ICD-10 code: R06.02 for chest pain',
    autoFixable: true
  },
  {
    id: 'suggestion_4',
    type: 'grammar',
    severity: 'info',
    message: 'Consider using consistent tense throughout the note',
    location: { section: 'historyOfPresentIllness', startIndex: 0, endIndex: 20 },
    suggestion: 'Use past tense consistently',
    autoFixable: true
  }
];

export const mockSystemStatus: SystemStatus[] = [
  {
    name: 'Epic EHR',
    status: 'online',
    lastCheck: Date.now() - 30000,
    responseTime: 245,
    errorCount: 0
  },
  {
    name: 'Cerner EHR',
    status: 'online',
    lastCheck: Date.now() - 45000,
    responseTime: 312,
    errorCount: 0
  },
  {
    name: 'Redox API',
    status: 'degraded',
    lastCheck: Date.now() - 60000,
    responseTime: 1200,
    errorCount: 2
  },
  {
    name: 'FHIR Server',
    status: 'online',
    lastCheck: Date.now() - 20000,
    responseTime: 156,
    errorCount: 0
  },
  {
    name: 'Speech Service',
    status: 'online',
    lastCheck: Date.now() - 10000,
    responseTime: 89,
    errorCount: 0
  },
  {
    name: 'Clinical AI',
    status: 'offline',
    lastCheck: Date.now() - 300000,
    responseTime: 0,
    errorCount: 5
  }
];

export const generateMockTranscription = (speaker: 'patient' | 'provider', text: string): TranscriptionResult => ({
  id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  text,
  confidence: Math.random() * 0.1 + 0.9,
  timestamp: Date.now(),
  speakerInfo: {
    id: speaker === 'patient' ? 'patient_123' : 'provider_456',
    name: speaker === 'patient' ? 'John Doe' : 'Dr. Sarah Johnson',
    role: speaker
  }
});

export const patientScenarios = [
  {
    name: 'Chest Pain',
    transcriptions: [
      'I\'ve been having chest pain for about 2 hours now.',
      'It\'s a sharp, stabbing pain that radiates to my left arm.',
      'On a scale of 1 to 10, I\'d say it\'s about a 7.',
      'I also feel nauseous but no shortness of breath.'
    ]
  },
  {
    name: 'Diabetes Follow-up',
    transcriptions: [
      'I\'ve been checking my blood sugar regularly.',
      'My morning readings are usually around 120 to 140.',
      'I\'m taking my metformin as prescribed.',
      'I\'ve been trying to exercise more and eat better.'
    ]
  },
  {
    name: 'Hypertension Check',
    transcriptions: [
      'I\'ve been taking my blood pressure medication.',
      'Sometimes I feel dizzy when I stand up.',
      'My home readings are usually around 135 over 85.',
      'I\'ve been trying to reduce my salt intake.'
    ]
  }
];

export const clinicalScenarios = [
  {
    name: 'Acute Coronary Syndrome',
    entities: [
      { type: 'symptom', value: 'chest pain', confidence: 0.95 },
      { type: 'symptom', value: 'radiation to left arm', confidence: 0.88 },
      { type: 'symptom', value: 'nausea', confidence: 0.82 },
      { type: 'vital', value: 'blood pressure 145/92', confidence: 0.92 }
    ]
  },
  {
    name: 'Diabetes Management',
    entities: [
      { type: 'vital', value: 'blood glucose 135', confidence: 0.94 },
      { type: 'medication', value: 'metformin', confidence: 0.96 },
      { type: 'diagnosis', value: 'diabetes mellitus', confidence: 0.91 }
    ]
  },
  {
    name: 'Hypertension Control',
    entities: [
      { type: 'vital', value: 'blood pressure 135/85', confidence: 0.93 },
      { type: 'symptom', value: 'dizziness', confidence: 0.78 },
      { type: 'medication', value: 'lisinopril', confidence: 0.89 }
    ]
  }
];