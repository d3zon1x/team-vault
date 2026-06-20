interface CredentialResponse {
  credential?: string;
  select_by?: string;
  clientId?: string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number | string;
  locale?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: GsiButtonConfiguration,
  ) => void;
  prompt: () => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface GoogleNamespace {
  accounts: GoogleAccounts;
}

interface Window {
  google?: GoogleNamespace;
}
