import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Check, 
  Edit3, 
  Save, 
  RefreshCw,
  FileText,
  User,
  Clock,
  Target,
  Zap,
  Eye,
  ThumbsUp,
  AlertTriangle,
  Brain,
  Heart,
  Pill,
  Stethoscope,
  Activity
} from 'lucide-react';
import { backend } from '@/lib/simulateBackend';
import { ClinicalNote, ReviewSuggestion } from '@/types';
import { mockNote, mockSuggestions, mockNotes } from '@/lib/mockData';

const SmartReview: React.FC = () => {
  const [notes, setNotes] = useState<ClinicalNote[]>(mockNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(mockNotes[0]?.id || '');
  const [note, setNote] = useState<ClinicalNote>(mockNotes[0] || mockNote);
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>(mockSuggestions);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const handleReviewSuggestions = (newSuggestions: ReviewSuggestion[]) => {
      setSuggestions(newSuggestions);
    };

    backend.on('review-suggestions', handleReviewSuggestions);

    return () => {
      backend.off('review-suggestions', handleReviewSuggestions);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-purple-100 text-purple-800';
      case 'completeness': return 'bg-orange-100 text-orange-800';
      case 'grammar': return 'bg-green-100 text-green-800';
      case 'coding': return 'bg-blue-100 text-blue-800';
      case 'structure': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startEditing = (section: string, content: string) => {
    setIsEditing(section);
    setEditedContent(content);
  };

  const saveEdit = async () => {
    if (!isEditing) return;

    const updates = {
      ...note,
      structuredData: {
        ...note.structuredData,
        [isEditing]: editedContent
      }
    };

    try {
      const updatedNote = await backend.updateNote(note.id, updates);
      setNote(updatedNote);
      setIsEditing(null);
      setEditedContent('');
      
      // Re-analyze after edit
      analyzeNote();
    } catch (error) {
      console.error('Failed to save edit:', error);
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditedContent('');
  };

  const analyzeNote = async () => {
    setIsAnalyzing(true);
    try {
      const newSuggestions = await backend.analyzeNote(note.id);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to analyze note:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: ReviewSuggestion) => {
    if (!suggestion.autoFixable) return;

    const newAppliedSuggestions = new Set(appliedSuggestions);
    newAppliedSuggestions.add(suggestion.id);
    setAppliedSuggestions(newAppliedSuggestions);

    // Simulate applying the suggestion
    setTimeout(() => {
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    }, 1000);
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const selectNote = (noteId: string) => {
    const selectedNote = notes.find(n => n.id === noteId);
    if (selectedNote) {
      setSelectedNoteId(noteId);
      setNote(selectedNote);
      setIsEditing(null);
      setEditedContent('');
      setIsApproved(selectedNote.status === 'finalized');
      setIsApproving(false);
      
      // Generate suggestions for the selected note
      setSuggestions(generateSuggestionsForNote(selectedNote));
    }
  };

  const generateSuggestionsForNote = (note: ClinicalNote): ReviewSuggestion[] => {
    const suggestions: ReviewSuggestion[] = [];
    
    // Generate suggestions based on note status and content
    if (note.status === 'draft') {
      if (!note.structuredData.reviewOfSystems) {
        suggestions.push({
          id: `suggestion_${note.id}_1`,
          type: 'completeness',
          severity: 'warning',
          message: 'Review of systems section is missing',
          location: { section: 'reviewOfSystems' },
          suggestion: 'Add review of systems to enhance documentation completeness',
          autoFixable: false
        });
      }
      
      if (note.structuredData.chiefComplaint?.toLowerCase().includes('chest pain')) {
        suggestions.push({
          id: `suggestion_${note.id}_2`,
          type: 'medical',
          severity: 'error',
          message: 'Consider ordering troponin levels for chest pain evaluation',
          location: { section: 'plan' },
          suggestion: 'Add troponin levels to cardiac enzyme panel',
          autoFixable: true
        });
      }
    }
    
    return suggestions;
  };

  const approveNote = async () => {
    if (noteStats.errors > 0) {
      alert('Cannot approve note with errors. Please fix all errors before approving.');
      return;
    }

    setIsApproving(true);
    try {
      // Simulate approval process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update note status
      const approvedNote = await backend.approveNote(note.id);
      setNote(approvedNote);
      setIsApproved(true);
      
      // Update notes list
      setNotes(prev => prev.map(n => n.id === note.id ? approvedNote : n));
      
      // Show success message
      setTimeout(() => {
        alert('Note approved successfully! It has been submitted to the EHR system.');
      }, 500);
      
    } catch (error) {
      console.error('Failed to approve note:', error);
      alert('Failed to approve note. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const noteStats = {
    totalSuggestions: suggestions.length,
    errors: suggestions.filter(s => s.severity === 'error').length,
    warnings: suggestions.filter(s => s.severity === 'warning').length,
    completeness: Math.max(0, 100 - suggestions.filter(s => s.type === 'completeness').length * 20),
    wordCount: Object.values(note.structuredData).join(' ').split(' ').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'finalized': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'symptom': return <AlertTriangle className="h-4 w-4" />;
      case 'diagnosis': return <Stethoscope className="h-4 w-4" />;
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'vital': return <Heart className="h-4 w-4" />;
      case 'procedure': return <Activity className="h-4 w-4" />;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Smart Review</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Intelligent analysis and suggestions for clinical documentation
          </p>
        </div>
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={analyzeNote}
            disabled={isAnalyzing}
            className="btn btn-primary flex items-center justify-center space-x-2 min-h-[44px]"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-analyze'}</span>
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Clinical Notes</h2>
        </div>
        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              onClick={() => selectNote(n.id)}
              className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedNoteId === n.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                      {n.structuredData.chiefComplaint}
                    </h3>
                    <span className={`badge text-xs ${getStatusColor(n.status)} w-fit`}>
                      {n.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {formatTimestamp(n.timestamp)} • Patient ID: {n.patientId}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                    {n.structuredData.historyOfPresentIllness}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{n.entities.length}</p>
                    <p className="text-xs text-gray-500">Entities</p>
                  </div>
                  {selectedNoteId === n.id && (
                    <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{noteStats.totalSuggestions}</p>
            <p className="text-sm text-gray-600">Total Suggestions</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{noteStats.errors}</p>
            <p className="text-sm text-gray-600">Errors</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{noteStats.warnings}</p>
            <p className="text-sm text-gray-600">Warnings</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{noteStats.completeness}%</p>
            <p className="text-sm text-gray-600">Completeness</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{noteStats.wordCount}</p>
            <p className="text-sm text-gray-600">Words</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Note Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Approve Note Button */}
          <div className="flex justify-center sm:justify-end">
            <button 
              onClick={approveNote}
              disabled={isApproving || isApproved || note.status === 'finalized'}
              className={`btn flex items-center justify-center space-x-2 min-h-[44px] ${
                isApproved || note.status === 'finalized'
                  ? 'btn-success bg-green-600 hover:bg-green-600' 
                  : noteStats.errors > 0 
                    ? 'btn-disabled bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'btn-success'
              }`}
            >
              {isApproving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Approving...</span>
                </>
              ) : isApproved || note.status === 'finalized' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Approved</span>
                </>
              ) : (
                <>
                  <ThumbsUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Approve Note</span>
                  <span className="sm:hidden">Approve</span>
                </>
              )}
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Clinical Note</h2>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Dr. Sarah Johnson</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Chief Complaint */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Chief Complaint</h3>
                  {isEditing === 'chiefComplaint' ? (
                    <div className="flex items-center space-x-2">
                      <button onClick={saveEdit} className="btn-sm bg-green-600 text-white hover:bg-green-700">
                        <Save className="h-3 w-3" />
                      </button>
                      <button onClick={cancelEdit} className="btn-sm bg-gray-600 text-white hover:bg-gray-700">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing('chiefComplaint', note.structuredData.chiefComplaint || '')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
                {isEditing === 'chiefComplaint' ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="input min-h-[80px]"
                    placeholder="Enter chief complaint..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{note.structuredData.chiefComplaint || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* History of Present Illness */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">History of Present Illness</h3>
                  {isEditing === 'historyOfPresentIllness' ? (
                    <div className="flex items-center space-x-2">
                      <button onClick={saveEdit} className="btn-sm bg-green-600 text-white hover:bg-green-700">
                        <Save className="h-3 w-3" />
                      </button>
                      <button onClick={cancelEdit} className="btn-sm bg-gray-600 text-white hover:bg-gray-700">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing('historyOfPresentIllness', note.structuredData.historyOfPresentIllness || '')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
                {isEditing === 'historyOfPresentIllness' ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="input min-h-[120px]"
                    placeholder="Enter history of present illness..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{note.structuredData.historyOfPresentIllness || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Physical Exam */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Physical Exam</h3>
                  {isEditing === 'physicalExam' ? (
                    <div className="flex items-center space-x-2">
                      <button onClick={saveEdit} className="btn-sm bg-green-600 text-white hover:bg-green-700">
                        <Save className="h-3 w-3" />
                      </button>
                      <button onClick={cancelEdit} className="btn-sm bg-gray-600 text-white hover:bg-gray-700">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing('physicalExam', note.structuredData.physicalExam || '')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
                {isEditing === 'physicalExam' ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="input min-h-[100px]"
                    placeholder="Enter physical exam findings..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{note.structuredData.physicalExam || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Assessment */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Assessment</h3>
                  {isEditing === 'assessment' ? (
                    <div className="flex items-center space-x-2">
                      <button onClick={saveEdit} className="btn-sm bg-green-600 text-white hover:bg-green-700">
                        <Save className="h-3 w-3" />
                      </button>
                      <button onClick={cancelEdit} className="btn-sm bg-gray-600 text-white hover:bg-gray-700">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing('assessment', note.structuredData.assessment || '')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
                {isEditing === 'assessment' ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="input min-h-[100px]"
                    placeholder="Enter assessment..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{note.structuredData.assessment || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Plan */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Plan</h3>
                  {isEditing === 'plan' ? (
                    <div className="flex items-center space-x-2">
                      <button onClick={saveEdit} className="btn-sm bg-green-600 text-white hover:bg-green-700">
                        <Save className="h-3 w-3" />
                      </button>
                      <button onClick={cancelEdit} className="btn-sm bg-gray-600 text-white hover:bg-gray-700">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing('plan', note.structuredData.plan || '')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
                {isEditing === 'plan' ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="input min-h-[100px]"
                    placeholder="Enter plan..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{note.structuredData.plan || 'Not provided'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Understanding Section */}
          <div className="card">
            <div className="card-header">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Clinical Understanding</h2>
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <span className="text-xs sm:text-sm text-gray-600">{note.entities.length} entities extracted</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {note.entities.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No clinical entities extracted yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {note.entities.map((entity) => (
                    <div
                      key={entity.id}
                      className={`p-3 rounded-lg border ${getEntityColor(entity.type)}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-start space-x-2 flex-1">
                          {getEntityIcon(entity.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{entity.value}</p>
                            <p className="text-xs opacity-75 mt-1 break-words">{entity.context}</p>
                          </div>
                        </div>
                        <div className="text-right sm:text-left sm:ml-4 flex-shrink-0">
                          <p className={`text-xs font-medium ${getConfidenceColor(entity.confidence)}`}>
                            {(entity.confidence * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{entity.type}</p>
                        </div>
                      </div>
                      {(entity.icd10 || entity.snomedCt) && (
                        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs">
                            {entity.icd10 && (
                              <span className="font-mono bg-white bg-opacity-50 px-2 py-1 rounded w-fit">
                                ICD-10: {entity.icd10}
                              </span>
                            )}
                            {entity.snomedCt && (
                              <span className="font-mono bg-white bg-opacity-50 px-2 py-1 rounded w-fit">
                                SNOMED: {entity.snomedCt}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Review Suggestions</h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
              {suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No suggestions - note looks great!</p>
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-4 rounded-lg border-2 ${getSeverityColor(suggestion.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(suggestion.severity)}
                        <span className={`badge ${getTypeColor(suggestion.type)}`}>
                          {suggestion.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {suggestion.autoFixable && (
                          <button
                            onClick={() => applySuggestion(suggestion)}
                            className="btn-sm bg-green-600 text-white hover:bg-green-700"
                            disabled={appliedSuggestions.has(suggestion.id)}
                          >
                            {appliedSuggestions.has(suggestion.id) ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Applying...</span>
                              </div>
                            ) : (
                              <>
                                <Zap className="h-3 w-3" />
                                <span>Fix</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => dismissSuggestion(suggestion.id)}
                          className="btn-sm bg-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">{suggestion.message}</p>
                    <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Review Progress */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Review Progress</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completeness</span>
                <span className="text-sm font-medium text-gray-900">{noteStats.completeness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${noteStats.completeness}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-600">{noteStats.errors}</p>
                  <p className="text-sm text-gray-600">Errors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{noteStats.warnings}</p>
                  <p className="text-sm text-gray-600">Warnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartReview;