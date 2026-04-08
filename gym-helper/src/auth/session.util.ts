import type { Request } from 'express';

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error('Unexpected session error.');
}

function regenerateSession(request: Request) {
  return new Promise<void>((resolve, reject) => {
    request.session.regenerate((error) => {
      if (error) {
        reject(toError(error));
        return;
      }

      resolve();
    });
  });
}

function saveSession(request: Request) {
  return new Promise<void>((resolve, reject) => {
    request.session.save((error) => {
      if (error) {
        reject(toError(error));
        return;
      }

      resolve();
    });
  });
}

export async function establishUserSession(request: Request, userId: string) {
  await regenerateSession(request);
  request.session.userId = userId;
  await saveSession(request);
}

export function destroyUserSession(request: Request) {
  return new Promise<void>((resolve, reject) => {
    request.session.destroy((error) => {
      if (error) {
        reject(toError(error));
        return;
      }

      resolve();
    });
  });
}
