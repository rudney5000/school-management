import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export type RefreshedTokens = { accessToken: string; refreshToken: string };

const REFRESH_TOKEN_KEY = 'refreshToken';

/** How a renewal ended: `rejected` means the session is over and has been cleared. */
export type RenewOutcome =
  | { kind: 'renewed'; accessToken: string }
  | { kind: 'rejected' }
  | { kind: 'unavailable' }
  | { kind: 'superseded' };

type SessionConfig = InternalAxiosRequestConfig & { _retried?: boolean; _session?: string | null };

/** Calls that must never trigger a refresh: they are how a session starts or renews. */
const isAuthCall = (url = '') => /\/auth\/(login|refresh|logout)(?:[/?#]|$)/.test(url);

/**
 * Who the session belongs to. Not the refresh token: every renewal issues a new
 * one, and requests sent before a renewal still belong to the same session.
 */
const SESSION_KEY = 'userId';

export class BaseApi {
  private _token: string | null = null;
  private _axiosInstance: AxiosInstance;
  private _onUnauthorized: (() => void) | null = null;
  private _onTokensRefreshed: ((tokens: RefreshedTokens) => void) | null = null;
  /** One renewal at a time: requests failing together all wait for the same one. */
  private _renewing: Promise<RenewOutcome> | null = null;
  private readonly _baseURL: string;

  constructor(baseURL: string) {
    this._baseURL = baseURL;
    this._token = localStorage.getItem('accessToken');
    this._axiosInstance = this._createInstance(baseURL);
  }

  public get axiosInstance(): AxiosInstance {
    return this._axiosInstance;
  }

  public get hasToken(): boolean {
    return this._token !== null;
  }

  public setUnauthorizedHandler(handler: () => void): void {
    this._onUnauthorized = handler;
  }

  /** Lets the app keep its own copy of the tokens (the store, the chat socket) in step. */
  public setTokensRefreshedHandler(handler: (tokens: RefreshedTokens) => void): void {
    this._onTokensRefreshed = handler;
  }

  public saveToken(token: string): void {
    this._token = token;
    localStorage.setItem('accessToken', token);
    this._axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public clearToken(): void {
    this._token = null;
    localStorage.removeItem('accessToken');
    delete this._axiosInstance.defaults.headers.common['Authorization'];
  }

  public async send<T>(promise: Promise<T>): Promise<[T | null, unknown]> {
    try {
      const result = await promise;
      return [result, null];
    } catch (error) {
      return [null, error];
    }
  }

  public get<T>(url: string, params?: object) {
    return this.send(this._axiosInstance.get<T>(url, { params }));
  }

  public post<T>(url: string, data?: unknown, params?: object) {
    return this.send(this._axiosInstance.post<T>(url, data, { params }));
  }

  public patch<T>(url: string, data?: unknown, params?: object) {
    return this.send(this._axiosInstance.patch<T>(url, data, { params }));
  }

  public put<T>(url: string, data?: unknown) {
    return this.send(this._axiosInstance.put<T>(url, data));
  }

  public delete<T>(url: string, params?: object) {
    return this.send(this._axiosInstance.delete<T>(url, { params }));
  }

  private _createInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(this._token ? { Authorization: `Bearer ${this._token}` } : {}),
      },
    });

    instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        // Which session sent it, so a reply that arrives after a change of
        // account is never replayed under the new one.
        (config as SessionConfig)._session = localStorage.getItem(SESSION_KEY);
        return config;
      },
      (error) => Promise.reject(error),
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as SessionConfig | undefined;

        if (error.response?.status !== 401 || !original || isAuthCall(original.url)) {
          return Promise.reject(error);
        }

        // A replay that is refused again is a real refusal, not an expired token.
        if (original._retried) return Promise.reject(error);
        original._retried = true;

        // Signed out, or into another account, since this request left.
        if (localStorage.getItem(SESSION_KEY) !== original._session) {
          return Promise.reject(error);
        }

        // Another request may already have renewed the token while this one
        // was in flight: then the new token is used as is.
        const sentToken = String(original.headers.Authorization ?? '').replace(/^Bearer /, '');
        const currentToken = localStorage.getItem('accessToken');
        let accessToken = sentToken && currentToken !== sentToken ? currentToken : null;

        if (!accessToken) {
          const outcome = await this.renewSession();
          if (outcome.kind === 'renewed') accessToken = outcome.accessToken;
          // Renewed by another tab meanwhile: same user, so its token will do.
          else if (
            outcome.kind === 'superseded' &&
            localStorage.getItem(SESSION_KEY) === original._session
          ) {
            accessToken = localStorage.getItem('accessToken');
          }
          if (!accessToken) return Promise.reject(error);
        }

        original.headers.Authorization = `Bearer ${accessToken}`;
        return instance(original);
      },
    );

    return instance;
  }

  /**
   * Renews the access token with the refresh token. Only a refused refresh token
   * ends the session: a network failure or a server error leaves it intact, so a
   * flaky connection does not sign anyone out. One renewal at a time.
   */
  public renewSession(): Promise<RenewOutcome> {
    this._renewing ??= this._renew().finally(() => {
      this._renewing = null;
    });
    return this._renewing;
  }

  private async _renew(): Promise<RenewOutcome> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return this._endSession();

    let tokens: RefreshedTokens;
    try {
      // A bare axios call: going through the instance would loop on its own 401.
      const response = await axios.post<{ data: RefreshedTokens }>(
        `${this._baseURL}/auth/refresh`,
        { refreshToken },
      );
      tokens = response.data.data;
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if (status === undefined || status >= 500) return { kind: 'unavailable' };
      // Refused: unless the user changed account meanwhile, the session is over.
      return localStorage.getItem(REFRESH_TOKEN_KEY) === refreshToken
        ? this._endSession()
        : { kind: 'superseded' };
    }

    // Signed out, or into another account, while the renewal was in flight:
    // keep the new state rather than bringing back the old session.
    if (localStorage.getItem(REFRESH_TOKEN_KEY) !== refreshToken) return { kind: 'superseded' };

    this.saveToken(tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    this._onTokensRefreshed?.(tokens);
    return { kind: 'renewed', accessToken: tokens.accessToken };
  }

  private _endSession(): RenewOutcome {
    this.clearToken();
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._onUnauthorized?.();
    return { kind: 'rejected' };
  }
}
