import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message);

  if (res.headersSent) return;

  res.status(500).json({
    error: '¡Algo salió mal en el reino, héroe! Inténtalo de nuevo.',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `La ruta ${req.method} ${req.path} no existe en este reino.`,
  });
}
