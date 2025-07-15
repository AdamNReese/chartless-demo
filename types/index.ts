export interface Patient {
  id: string;
  mrn: string;
  name: {
    first: string;
    last: string;
  };
  dateOfBirth: string;
  gender: string;
  allergies: string[];
  medications: string[];
}

export interface Provider {
  id: string;
  name: string;
  npi: string;
  specialty: string;
  credentials: string;
}

export interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  timestamp: number;
  speakerInfo?: {
    id: string;
    name?: string;
    role?: string;
  };
}

export interface ClinicalEntity {
  id: string;
  type: 'symptom' | 'diagnosis' | 'medication' | 'procedure' | 'vital' | 'allergy';
  value: string;
  confidence: number;
  context?: string;
  icd10?: string;
  snomedCt?: string;
  location?: {
    start: number;
    end: number;
  };
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  providerId: string;
  sessionId: string;
  timestamp: number;
  rawTranscription: string;
  entities: ClinicalEntity[];
  structuredData: {
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    reviewOfSystems?: string;
    physicalExam?: string;
    assessment?: string;
    plan?: string;
  };
  status: 'draft' | 'under_review' | 'finalized';
}

export interface ReviewSuggestion {
  id: string;
  type: 'grammar' | 'medical' | 'structure' | 'coding' | 'completeness';
  severity: 'info' | 'warning' | 'error';
  message: string;
  location: {
    section: string;
    startIndex?: number;
    endIndex?: number;
  };
  suggestion: string;
  autoFixable: boolean;
}

export interface ChartingSession {
  id: string;
  patientId: string;
  providerId: string;
  startTime: number;
  status: 'active' | 'paused' | 'completed';
  transcriptions: TranscriptionResult[];
  entities: ClinicalEntity[];
  currentNote?: ClinicalNote;
}

export interface IntegrationResult {
  system: string;
  status: 'success' | 'error' | 'pending';
  result?: any;
  error?: string;
  timestamp: number;
}

export interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastCheck: number;
  responseTime?: number;
  errorCount: number;
}