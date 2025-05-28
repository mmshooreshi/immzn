export function createAvatarUrl () {
  const seed = crypto.getRandomValues(new Uint32Array(4)).join('')
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}&radius=50`
}
