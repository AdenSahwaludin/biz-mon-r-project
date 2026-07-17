export function successResponse(data: any, message: string = 'Success') {
  return {
    success: true,
    message,
    data
  }
}

export function errorResponse(event: any, statusCode: number, message: string, details?: any) {
  setResponseStatus(event, statusCode)
  return {
    success: false,
    message,
    details
  }
}
