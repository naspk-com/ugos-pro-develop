// useAuth bootstraps the UGOS third-token once on mount and pushes it into
// the API client. Returns a state machine so consumers can render a banner
// in dev mode (no token = "running outside UGOS shell").
//
// Outside the UGOS shell, `cloudWindow.useCapacity` neither resolves nor
// rejects — the IPC bridge has nobody on the other end. So we race the
// capacity call against a short timeout and fall back to dev mode if it
// loses, otherwise the UI would stay on "正在初始化…" forever.

import { useEffect, useState } from 'react';
import cloudWindow from '@ugreen-nas/core/cloudWindow';
import { setAuthToken } from '../api/client';

export type AuthState =
  | { status: 'loading' }
  | { status: 'ugos'; token: string }
  | { status: 'dev'; reason: 'no_token' | 'capacity_failed' | 'timeout'; error?: string };

const CAPACITY_TIMEOUT_MS = 1500;

class CapacityTimeoutError extends Error {
  constructor() {
    super('getThirdToken timed out (likely running outside UGOS shell)');
  }
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    const tokenPromise = (async () => {
      const info = (await cloudWindow.useCapacity('getThirdToken')) as
        | { third_token?: string }
        | null;
      return info?.third_token ?? null;
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new CapacityTimeoutError()), CAPACITY_TIMEOUT_MS);
    });

    Promise.race([tokenPromise, timeoutPromise])
      .then((token) => {
        if (cancelled) return;
        if (token) {
          setAuthToken(token);
          setState({ status: 'ugos', token });
        } else {
          setAuthToken(null);
          setState({ status: 'dev', reason: 'no_token' });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setAuthToken(null);
        if (err instanceof CapacityTimeoutError) {
          setState({ status: 'dev', reason: 'timeout' });
        } else {
          setState({
            status: 'dev',
            reason: 'capacity_failed',
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
