export function signInWithGoogle(): never {
  throw new Error('Not implemented in test environment')
}

export async function signOutOfApp(): Promise<void> {}

export async function upsertUserProfile(): Promise<never> {
  throw new Error('Not implemented in test environment')
}

export function subscribeToAuthChanges(
  onChange: (user: null) => void,
): () => void {
  onChange(null)
  return () => {}
}
