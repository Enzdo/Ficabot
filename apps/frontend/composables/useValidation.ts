import { ref, computed } from 'vue'
import type { Ref } from 'vue'

export interface ValidationRule {
    validate: (value: any) => boolean
    message: string
}

export interface ValidationResult {
    valid: boolean
    errors: string[]
}

/**
 * Composable for form validation with reusable validators
 */
export const useValidation = () => {
    /**
     * Validate required field
     */
    const required = (message = 'Ce champ est requis'): ValidationRule => ({
        validate: (value) => {
            if (value === null || value === undefined) return false
            if (typeof value === 'string') return value.trim().length > 0
            if (Array.isArray(value)) return value.length > 0
            return true
        },
        message
    })

    /**
     * Validate email format
     */
    const email = (message = 'Email invalide'): ValidationRule => ({
        validate: (value) => {
            if (!value) return true // Optional by default
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailRegex.test(value)
        },
        message
    })

    /**
     * Validate phone number (French format)
     */
    const phone = (locale: 'fr' | 'international' = 'fr', message = 'Numéro de téléphone invalide'): ValidationRule => ({
        validate: (value) => {
            if (!value) return true // Optional by default
            const cleaned = value.replace(/\s/g, '')

            if (locale === 'fr') {
                // French: 0612345678 or +33612345678
                return /^(\+33|0)[1-9](\d{8})$/.test(cleaned)
            } else {
                // International: at least 7 digits
                return /^(\+?\d{7,15})$/.test(cleaned)
            }
        },
        message
    })

    /**
     * Validate weight (in kg)
     */
    const weight = (message = 'Poids invalide (entre 0.1 et 200kg)'): ValidationRule => ({
        validate: (value) => {
            if (!value) return true // Optional by default
            const num = parseFloat(value)
            return !isNaN(num) && num >= 0.1 && num <= 200
        },
        message
    })

    /**
     * Validate date
     */
    const date = (options: {
        allowFuture?: boolean
        allowPast?: boolean
        minDate?: Date
        maxDate?: Date
        message?: string
    } = {}): ValidationRule => {
        const {
            allowFuture = true,
            allowPast = true,
            minDate,
            maxDate,
            message = 'Date invalide'
        } = options

        return {
            validate: (value) => {
                if (!value) return true // Optional by default

                const inputDate = new Date(value)
                const now = new Date()
                now.setHours(0, 0, 0, 0)
                inputDate.setHours(0, 0, 0, 0)

                if (isNaN(inputDate.getTime())) return false

                if (!allowFuture && inputDate > now) return false
                if (!allowPast && inputDate < now) return false
                if (minDate && inputDate < minDate) return false
                if (maxDate && inputDate > maxDate) return false

                return true
            },
            message
        }
    }

    /**
     * Validate minimum length
     */
    const minLength = (min: number, message?: string): ValidationRule => ({
        validate: (value) => {
            if (!value) return true
            return value.length >= min
        },
        message: message || `Minimum ${min} caractères`
    })

    /**
     * Validate maximum length
     */
    const maxLength = (max: number, message?: string): ValidationRule => ({
        validate: (value) => {
            if (!value) return true
            return value.length <= max
        },
        message: message || `Maximum ${max} caractères`
    })

    /**
     * Validate number range
     */
    const range = (min: number, max: number, message?: string): ValidationRule => ({
        validate: (value) => {
            if (!value && value !== 0) return true
            const num = parseFloat(value)
            return !isNaN(num) && num >= min && num <= max
        },
        message: message || `Doit être entre ${min} et ${max}`
    })

    /**
     * Validate a value against multiple rules
     */
    const validateField = (value: any, rules: ValidationRule[]): ValidationResult => {
        const errors: string[] = []

        for (const rule of rules) {
            if (!rule.validate(value)) {
                errors.push(rule.message)
            }
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }

    /**
     * Create a reactive field validator
     */
    const useField = (initialValue: any = '', rules: ValidationRule[] = []) => {
        const value = ref(initialValue)
        const touched = ref(false)
        const errors = ref<string[]>([])

        const validate = () => {
            const result = validateField(value.value, rules)
            errors.value = result.errors
            return result.valid
        }

        const isValid = computed(() => errors.value.length === 0)
        const hasErrors = computed(() => errors.value.length > 0)
        const showErrors = computed(() => touched.value && hasErrors.value)

        const blur = () => {
            touched.value = true
            validate()
        }

        const reset = () => {
            value.value = initialValue
            touched.value = false
            errors.value = []
        }

        return {
            value,
            errors,
            isValid,
            hasErrors,
            showErrors,
            touched,
            validate,
            blur,
            reset
        }
    }

    return {
        // Validators
        required,
        email,
        phone,
        weight,
        date,
        minLength,
        maxLength,
        range,

        // Helpers
        validateField,
        useField
    }
}
