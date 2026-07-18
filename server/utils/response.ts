export function successResponse(data: any, message: string = 'Success') {
  return {
    success: true,
    message,
    data
  }
}

export function errorResponse(event: any, statusCode: number, message: string, details?: any) {
  if (event) {
    setResponseStatus(event, statusCode)
  }
  return {
    statusCode,
    statusMessage: message,
    success: false,
    message,
    details,
    data: {
      success: false,
      message,
      details
    }
  }
}
