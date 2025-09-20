export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

export function handleApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new ServerError('Network error. Please check your connection.')
  }

  if (error.response) {
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return new ValidationError(
          data.message || 'Invalid request',
          data.details
        )
      case 401:
        return new AuthenticationError(data.message)
      case 403:
        return new AuthorizationError(data.message)
      case 404:
        return new NotFoundError(data.message)
      case 429:
        return new RateLimitError(data.message)
      case 500:
        return new ServerError(data.message)
      default:
        return new ApiError(
          data.message || 'An error occurred',
          status,
          data.code
        )
    }
  }

  return new ServerError(error.message || 'An unexpected error occurred')
}

export function getErrorMessage(error: any): string {
  const apiError = handleApiError(error)
  return apiError.message
}

export function getErrorCode(error: any): string | undefined {
  const apiError = handleApiError(error)
  return apiError.code
}

export function isRetryableError(error: any): boolean {
  const apiError = handleApiError(error)
  return apiError.status >= 500 || apiError.status === 429
}

