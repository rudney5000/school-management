import { type RefObject, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { io, type Socket } from 'socket.io-client';
import { baseApi } from '@shared/api/instance';
import { chatActions } from '@entities/chat';
import { selectAccessToken } from '@features/auth/model/selectors';
import type { AppDispatch } from '@shared/store';

let socketInstance: Socket | null = null;

const RETRY_DELAY_MS = 10_000;

/** Ends the chat connection: called on sign-out, so the next account never reuses it. */
export function closeChatSocket(): void {
  socketInstance?.disconnect();
  socketInstance = null;
}

/**
 * The one socket of the session, with its listeners attached once. Several
 * hooks use it at the same time: if each added its own listeners, every event
 * would be handled once per hook, and one hook's cleanup would remove the
 * others' listeners.
 */
function createSocket(dispatch: AppDispatch): Socket {
  const socket = io(import.meta.env.VITE_WS_URL ?? 'http://localhost:3000', {
    // Read on every (re)connection: the access token is renewed every few
    // minutes, and a reconnect with the first one would be refused.
    auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
    transports: ['websocket'],
  });

  socket.on('message:new', (msg) => dispatch(chatActions.messageReceived(msg)));
  socket.on('message:edited', (msg) => dispatch(chatActions.messageEdited(msg)));
  socket.on('message:deleted', (data) => dispatch(chatActions.messageDeleted(data)));
  socket.on('reaction:added', (data) => dispatch(chatActions.reactionAdded(data)));
  socket.on('reaction:removed', (data) => dispatch(chatActions.reactionRemoved(data)));
  socket.on('user:online', ({ userId }) => dispatch(chatActions.userOnline(userId)));
  socket.on('user:offline', ({ userId }) => dispatch(chatActions.userOffline(userId)));
  socket.on('user:typing', ({ userId, conversationId, isTyping }) => {
    if (isTyping) dispatch(chatActions.typingStarted({ conversationId, userId }));
    else dispatch(chatActions.typingStopped({ conversationId, userId }));
  });
  socket.on('message:starred', (data) => dispatch(chatActions.messageStarred(data)));
  socket.on('message:unstarred', (data) => dispatch(chatActions.messageUnstarred(data)));
  socket.on('message:archived', (data) => dispatch(chatActions.messageArchived(data)));

  // An expired token is refused at the handshake, and socket.io does not retry
  // after that: renew the session once, then reconnect with the new token.
  let renewedSinceConnect = false;
  socket.on('connect', () => {
    renewedSinceConnect = false;
    console.log('[socket] connecté, id =', socket.id);
  });
  socket.on('connect_error', (err) => {
    console.error('[socket] échec de connexion:', err.message);
    if (err.message !== 'UNAUTHORIZED' || renewedSinceConnect) return;
    renewedSinceConnect = true;
    void baseApi.renewSession().then((outcome) => {
      if (socketInstance !== socket) return;
      // 'superseded': another tab renewed it, and the auth callback reads its token.
      if (outcome.kind === 'renewed' || outcome.kind === 'superseded') socket.connect();
      // Offline or server down: try again later rather than staying dead.
      else if (outcome.kind === 'unavailable') {
        setTimeout(() => {
          renewedSinceConnect = false;
          if (socketInstance === socket) socket.connect();
        }, RETRY_DELAY_MS);
      }
    });
  });
  socket.on('disconnect', (reason) => {
    console.warn('[socket] déconnecté:', reason);
  });

  return socket;
}

export function useSocket(): RefObject<Socket | null> {
  const dispatch = useAppDispatch();
  // Only signing in or out matters here: a renewed token is read again by the
  // auth callback, so it must not rebuild the socket.
  const signedIn = !!useAppSelector(selectAccessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!signedIn) {
      closeChatSocket();
      socketRef.current = null;
      return;
    }

    socketInstance ??= createSocket(dispatch);
    socketRef.current = socketInstance;
  }, [signedIn, dispatch]);

  return socketRef;
}
