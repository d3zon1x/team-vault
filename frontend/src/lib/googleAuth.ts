const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let scriptLoadPromise: Promise<void> | null = null;

export function getGoogleClientId(): string | undefined {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  if (!clientId || clientId === 'your-google-client-id') {
    return undefined;
  }
  return clientId;
}

export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${GOOGLE_SCRIPT_URL}"]`,
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Failed to load Google Identity Services')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export async function initializeGoogleAuth(
  onCredential: (credential: string) => void,
): Promise<void> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return;
  }

  await loadGoogleIdentityScript();

  window.google!.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response.credential) {
        onCredential(response.credential);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
}

export function renderGoogleSignInButton(
  element: HTMLElement,
  width?: number,
): void {
  window.google!.accounts.id.renderButton(element, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: width ?? (element.offsetWidth || 400),
  });
}
