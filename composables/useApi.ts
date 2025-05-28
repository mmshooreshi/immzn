export const useApi = () => {
  return (url: string, opts: any) => useFetch(url, opts)
}
