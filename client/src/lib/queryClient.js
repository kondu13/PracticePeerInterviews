import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export function apiRequest(method, path, body = undefined) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return fetch(path, options).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        throw new Error(text || res.statusText || `HTTP error ${res.status}`);
      });
    }
    return res;
  });
}

export function getQueryFn({ on401 = "throw" } = {}) {
  return async ({ queryKey }) => {
    const [url] = queryKey;
    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401 && on401 === "returnNull") {
          return null;
        }
        throw new Error(`HTTP error ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  };
}