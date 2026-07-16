// ============================================================
// Nexus Realms — Login UI
// Modern login screen with animated background,
// floating label inputs, server status, error handling
// ============================================================

export interface LoginUICallbacks {
  onLogin?: (username: string, password: string, remember: boolean) => void;
  onRegister?: (username: string, password: string) => void;
}

export class LoginUI {
  private root: HTMLElement;
  private el!: HTMLElement;
  private callbacks: LoginUICallbacks;
  private visible: boolean = false;
  private isRegisterMode: boolean = false;

  // Elements
  private usernameInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private submitBtn!: HTMLButtonElement;
  private toggleLink!: HTMLElement;
  private errorEl!: HTMLElement;
  private rememberCheckbox!: HTMLElement;
  private rememberChecked: boolean = false;
  private serverDot!: HTMLElement;
  private particleContainer!: HTMLElement;

  constructor(parent: HTMLElement, callbacks: LoginUICallbacks) {
    this.root = parent;
    this.callbacks = callbacks;
    this.create();
  }

  show(): void {
    this.visible = true;
    this.el.style.display = 'flex';
    this.spawnParticles();
  }

  hide(): void {
    this.visible = false;
    this.el.style.display = 'none';
  }

  setError(message: string): void {
    this.errorEl.textContent = message;
    this.errorEl.classList.add('active');
  }

  clearError(): void {
    this.errorEl.classList.remove('active');
  }

  setServerOnline(online: boolean): void {
    this.serverDot.className = online ? 'nr-login__server-dot' : 'nr-login__server-dot offline';
  }

  // ─── Private ──────────────────────────────────────────────

  private create(): void {
    this.el = document.createElement('div');
    this.el.className = 'nr-login';
    this.el.style.display = 'none';
    this.el.innerHTML = `
      <div class="nr-login__bg"></div>
      <div class="nr-login__particles"></div>
      <div class="nr-login__content">
        <h1 class="nr-login__title">NEXUS REALMS</h1>
        <p class="nr-login__subtitle">Enter the Realm</p>
        <form class="nr-login__form" autocomplete="off">
          <div class="nr-login__error" role="alert"></div>
          <div class="nr-input-group">
            <input class="nr-input-group__input" type="text" id="login-username" placeholder=" " autocomplete="username" aria-label="Username" />
            <label class="nr-input-group__label" for="login-username">Username</label>
          </div>
          <div class="nr-input-group">
            <input class="nr-input-group__input" type="password" id="login-password" placeholder=" " autocomplete="current-password" aria-label="Password" />
            <label class="nr-input-group__label" for="login-password">Password</label>
          </div>
          <label class="nr-checkbox" role="checkbox" tabindex="0" aria-label="Remember me">
            <span class="nr-checkbox__box">✓</span>
            <span>Remember me</span>
          </label>
          <div class="nr-login__actions">
            <button type="submit" class="nr-btn nr-btn--primary">Enter Realm</button>
          </div>
          <div class="nr-login__toggle">
            <span>New adventurer? </span><a href="#" role="button">Create Account</a>
          </div>
          <div class="nr-login__server-status">
            <span class="nr-login__server-dot"></span>
            <span>Server Online</span>
          </div>
        </form>
      </div>
      <div class="nr-login__version">v0.1.0-alpha</div>
    `;
    this.root.appendChild(this.el);

    // Element refs
    this.usernameInput = this.el.querySelector('#login-username') as HTMLInputElement;
    this.passwordInput = this.el.querySelector('#login-password') as HTMLInputElement;
    this.submitBtn = this.el.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.toggleLink = this.el.querySelector('.nr-login__toggle a') as HTMLElement;
    this.errorEl = this.el.querySelector('.nr-login__error') as HTMLElement;
    this.rememberCheckbox = this.el.querySelector('.nr-checkbox') as HTMLElement;
    this.serverDot = this.el.querySelector('.nr-login__server-dot') as HTMLElement;
    this.particleContainer = this.el.querySelector('.nr-login__particles') as HTMLElement;

    // Form submit
    this.el.querySelector('form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Toggle login/register
    this.toggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.isRegisterMode = !this.isRegisterMode;
      this.submitBtn.textContent = this.isRegisterMode ? 'Create Account' : 'Enter Realm';
      this.toggleLink.textContent = this.isRegisterMode ? 'Back to Login' : 'Create Account';
      const toggleWrap = this.el.querySelector('.nr-login__toggle') as HTMLElement;
      const span = toggleWrap.querySelector('span') as HTMLElement;
      span.textContent = this.isRegisterMode ? 'Already have an account? ' : 'New adventurer? ';
      this.clearError();
    });

    // Remember me checkbox
    this.rememberCheckbox.addEventListener('click', () => {
      this.rememberChecked = !this.rememberChecked;
      const box = this.rememberCheckbox.querySelector('.nr-checkbox__box') as HTMLElement;
      box.classList.toggle('checked', this.rememberChecked);
    });
    this.rememberCheckbox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.rememberCheckbox.click();
      }
    });
  }

  private handleSubmit(): void {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username) {
      this.setError('Please enter a username.');
      this.usernameInput.focus();
      return;
    }
    if (!password) {
      this.setError('Please enter a password.');
      this.passwordInput.focus();
      return;
    }
    if (username.length < 3) {
      this.setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 4) {
      this.setError('Password must be at least 4 characters.');
      return;
    }

    this.clearError();

    if (this.isRegisterMode) {
      this.callbacks.onRegister?.(username, password);
    } else {
      this.callbacks.onLogin?.(username, password, this.rememberChecked);
    }
  }

  private spawnParticles(): void {
    this.particleContainer.innerHTML = '';
    const count = 30;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'nr-login__particle';
      const x = Math.random() * 100;
      const size = 1 + Math.random() * 2;
      const duration = 8 + Math.random() * 12;
      const delay = Math.random() * duration;
      const drift = -30 + Math.random() * 60;
      p.style.cssText = `
        left: ${x}%;
        width: ${size}px;
        height: ${size}px;
        --drift: ${drift}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${0.2 + Math.random() * 0.4};
      `;
      this.particleContainer.appendChild(p);
    }
  }
}
