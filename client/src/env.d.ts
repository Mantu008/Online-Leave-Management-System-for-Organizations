/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST API, including the /api prefix. Defaults to "/api". */
  readonly VITE_APP_API_URL?: string;
  /** Origin of the realtime (Socket.IO) server. Realtime is disabled when unset. */
  readonly VITE_APP_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
