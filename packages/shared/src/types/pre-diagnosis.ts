// Pre-Diagnosis Types
export type PreDiagnosisStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'
export type AIModel = 'claude' | 'gpt' | 'gemini'
export type AIResponseStatus = 'success' | 'failed'
export type HypothesisConfidence = 'high' | 'medium' | 'low'

export interface PreDiagnosis {
    id: string
    petId: string
    userId: string
    veterinarianId: string | null
    species: 'dog' | 'cat'
    userDescription: string
    imageUrls: string[]
    status: PreDiagnosisStatus
    urgencyLevel: UrgencyLevel | null
    createdAt: Date
    completedAt: Date | null
}

export interface AIResponse {
    id: string
    preDiagnosisId: string
    model: AIModel
    rawResponse: object
    hypotheses: AIHypothesis[]
    urgentSigns: string[]
    confidence: number
    processingTimeMs: number
    status: AIResponseStatus
    errorMessage: string | null
    createdAt: Date
}

export interface AIHypothesis {
    condition: string
    likelihood: HypothesisConfidence
    reasoning: string
    visualClues: string[]
}

export interface SynthesisResult {
    id: string
    preDiagnosisId: string
    prioritizedHypotheses: PrioritizedHypothesis[]
    urgentSigns: UrgentSign[]
    generalRecommendations: string[]
    userFriendlySummary: string
    disclaimer: string
    overallUrgency: UrgencyLevel
    synthesizedAt: Date
}

export interface PrioritizedHypothesis {
    hypothesis: string
    confidence: HypothesisConfidence
    mentionedBy: AIModel[]
    explanation: string
    visualEvidence: string[]
}

export interface UrgentSign {
    sign: string
    severity: 'critical' | 'high' | 'medium'
    action: string
}

export interface AuditLog {
    id: string
    preDiagnosisId: string
    userId: string
    veterinarianId: string | null
    action: 'created' | 'ai_analyzed' | 'synthesized' | 'viewed' | 'shared' | 'downloaded'
    ipAddress: string
    userAgent: string
    disclaimerAccepted: boolean
    metadata: object
    createdAt: Date
}

// DTOs
export interface CreatePreDiagnosisDTO {
    description: string
    petAge?: number
    urgentSymptoms?: boolean
}

export interface PreDiagnosisResultDTO {
    id: string
    status: PreDiagnosisStatus
    synthesis?: SynthesisResult
    veterinarian?: {
        name: string
        nextAvailabilities: Date[]
        urgentContact: string
    }
    createdAt: Date
    completedAt: Date | null
}

// AI Service Responses
export interface AIAnalysisContext {
    species: 'dog' | 'cat'
    breed?: string
    age?: number
    medicalHistory: string
    userDescription: string
    imageUrls: string[]
    imageCount: number
}

export interface AIAnalysisResponse {
    hypotheses: AIHypothesis[]
    urgentSigns: string[]
    recommendations: string[]
    confidence: number
    notes: string
}
