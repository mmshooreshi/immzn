
// ───────────────────────────────────────────────────────────
// composables/useBase64File.ts  (unchanged)
// ───────────────────────────────────────────────────────────
export async function useBase64File(file: File) {
  return new Promise<{ base64: string }>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve({ base64: String(reader.result) })
    reader.readAsDataURL(file)
  })
}