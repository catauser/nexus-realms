// ============================================================
// Nexus Realms — Login Scene
// Modern login UI with WebSocket connection handling
// ============================================================

import Phaser from 'phaser';
import { WebSocketClient, ConnectionState } from '../network/WebSocketClient';

export class LoginScene extends Phaser.Scene {
  private ws!: WebSocketClient;
  private formContainer: HTMLDivElement | null = null;
  private statusText!: Phaser.GameObjects.Text;
  private connecting: boolean = false;
  private spinnerGraphics!: Phaser.GameObjects.Graphics;
  private spinnerAngle: number = 0;
  private showSpinner: boolean = false;

  constructor() {
    super({ key: 'LoginScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    this.cameras.main.setBackgroundColor('#0a0a1a');
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // ── Background particles ────────────────────────────────
    const bgParticles = this.add.graphics();
    bgParticles.setAlpha(0.3);
    for (let i = 0; i < 40; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const size = 1 + Math.random() * 2;
      bgParticles.fillStyle(0x4444aa, 0.3 + Math.random() * 0.4);
      bgParticles.fillCircle(px, py, size);
    }

    // ── Title ───────────────────────────────────────────────
    const title = this.add.text(cx, cy - 200, 'NEXUS REALMS', {
      fontFamily: 'Georgia, serif',
      fontSize: '56px',
      color: '#c0a040',
      fontStyle: 'bold',
      stroke: '#4a3a10',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: title.y - 4,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(cx, cy - 140, 'Enter the realm', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#5555aa',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // ── Version ─────────────────────────────────────────────
    this.add.text(width - 10, height - 10, 'v1.0.0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#333355',
    }).setOrigin(1, 1);

    // ── Status text ─────────────────────────────────────────
    this.statusText = this.add.text(cx, cy + 140, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ff4444',
    }).setOrigin(0.5);

    // ── Loading spinner ─────────────────────────────────────
    this.spinnerGraphics = this.add.graphics();
    this.spinnerGraphics.setVisible(false);

    // ── Create login form ───────────────────────────────────
    this.createForm(cx, cy);

    // ── Initialize WebSocket ────────────────────────────────
    this.initWebSocket();

    // ── Listen for auth results ─────────────────────────────
    this.ws.on('auth.success', this.onAuthSuccess.bind(this));
    this.ws.on('auth.failure', this.onAuthFailure.bind(this));
  }

  update(_time: number, delta: number): void {
    if (this.showSpinner) {
      this.spinnerAngle += delta * 0.005;
      this.drawSpinner();
    }
  }

  // ─── WebSocket Initialization ─────────────────────────────

  private initWebSocket(): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:3000';
    const url = `${protocol}//${host}/ws`;

    this.ws = new WebSocketClient({
      url,
      reconnectBaseDelay: 1000,
      reconnectMaxDelay: 10000,
      reconnectMaxRetries: 5,
    });

    this.ws.setOnStateChange((state: ConnectionState) => {
      switch (state) {
        case ConnectionState.CONNECTING:
          this.setStatus('Connecting to server...', '#8888aa');
          this.setSpinnerVisible(true);
          break;
        case ConnectionState.CONNECTED:
          this.setStatus('Connected!', '#44cc44');
          this.setSpinnerVisible(false);
          break;
        case ConnectionState.RECONNECTING:
          this.setStatus('Reconnecting...', '#ccaa33');
          this.setSpinnerVisible(true);
          break;
        case ConnectionState.DISCONNECTED:
          if (this.connecting) {
            this.setStatus('Connection lost. Please try again.', '#ff4444');
            this.connecting = false;
          }
          this.setSpinnerVisible(false);
          break;
      }
    });
  }

  // ─── Form Creation ────────────────────────────────────────

  private createForm(cx: number, cy: number): void {
    this.removeForm();

    const container = document.createElement('div');
    container.id = 'login-form';
    container.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${cy + 10}px;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      z-index: 100;
      font-family: Arial, sans-serif;
    `;

    // Username
    const usernameInput = this.createInput('text', 'Username', 'login-username');

    // Password
    const passwordInput = this.createInput('password', 'Password', 'login-password');

    // Button row
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display: flex; gap: 12px; margin-top: 6px; width: 100%;';

    const loginBtn = this.createButton('Login', '#3a6ea5', '#2a5e95');
    const registerBtn = this.createButton('Register', '#3a5a3a', '#2a4a2a');

    loginBtn.onclick = () => this.handleLogin(usernameInput.value, passwordInput.value);
    registerBtn.onclick = () => this.handleRegister(usernameInput.value, passwordInput.value);

    // Enter key navigation
    usernameInput.onkeydown = (e) => {
      if (e.key === 'Enter') passwordInput.focus();
      e.stopPropagation();
    };
    passwordInput.onkeydown = (e) => {
      if (e.key === 'Enter') this.handleLogin(usernameInput.value, passwordInput.value);
      e.stopPropagation();
    };

    btnRow.appendChild(loginBtn);
    btnRow.appendChild(registerBtn);
    container.appendChild(usernameInput);
    container.appendChild(passwordInput);
    container.appendChild(btnRow);

    // Info text
    const info = document.createElement('div');
    info.style.cssText = 'color: #5555aa; font-size: 11px; margin-top: 4px; text-align: center;';
    info.textContent = 'Press Enter to login • Tab to navigate';
    container.appendChild(info);

    document.body.appendChild(container);
    this.formContainer = container;

    // Auto-focus
    usernameInput.focus();
  }

  private createInput(type: string, placeholder: string, id: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.id = id;
    input.style.cssText = `
      width: 280px;
      padding: 12px 16px;
      font-size: 15px;
      background: rgba(26, 26, 46, 0.95);
      border: 1px solid #333355;
      border-radius: 8px;
      color: #e0e0ff;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    `;
    input.onfocus = () => {
      input.style.borderColor = '#5555aa';
      input.style.boxShadow = '0 0 8px rgba(85, 85, 170, 0.3)';
    };
    input.onblur = () => {
      input.style.borderColor = '#333355';
      input.style.boxShadow = 'none';
    };
    return input;
  }

  private createButton(label: string, bg: string, hoverBg: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      flex: 1;
      padding: 12px;
      font-size: 15px;
      font-weight: bold;
      background: ${bg};
      border: none;
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      letter-spacing: 0.5px;
    `;
    btn.onmouseenter = () => {
      btn.style.background = hoverBg;
      btn.style.transform = 'scale(1.02)';
    };
    btn.onmouseleave = () => {
      btn.style.background = bg;
      btn.style.transform = 'scale(1)';
    };
    btn.onmousedown = () => { btn.style.transform = 'scale(0.98)'; };
    btn.onmouseup = () => { btn.style.transform = 'scale(1.02)'; };
    return btn;
  }

  // ─── Login / Register ─────────────────────────────────────

  private handleLogin(username: string, password: string): void {
    if (this.connecting) return;
    if (!username.trim() || !password) {
      this.setStatus('Please enter username and password', '#ff4444');
      return;
    }

    this.connecting = true;

    // Init audio on first user interaction
    const soundMgr = (this.game as Phaser.Game & { __soundManager?: { init(): boolean; resume(): void } }).__soundManager;
    if (soundMgr) {
      soundMgr.init();
      soundMgr.resume();
    }

    if (!this.ws.isConnected()) {
      this.ws.connect();
      // Wait for connection, then send login
      const checkConnection = this.time.addEvent({
        delay: 200,
        loop: true,
        callback: () => {
          if (this.ws.isConnected()) {
            checkConnection.remove();
            this.sendLogin(username, password);
          }
        },
      });

      // Timeout after 10 seconds
      this.time.delayedCall(10000, () => {
        if (this.connecting && !this.ws.isConnected()) {
          checkConnection.remove();
          this.connecting = false;
          this.setStatus('Connection timeout. Is the server running?', '#ff4444');
          this.setSpinnerVisible(false);
        }
      });
    } else {
      this.sendLogin(username, password);
    }
  }

  private handleRegister(username: string, password: string): void {
    if (!username.trim() || !password) {
      this.setStatus('Please enter username and password', '#ff4444');
      return;
    }
    // Registration uses the same login flow for this demo
    this.handleLogin(username, password);
  }

  private sendLogin(username: string, password: string): void {
    this.ws.send('auth.login', {
      username: username.trim(),
      password_hash: password,
      client_version: '1.0.0',
    });
    this.setStatus('Authenticating...', '#8888aa');
    this.setSpinnerVisible(true);
  }

  // ─── Auth Handlers ────────────────────────────────────────

  private onAuthSuccess(data: Record<string, unknown>): void {
    this.connecting = false;
    this.setStatus('Login successful!', '#44cc44');
    this.setSpinnerVisible(false);
    this.removeForm();

    // Fade transition to game
    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.ws.off('auth.success', this.onAuthSuccess.bind(this));
        this.ws.off('auth.failure', this.onAuthFailure.bind(this));
        this.scene.start('GameScene', { ws: this.ws, authData: data });
      });
    });
  }

  private onAuthFailure(data: Record<string, unknown>): void {
    this.connecting = false;
    this.setSpinnerVisible(false);
    const d = data as { reason?: string; code?: number; retry_after?: number };
    let msg = d.reason || 'Authentication failed';
    if (d.retry_after) {
      msg += ` (retry in ${d.retry_after}s)`;
    }
    this.setStatus(msg, '#ff4444');
  }

  // ─── UI Helpers ───────────────────────────────────────────

  private setStatus(text: string, color: string): void {
    this.statusText.setText(text);
    this.statusText.setColor(color);
  }

  private setSpinnerVisible(visible: boolean): void {
    this.showSpinner = visible;
    this.spinnerGraphics.setVisible(visible);
  }

  private drawSpinner(): void {
    this.spinnerGraphics.clear();
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2 + 170;
    const radius = 12;
    const segments = 8;

    for (let i = 0; i < segments; i++) {
      const angle = this.spinnerAngle + (i / segments) * Math.PI * 2;
      const alpha = 0.2 + (i / segments) * 0.8;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      this.spinnerGraphics.fillStyle(0x5555aa, alpha);
      this.spinnerGraphics.fillCircle(x, y, 2.5);
    }
  }

  private removeForm(): void {
    if (this.formContainer && this.formContainer.parentNode) {
      this.formContainer.parentNode.removeChild(this.formContainer);
      this.formContainer = null;
    }
  }

  shutdown(): void {
    this.removeForm();
  }
}
