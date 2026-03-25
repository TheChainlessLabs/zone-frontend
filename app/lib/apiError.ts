export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let message: string;
    try {
      const body = await res.json();
      message = body.message ?? res.statusText;
    } catch {
      message = res.statusText;
    }
    return new ApiError(res.status, message);
  }
}
