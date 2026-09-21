// Enveloppe de réponse de l'API backend.
//
// Reprise de packages/shared/src/types/index.ts. Elle est dupliquée ici pour
// que cette app se construise seule, sans le reste du monorepo : c'était la
// seule chose qu'elle importait de @ficabot/shared, et un `import type` est
// de toute façon effacé à la compilation.
// Si le contrat d'API change, répercuter des deux côtés.
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}
