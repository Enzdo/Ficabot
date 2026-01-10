import vine from '@vinejs/vine'
import { ANALYSIS_LIMITS } from '#services/ai/prompts'

export const createPreDiagnosisValidator = vine.compile(
    vine.object({
        description: vine
            .string()
            .minLength(ANALYSIS_LIMITS.minDescriptionLength)
            .maxLength(ANALYSIS_LIMITS.maxDescriptionLength),
        petAge: vine.number().positive().optional(),
        urgentSymptoms: vine.boolean().optional(),
        images: vine
            .array(vine.file({
                size: `${ANALYSIS_LIMITS.maxImageSizeMB}mb`,
                extnames: ANALYSIS_LIMITS.allowedImageFormats,
            }))
            .minLength(1)
            .maxLength(ANALYSIS_LIMITS.maxImagesPerRequest),
    })
)
