import { TranscriptionResult, ClinicalEntity, ClinicalNote, ReviewSuggestion, SystemStatus } from '@/types';
import { mockEntities, mockSuggestions, mockSystemStatus, generateMockTranscription, mockNotes } from './mockData';

export class BackendSimulator {
  private static instance: BackendSimulator;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private isListening = false;
  private currentSession: string | null = null;
  private transcriptionInterval: NodeJS.Timeout | null = null;
  private notes: ClinicalNote[] = mockNotes;

  static getInstance(): BackendSimulator {
    if (!BackendSimulator.instance) {
      BackendSimulator.instance = new BackendSimulator();
    }
    return BackendSimulator.instance;
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  async startListening(sessionId: string): Promise<void> {
    if (this.isListening) {
      throw new Error('Already listening');
    }

    this.isListening = true;
    this.currentSession = sessionId;
    
    this.emit('listening-started', { sessionId });
    
    // Simulate periodic transcriptions
    this.simulateTranscriptions();
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) {
      throw new Error('Not currently listening');
    }

    this.isListening = false;
    
    if (this.transcriptionInterval) {
      clearInterval(this.transcriptionInterval);
      this.transcriptionInterval = null;
    }

    this.emit('listening-stopped', { sessionId: this.currentSession });
    
    // Generate final note
    setTimeout(() => {
      this.generateNote();
    }, 1000);
    
    this.currentSession = null;
  }

  private simulateTranscriptions() {
    const patientSentences = [
      'I\'ve been having chest pain for about 2 hours.',
      'It\'s a sharp, stabbing pain that radiates to my left arm.',
      'On a scale of 1 to 10, I\'d say it\'s about a 7.',
      'I also feel nauseous but no shortness of breath.',
      'I take lisinopril for my blood pressure.',
      'My last blood sugar reading was 135.'
    ];

    const providerSentences = [
      'Can you describe the pain in more detail?',
      'Let me check your blood pressure.',
      'Your blood pressure is 145 over 92.',
      'I\'m going to order an ECG and some blood work.',
      'We\'ll need to monitor your symptoms closely.',
      'I\'ll prescribe some medication for the pain.'
    ];

    let sentenceIndex = 0;
    let isPatientTurn = true;

    this.transcriptionInterval = setInterval(() => {
      if (!this.isListening) return;

      const sentences = isPatientTurn ? patientSentences : providerSentences;
      const speaker = isPatientTurn ? 'patient' : 'provider';
      
      if (sentenceIndex < sentences.length) {
        const transcription = generateMockTranscription(speaker, sentences[sentenceIndex]);
        this.emit('transcription', transcription);
        
        // Simulate entity extraction
        setTimeout(() => {
          this.extractEntities(transcription);
        }, 500);
        
        sentenceIndex++;
        isPatientTurn = !isPatientTurn;
      } else {
        // Reset and continue with variations
        sentenceIndex = 0;
        const variation = Math.random() > 0.7;
        if (variation) {
          const randomSentence = Math.random() > 0.5 
            ? 'How long have you been experiencing this?'
            : 'Any other symptoms I should know about?';
          const transcription = generateMockTranscription('provider', randomSentence);
          this.emit('transcription', transcription);
        }
      }
    }, 3000);
  }

  private extractEntities(transcription: TranscriptionResult) {
    const text = transcription.text.toLowerCase();
    const extractedEntities: ClinicalEntity[] = [];

    // Simple entity extraction based on keywords
    const entityPatterns = [
      { pattern: /chest pain/i, type: 'symptom' as const, value: 'chest pain', icd10: 'R06.02' },
      { pattern: /nausea/i, type: 'symptom' as const, value: 'nausea', icd10: 'R11.0' },
      { pattern: /blood pressure.*(\d+).*(over|\/).*(\d+)/i, type: 'vital' as const, value: 'blood pressure', snomedCt: '75367002' },
      { pattern: /lisinopril/i, type: 'medication' as const, value: 'lisinopril', snomedCt: '29046004' },
      { pattern: /blood sugar.*(\d+)/i, type: 'vital' as const, value: 'blood glucose', snomedCt: '33747000' },
    ];

    entityPatterns.forEach(pattern => {
      const match = text.match(pattern.pattern);
      if (match) {
        extractedEntities.push({
          id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: pattern.type,
          value: match[0],
          confidence: Math.random() * 0.2 + 0.8,
          context: transcription.text,
          icd10: pattern.icd10,
          snomedCt: pattern.snomedCt
        });
      }
    });

    if (extractedEntities.length > 0) {
      this.emit('clinical-entities', extractedEntities);
    }
  }

