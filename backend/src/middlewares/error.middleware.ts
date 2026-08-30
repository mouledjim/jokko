import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ [Backend Error] :', err.message, err.stack)

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Une erreur interne est survenue sur le serveur.',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  })
}
