/**
 * Conservation locale de la dictée en cours.
 *
 * Le serveur ne garde pas l'audio : il le supprime dès la transcription faite.
 * C'est donc ici, sur la machine du praticien, que vit la seule copie pendant
 * le traitement — d'où IndexedDB plutôt que la mémoire, qui ne survit ni à la
 * fermeture de l'onglet ni à un rechargement.
 *
 * Un seul enregistrement à la fois : une dictée en cours en remplace une
 * précédente restée en souffrance.
 */

const DB_NAME = 'ficana-dictation'
const STORE = 'pending'
const KEY = 'current'
const DB_VERSION = 1

export interface PendingDictation {
  /** Identifiant renvoyé par le serveur ; absent tant que l'envoi n'a pas abouti. */
  dictationId: number | null
  blob: Blob
  ext: string
  token: string
  templateId: string
  language: string
  instruction: string
  savedAt: number
}

const open = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const tx = async <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

/**
 * Toutes les opérations échouent en silence : le navigateur peut refuser
 * IndexedDB (navigation privée, quota, réglages). La dictée continue alors
 * sans filet plutôt que de s'interrompre — on ne bloque jamais un praticien
 * pour un confort de reprise.
 */
const isAvailable = () => typeof indexedDB !== 'undefined'

export const savePending = async (entry: PendingDictation): Promise<boolean> => {
  if (!isAvailable()) return false
  try {
    await tx('readwrite', (store) => store.put(entry, KEY))
    return true
  } catch {
    return false
  }
}

export const readPending = async (): Promise<PendingDictation | null> => {
  if (!isAvailable()) return null
  try {
    const entry = await tx<PendingDictation | undefined>('readonly', (store) => store.get(KEY))
    if (!entry?.blob) return null
    return entry
  } catch {
    return null
  }
}

/** Associe l'identifiant serveur à l'audio déjà conservé, une fois l'envoi accepté. */
export const attachDictationId = async (dictationId: number): Promise<void> => {
  const entry = await readPending()
  if (!entry) return
  await savePending({ ...entry, dictationId })
}

export const clearPending = async (): Promise<void> => {
  if (!isAvailable()) return
  try {
    await tx('readwrite', (store) => store.delete(KEY))
  } catch {
    /* rien à nettoyer, ou stockage indisponible */
  }
}
