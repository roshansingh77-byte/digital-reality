declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (config?: { prompt?: string }) => void };
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
  }
}

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");

let tokenClient: ReturnType<typeof window.google.accounts.oauth2.initTokenClient> | null = null;
let accessToken: string | null = null;
let gisLoaded = false;
let loadPromise: Promise<void> | null = null;

function loadGIS(): Promise<void> {
  if (gisLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}

export async function signIn(): Promise<{ accessToken: string; name: string; email: string }> {
  await loadGIS();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID is not set");

  const token = await new Promise<string>((resolve, reject) => {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
          resolve(accessToken);
        } else {
          reject(new Error(response.error || "Failed to get access token"));
        }
      },
    });
    tokenClient.requestAccessToken({ prompt: "consent" });
  });

  // Fetch user profile info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userInfo = await userRes.json();
  return {
    accessToken: token,
    name: userInfo.name || "User",
    email: userInfo.email || "",
  };
}

export async function getAccessToken(forceSignIn = false): Promise<string> {
  if (accessToken && !forceSignIn) return accessToken;
  const result = await signIn();
  return result.accessToken;
}

export function signOut(): void {
  if (accessToken && window.google) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  tokenClient = null;
}

export function isSignedIn(): boolean {
  return !!accessToken;
}
