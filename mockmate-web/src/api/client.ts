const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5046'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the API running?')
  }

  if (!response.ok) {
    let message = 'Something went wrong.'
    try {
      const problem = await response.json()
      message = problem.detail ?? problem.title ?? message
    } catch {
      //
    }
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as T
}