  private generateNote() {
    // Simulate note generation delay
    setTimeout(() => {
      const note: ClinicalNote = {
        id: `note_${Date.now()}`,
        patientId: 'patient_123',
        providerId: 'provider_456',
        sessionId: this.currentSession!,
        timestamp: Date.now(),
        rawTranscription: 'Simulated transcription content...',
        entities: mockEntities,
        structuredData: {
          chiefComplaint: 'Chest pain',
          historyOfPresentIllness: 'Patient reports chest pain for the past 2 hours. Pain is described as sharp and radiates to the left arm. Patient rates pain 7/10.',
          physicalExam: 'Vital signs: Blood pressure 145/92 mmHg. Patient appears in mild distress.',
          assessment: 'Chest pain, rule out acute coronary syndrome.',
          plan: 'Order ECG, cardiac enzymes, chest X-ray. Monitor vital signs.'
        },
        status: 'draft'
      };

      this.emit('note-generated', note);
      
      // Generate review suggestions
      setTimeout(() => {
        this.emit('review-suggestions', mockSuggestions);
      }, 1000);
    }, 2000);
  }

  async analyzeNote(noteId: string): Promise<ReviewSuggestion[]> {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockSuggestions;
  }

  async updateNote(noteId: string, updates: Partial<ClinicalNote>): Promise<ClinicalNote> {
    // Simulate update delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return updated note (in real app, this would come from database)
    return {
      id: noteId,
      patientId: 'patient_123',
      providerId: 'provider_456',
      sessionId: 'session_001',
      timestamp: Date.now(),
      rawTranscription: 'Updated transcription...',
      entities: mockEntities,
      structuredData: {
        chiefComplaint: updates.structuredData?.chiefComplaint || 'Chest pain',
        historyOfPresentIllness: updates.structuredData?.historyOfPresentIllness || 'Patient reports chest pain...',
        physicalExam: updates.structuredData?.physicalExam || 'Vital signs normal',
        assessment: updates.structuredData?.assessment || 'Rule out MI',
        plan: updates.structuredData?.plan || 'Order ECG and labs'
      },
      status: updates.status || 'draft'
    };
  }

  async approveNote(noteId: string): Promise<ClinicalNote> {
    // Simulate approval delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Find and update the note
    const noteIndex = this.notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      this.notes[noteIndex] = {
        ...this.notes[noteIndex],
        status: 'finalized',
        timestamp: Date.now()
      };
      return this.notes[noteIndex];
    }
    
    // Fallback if note not found
    return {
      id: noteId,
      patientId: 'patient_123',
      providerId: 'provider_456',
      sessionId: 'session_001',
      timestamp: Date.now(),
      rawTranscription: 'Approved transcription...',
      entities: mockEntities,
      structuredData: {
        chiefComplaint: 'Chest pain',
        historyOfPresentIllness: 'Patient reports chest pain for the past 2 hours. Pain is described as sharp and radiates to the left arm. Patient rates pain 7/10.',
        physicalExam: 'Vital signs: Blood pressure 145/92 mmHg. Patient appears in mild distress.',
        assessment: 'Chest pain, rule out acute coronary syndrome.',
        plan: 'Order ECG, cardiac enzymes, chest X-ray. Monitor vital signs.'
      },
      status: 'finalized'
    };
  }

  async getNotes(): Promise<ClinicalNote[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.notes;
  }

  async getNote(noteId: string): Promise<ClinicalNote | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.notes.find(n => n.id === noteId) || null;
  }

  async finalizeNote(noteId: string, targetSystems: string[]): Promise<any> {
    // Simulate finalization delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = targetSystems.map(system => ({
      system,
      status: Math.random() > 0.2 ? 'success' : 'error',
      timestamp: Date.now(),
      result: Math.random() > 0.2 ? `Successfully submitted to ${system}` : undefined,
      error: Math.random() > 0.2 ? undefined : `Failed to connect to ${system}`
    }));

    this.emit('integration-results', results);
    return results;
  }

  async getSystemStatus(): Promise<SystemStatus[]> {
    // Simulate some status changes
    const status = [...mockSystemStatus];
    status.forEach(system => {
      // Randomly update status
      if (Math.random() > 0.9) {
        system.status = ['online', 'offline', 'degraded'][Math.floor(Math.random() * 3)] as any;
      }
      system.lastCheck = Date.now() - Math.random() * 120000;
      system.responseTime = Math.random() * 500 + 100;
    });
    
    return status;
  }

  async testConnection(systemName: string): Promise<boolean> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    return Math.random() > 0.2; // 80% success rate
  }
}

export const backend = BackendSimulator.getInstance();