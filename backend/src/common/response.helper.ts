export function successResponse(data: any, message: string) {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(message: string) {
  return {
    success: false,
    data: [],
    message,
  };
}