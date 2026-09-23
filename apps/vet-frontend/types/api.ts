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
  // Code de refus, quand le backend en précise un (ex. TOKEN_EXPIRED), pour que
  // l'appelant puisse proposer l'issue adaptée plutôt qu'un message générique.
  code?: string
}
