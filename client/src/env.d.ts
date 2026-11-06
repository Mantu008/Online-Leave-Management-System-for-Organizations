/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST API, including the /api prefix. Defaults to "/api". */
  readonly VITE_APP_API_URL?: string;
  /** Origin of the realtime (Socket.IO) server. Realtime is disabled when unset. */
  readonly VITE_APP_SOCKET_URL?: string;
  /** Set to "false" to hide the one-click demo accounts on the login page. */
  readonly VITE_DEMO_LOGIN?: string;
  /** Product name shown in the UI. Defaults to "LeaveFlow". */
  readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
