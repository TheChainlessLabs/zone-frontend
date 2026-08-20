export async function GET() {
  // TODO: Implement actual account check by:
  // 1. Getting user wallet/session from request headers
  // 2. Querying backend to check if account exists
  // For now, return false to always show signup form

  return Response.json({
    hasAccount: false,
  })
}
