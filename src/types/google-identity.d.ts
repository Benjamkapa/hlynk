interface GoogleCredentialResponse {
  credential?: string
  select_by?: string
}

interface GoogleIdConfiguration {
  auto_select?: boolean
  callback: (response: GoogleCredentialResponse) => void | Promise<void>
  client_id: string
  ux_mode?: 'popup' | 'redirect'
}

interface GoogleButtonConfiguration {
  logo_alignment?: 'center' | 'left'
  shape?: 'circle' | 'pill' | 'rectangular' | 'square'
  size?: 'large' | 'medium' | 'small'
  text?: 'continue_with' | 'signin_with' | 'signup_with'
  theme?: 'filled_black' | 'filled_blue' | 'outline'
  width?: number | string
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void
  prompt: (momentListener?: (notification: unknown) => void) => void
  renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string
}
