import { useEffect, useState } from "react";
import type { DependencyList } from "react";

export interface AsyncResource<TData> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  reload: () => void;
}

export function useAsyncResource<TData>(
  loader: () => Promise<TData>,
  dependencies: DependencyList
): AsyncResource<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    loader()
      .then((nextData) => {
        if (isActive) {
          setData(nextData);
        }
      })
      .catch((nextError: unknown) => {
        if (isActive) {
          setError(nextError instanceof Error ? nextError : new Error("API 요청 실패"));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [...dependencies, reloadKey]);

  return {
    data,
    error,
    isLoading,
    reload: () => setReloadKey((value) => value + 1)
  };
}
