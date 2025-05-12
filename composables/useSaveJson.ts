// composables/useSaveJson.ts
export const saveEditedJson = async (data: any) => {
    const res = await fetch('/api/save-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  
    if (!res.ok) {
      throw new Error('Save failed')
    }
  }
  
  export default saveEditedJson