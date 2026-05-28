export const getErrorMessage = (err: any): string => {
  if (!err) return "An unknown error occurred"

  // Network error (server down, timeout, etc.)
  if (!err.response) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return "OFFLINE_SILENT" // Unique token so callers can ignore it
    }
    if (err.code === 'ECONNABORTED') return "The request timed out. Please check your internet connection."
    if (err.message === 'Network Error') return "Unable to connect to the server!"
    return err.message || "A network error occurred. Please try again."
  }

  // Server-side error with data (handle arrays of validation errors)
  const data = err.response.data
  if (Array.isArray(data)) {
    return data.map(e => e.message || "Invalid input").join(". ")
  }
  if (typeof data === 'object' && data !== null) {
    if (data.message) {
      if (Array.isArray(data.message)) {
        return data.message.map((e: any) => e.message || e).join(". ")
      }
      if (typeof data.message === 'string' && data.message.trim().startsWith('[') && data.message.includes('"message"')) {
        try {
          const parsed = JSON.parse(data.message)
          if (Array.isArray(parsed) && parsed[0]?.message) {
            return parsed.map((e: any) => e.message).join(". ")
          }
        } catch (e) {}
      }
      return data.message
    }
    if (data.error) return data.error
  }

  // Fallback based on status code
  const status = err.response.status
  if (status === 401) return "Session expired. Please log in again."
  if (status === 403) return "You do not have permission to perform this action."
  if (status === 404) return "The requested resource was not found."
  if (status >= 500) return "The server encountered an error. Please try again later."

  return "Something went wrong. Please try again."
}
