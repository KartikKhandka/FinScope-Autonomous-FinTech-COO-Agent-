const ACCESS_TOKEN_KEY = 'access_token';
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event('token_change'));
}
export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event('token_change'));
}
export function isAuthenticated() {
  return Boolean(getAccessToken());
}