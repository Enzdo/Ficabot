/**
 * Composable pour gérer les updates optimistes (Optimistic UI)
 * Permet d'updater l'UI immédiatement et de rollback en cas d'erreur
 */

interface OptimisticUpdate<T> {
  apply: () => T // Function to apply the optimistic update
  rollback: (previousState: T) => void // Function to rollback if failed
  execute: () => Promise<any> // Async function to execute the actual API call
}

export const useOptimistic = () => {
  const toast = useToast()

  /**
   * Execute an optimistic update
   * 1. Apply the optimistic change immediately
   * 2. Execute the API call in background
   * 3. Rollback if it fails
   */
  const executeOptimistic = async <T>(update: OptimisticUpdate<T>) => {
    // 1. Apply optimistic update
    const previousState = update.apply()

    try {
      // 2. Execute actual API call
      const result = await update.execute()
      return { success: true, data: result }
    } catch (error: any) {
      // 3. Rollback on error
      update.rollback(previousState)

      // Show error toast
      toast.error(error.message || 'Une erreur est survenue')

      return { success: false, error }
    }
  }

  return {
    executeOptimistic
  }
}
