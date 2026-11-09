/** Lightweight same-origin guard for browser mutation requests.
 * SameSite=Lax cookies remain the primary CSRF defence; when browsers send an
 * Origin header, reject cross-origin mutations as a second layer.
 */
export function isSameOriginMutation(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    // Non-browser clients may omit Origin. SameSite cookies prevent ambient
    // cross-site cookie submission; production APIs should additionally rate-limit.
    return request.headers.get('sec-fetch-site') !== 'cross-site';
  }
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
