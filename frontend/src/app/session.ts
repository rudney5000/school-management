import { baseApi } from '@shared/api/instance';
import { store } from '@shared/store';
import { logout, setCredentials } from '@features/auth/store/auth-slice';
import { credentialsFromTokens } from '@features/auth/model/credentials';
import { router } from '@app/router';
import i18n from '@app/i18n/i18n';
import { closeChatSocket } from '@entities/chat';

/**
 * Keeps the session in step with the API client: a renewed token pair goes to
 * the store, with the role and school it carries, and a session that can no longer
 * be renewed ends on the login page instead of leaving every request failing.
 */
export function wireSession(): void {
  baseApi.setTokensRefreshedHandler((tokens) => {
    // The renewed token is rebuilt by the backend, so its role and school may
    // have changed: the store follows it, not just the tokens.
    store.dispatch(setCredentials(credentialsFromTokens(tokens)));
  });

  baseApi.setUnauthorizedHandler(() => {
    if (!store.getState().auth.isAuthenticated) return;
    store.dispatch(logout());
    void router.navigate({ to: '/$locale/login', params: { locale: i18n.language || 'fr' } });
  });

  // Whatever signs the user out (the menu, the sidebar, a refused renewal), the
  // chat connection goes with the session, even when no chat screen is open.
  let wasAuthenticated = store.getState().auth.isAuthenticated;
  store.subscribe(() => {
    const isAuthenticated = store.getState().auth.isAuthenticated;
    if (wasAuthenticated && !isAuthenticated) closeChatSocket();
    wasAuthenticated = isAuthenticated;
  });
}
