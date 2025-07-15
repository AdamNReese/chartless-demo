import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Volume2,
  Users,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { backend } from '@/lib/simulateBackend';
import { TranscriptionResult } from '@/types';
import { mockPatient, mockProvider } from '@/lib/mockData';

const AmbientListening: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [currentSession, setCurrentSession] = useState({
    duration: 0,
    wordCount: 0,
    confidenceAvg: 0
  });
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isListening) {
      interval = setInterval(() => {
        setCurrentSession(prev => ({ ...prev, duration: prev.duration + 1 }));
        setAudioLevel(Math.random() * 100);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  useEffect(() => {
    const handleTranscription = (transcription: TranscriptionResult) => {
      setTranscriptions(prev => [...prev, transcription]);
      setCurrentSession(prev => ({
        ...prev,
        wordCount: prev.wordCount + transcription.text.split(' ').length,
        confidenceAvg: (prev.confidenceAvg + transcription.confidence) / 2
      }));
    };

    const handleListeningStarted = ({ sessionId }: { sessionId: string }) => {
      setSessionId(sessionId);
      setIsListening(true);
    };

    const handleListeningStopped = () => {
      setIsListening(false);
      setSessionId(null);
    };

    backend.on('transcription', handleTranscription);
    backend.on('listening-started', handleListeningStarted);
    backend.on('listening-stopped', handleListeningStopped);

    return () => {
      backend.off('transcription', handleTranscription);
      backend.off('listening-started', handleListeningStarted);
      backend.off('listening-stopped', handleListeningStopped);
    };
  }, []);

  const handleStartListening = async () => {
    try {
      const newSessionId = `session_${Date.now()}`;
      await backend.startListening(newSessionId);
      setTranscriptions([]);
      setCurrentSession({ duration: 0, wordCount: 0, confidenceAvg: 0 });
    } catch (error) {
      console.error('Failed to start listening:', error);
    }
  };

  const handleStopListening = async () => {
    try {
      await backend.stopListening();
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speakerId: string) => {
    return speakerId === 'provider_456' ? 'text-blue-600' : 'text-green-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ambient Listening</h1>
          <p className="text-gray-600 mt-2">
            Real-time audio capture and transcription with speaker identification
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`status-indicator ${isListening ? 'status-active' : 'status-inactive'}`}></div>
            <span className="text-sm text-gray-600">
              {isListening ? 'Recording' : 'Stopped'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Session Control</h2>
            <p className="text-gray-600">Start or stop the ambient listening session</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isListening 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              <span>{isListening ? 'Stop Recording' : 'Start Recording'}</span>
            </button>
          </div>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{mockProvider.name}</p>
                <p className="text-sm text-gray-600">{mockProvider.specialty}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{mockPatient.name.first} {mockPatient.name.last}</p>
                <p className="text-sm text-gray-600">MRN: {mockPatient.mrn}</p>
              </div>
            </div>
          </div>
          
          {/* Audio Level Indicator */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Audio Level</span>
                <Volume2 className="h-4 w-4 text-gray-500" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>
            
            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{formatDuration(currentSession.duration)}</p>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{currentSession.wordCount}</p>
                <p className="text-sm text-gray-600">Words</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{(currentSession.confidenceAvg * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Confidence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Display */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Live Transcription</h2>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary-600" />
              <span className="text-sm text-gray-600">{transcriptions.length} segments</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
          {transcriptions.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {isListening ? 'Listening for audio...' : 'Start recording to see transcriptions'}
              </p>
            </div>
          ) : (
            transcriptions.map((transcription) => (
              <div key={transcription.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transcription.speakerInfo?.role === 'provider' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <span className={`text-sm font-medium ${getSpeakerColor(transcription.speakerInfo?.id || '')}`}>
                      {transcription.speakerInfo?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-medium ${getSpeakerColor(transcription.speakerInfo?.id || '')}`}>
                      {transcription.speakerInfo?.name || 'Unknown'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(transcription.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      {transcription.confidence > 0.9 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : transcription.confidence > 0.8 ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-xs text-gray-500">
                        {(transcription.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-900">{transcription.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mic className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Real-time Processing</h3>
          </div>
          <p className="text-sm text-gray-600">
            Continuous audio capture with instant speech-to-text conversion and speaker identification.
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Speaker Detection</h3>
          </div>
          <p className="text-sm text-gray-600">
            Automatically identifies and distinguishes between patient and provider voices.
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Quality Monitoring</h3>
          </div>
          <p className="text-sm text-gray-600">
            Confidence scoring and audio quality indicators for reliable transcription.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmbientListening;