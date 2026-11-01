import { useCallback, useEffect, useState } from 'react';
import cloudWindow from '@ugreen-nas/core/cloudWindow';

export interface AuthorizationInfoResponse {
  client_id?: string | null;
  remote_addr?: string | null;
  result?: string | null;
  ug_language?: string | null;
  ug_user_id?: string | number | null;
  ug_user_name?: string | null;
  ug_user_role?: string | null;
  user_agent?: string | null;
  x_forwarded_for?: string | null;
  x_real_ip?: string | null;
}

export function useApplicationAuthorizationInfo() {
  const [data, setData] = useState<AuthorizationInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let thirdToken: string | undefined;

      try {
        const tokenInfo = await cloudWindow.useCapacity('getThirdToken');
        if (tokenInfo && typeof tokenInfo === 'object' && 'third_token' in tokenInfo) {
          thirdToken = typeof tokenInfo.third_token === 'string' ? tokenInfo.third_token : undefined;
        }
      } catch {
        thirdToken = undefined;
      }

      const headers: Record<string, string> = {};
      if (thirdToken) {
        headers['Ugreen-Ttk'] = thirdToken;
      }

      const response = await fetch('/demoapi/v1/info', { headers });
      if (!response.ok) {
        throw new Error('获取接口数据失败');
      }

      const result = (await response.json()) as AuthorizationInfoResponse;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取接口数据失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
