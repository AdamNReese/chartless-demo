import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Eye, 
  Heart, 
  Pill, 
  Stethoscope, 
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Download,
  BarChart3
} from 'lucide-react';
import { backend } from '@/lib/simulateBackend';
import { ClinicalEntity, TranscriptionResult } from '@/types';
import { mockTranscriptions, mockEntities, clinicalScenarios } from '@/lib/mockData';

const ClinicalUnderstanding: React.FC = () => {
  const [entities, setEntities] = useState<ClinicalEntity[]>(mockEntities);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>(mockTranscriptions);
  const [selectedEntity, setSelectedEntity] = useState<ClinicalEntity | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'complete'>('idle');

  useEffect(() => {
    const handleClinicalEntities = (newEntities: ClinicalEntity[]) => {
      setEntities(prev => [...prev, ...newEntities]);
    };

    const handleTranscription = (transcription: TranscriptionResult) => {
      setTranscriptions(prev => [...prev, transcription]);
      setProcessingStatus('processing');
      
      // Simulate processing delay
      setTimeout(() => {
        setProcessingStatus('complete');
      }, 1500);
    };

    backend.on('clinical-entities', handleClinicalEntities);
    backend.on('transcription', handleTranscription);

    return () => {
      backend.off('clinical-entities', handleClinicalEntities);
      backend.off('transcription', handleTranscription);
    };
  }, []);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'symptom': return <AlertTriangle className="h-4 w-4" />;
      case 'diagnosis': return <Stethoscope className="h-4 w-4" />;
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'vital': return <Heart className="h-4 w-4" />;
      case 'procedure': return <Eye className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'symptom': return 'bg-red-50 text-red-700 border-red-200';
      case 'diagnosis': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'medication': return 'bg-green-50 text-green-700 border-green-200';
      case 'vital': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'procedure': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredEntities = entities.filter(entity => {
    const matchesType = filterType === 'all' || entity.type === filterType;
    const matchesSearch = entity.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.context?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const entityStats = {
    total: entities.length,
    symptoms: entities.filter(e => e.type === 'symptom').length,
    diagnoses: entities.filter(e => e.type === 'diagnosis').length,
    medications: entities.filter(e => e.type === 'medication').length,
    vitals: entities.filter(e => e.type === 'vital').length,
    avgConfidence: entities.reduce((acc, e) => acc + e.confidence, 0) / entities.length || 0
  };

  const loadScenario = (scenarioName: string) => {
    const scenario = clinicalScenarios.find(s => s.name === scenarioName);
    if (scenario) {
      setSelectedScenario(scenarioName);
      setProcessingStatus('processing');
      
      // Simulate processing
      setTimeout(() => {
        const newEntities = scenario.entities.map((entity, index) => ({
          id: `entity_${Date.now()}_${index}`,
          type: entity.type as any,
          value: entity.value,
          confidence: entity.confidence,
          context: `From ${scenarioName} scenario`,
          icd10: entity.type === 'diagnosis' ? 'I25.9' : undefined,
          snomedCt: '123456789'
        }));
        setEntities(prev => [...prev, ...newEntities]);
        setProcessingStatus('complete');
      }, 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinical Understanding</h1>
          <p className="text-gray-600 mt-2">
            AI-powered extraction and analysis of clinical entities from medical conversations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            processingStatus === 'processing' 
              ? 'bg-blue-100 text-blue-700' 
              : processingStatus === 'complete' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
          }`}>
            {processingStatus === 'processing' && <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
            {processingStatus === 'complete' && <CheckCircle className="h-4 w-4" />}
            <span>
              {processingStatus === 'processing' ? 'Processing...' : 
               processingStatus === 'complete' ? 'Analysis Complete' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{entityStats.total}</p>
            <p className="text-sm text-gray-600">Total Entities</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{entityStats.symptoms}</p>
            <p className="text-sm text-gray-600">Symptoms</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{entityStats.diagnoses}</p>
            <p className="text-sm text-gray-600">Diagnoses</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{entityStats.medications}</p>
            <p className="text-sm text-gray-600">Medications</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{entityStats.vitals}</p>
            <p className="text-sm text-gray-600">Vitals</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{(entityStats.avgConfidence * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Avg Confidence</p>
          </div>
        </div>
      </div>

      {/* Demo Scenarios */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Demo Scenarios</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clinicalScenarios.map((scenario) => (
            <button
              key={scenario.name}
              onClick={() => loadScenario(scenario.name)}
              className={`p-4 text-left rounded-lg border-2 transition-colors ${
                selectedScenario === scenario.name
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-2">{scenario.name}</h3>
              <p className="text-sm text-gray-600">
                {scenario.entities.length} entities will be extracted
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Types</option>
            <option value="symptom">Symptoms</option>
            <option value="diagnosis">Diagnoses</option>
            <option value="medication">Medications</option>
            <option value="vital">Vitals</option>
            <option value="procedure">Procedures</option>
          </select>
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Entity List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Extracted Entities</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {filteredEntities.map((entity) => (
              <div
                key={entity.id}
                onClick={() => setSelectedEntity(entity)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedEntity?.id === entity.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg border ${getEntityColor(entity.type)}`}>
                      {getEntityIcon(entity.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{entity.value}</h3>
                      <p className="text-sm text-gray-600 capitalize">{entity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getConfidenceColor(entity.confidence)}`}>
                      {(entity.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">confidence</p>
                  </div>
                </div>
                {entity.context && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{entity.context}"</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Entity Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Entity Details</h2>
          </div>
          {selectedEntity ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg border ${getEntityColor(selectedEntity.type)}`}>
                  {getEntityIcon(selectedEntity.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEntity.value}</h3>
                  <p className="text-gray-600 capitalize">{selectedEntity.type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Confidence</p>
                  <p className={`text-lg font-semibold ${getConfidenceColor(selectedEntity.confidence)}`}>
                    {(selectedEntity.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{selectedEntity.type}</p>
                </div>
              </div>

              {selectedEntity.context && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Context</p>
                  <p className="text-gray-600 p-3 bg-gray-50 rounded-lg italic">
                    "{selectedEntity.context}"
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {selectedEntity.icd10 && (
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm font-medium text-blue-700">ICD-10</span>
                    <span className="text-sm text-blue-600">{selectedEntity.icd10}</span>
                  </div>
                )}
                {selectedEntity.snomedCt && (
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium text-green-700">SNOMED CT</span>
                    <span className="text-sm text-green-600">{selectedEntity.snomedCt}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select an entity to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Processing Pipeline */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Processing Pipeline</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Text Analysis</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Entity Extraction</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">3</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Code Mapping</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">4</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Validation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalUnderstanding;