export interface ApiMessagePayload {
  error?: string;
  message?: string;
  details?: string;
}

export async function extractErrorMessage(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as ApiMessagePayload | null;
  return payload?.error || payload?.message || payload?.details || fallbackMessage;
}

export async function fetchJson<T>(input: RequestInfo | URL, init: RequestInit = {}, fallbackMessage = 'Request failed') {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, fallbackMessage));
  }
  return response.json() as Promise<T>;
}

export function getAdminHeaders(headers: HeadersInit = {}) {
  const result = new Headers(headers);
  const token = localStorage.getItem('admin_token');

  if (token) {
    result.set('Authorization', `Bearer ${token}`);
  }

  return result;
}

export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: getAdminHeaders(init.headers),
  });
}

export function adminJson<T>(input: RequestInfo | URL, init: RequestInit = {}, fallbackMessage = 'Admin request failed') {
  return fetchJson<T>(
    input,
    {
      ...init,
      headers: getAdminHeaders(init.headers),
    },
    fallbackMessage
  );
}
