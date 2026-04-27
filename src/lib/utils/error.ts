export const getErrorMessage = (err: any): string => {
  if (!err) return "An unknown error occurred"

  // Network error (server down, timeout, etc.)
  if (!err.response) {
    if (err.code === 'ECONNABORTED') return "The request timed out. Please check your internet connection."
    // if (err.message === 'Network Error') return "Unable to connect to the server. Please ensure the backend is running."
    if (err.message === 'Network Error') return "Unable to connect to the server!"
    return err.message || "A network error occurred. Please try again."
  }

  // Server-side error with message
  if (err.response.data?.message) {
    return err.response.data.message
  }

  // Fallback based on status code
  const status = err.response.status
  if (status === 401) return "Session expired. Please log in again."
  if (status === 403) return "You do not have permission to perform this action."
  if (status === 404) return "The requested resource was not found."
  if (status >= 500) return "Server error. Our team has been notified."

  return "Something went wrong. Please try again."
}
