import { getApiBaseUrl } from "@/lib/api-client";

const resolveApiUrl = () => {
  const base = getApiBaseUrl();
  if (!base) {
    return "/";
  }

  return base.endsWith("/") ? base : `${base}/`;
};

export const apiurl = resolveApiUrl();
