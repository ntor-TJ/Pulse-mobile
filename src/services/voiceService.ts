import { getApiBaseUrl, getAuthToken } from './apiClient';
import { VoiceLocale } from '../types';

export const SUPPORTED_INDIAN_LOCALES: VoiceLocale[] = [
  { code: 'en-IN', label: 'Indian English', native_label: 'English (India)', voice_name: 'en-IN-Wavenet-D', accent: 'en-IN' },
  { code: 'hi-IN', label: 'Hindi', native_label: 'हिन्दी', voice_name: 'hi-IN-Wavenet-A', accent: 'hi-IN' },
  { code: 'te-IN', label: 'Telugu', native_label: 'తెలుగు', voice_name: 'te-IN-Standard-A', accent: 'te-IN' },
  { code: 'ta-IN', label: 'Tamil', native_label: 'தமிழ்', voice_name: 'ta-IN-Standard-A', accent: 'ta-IN' },
  { code: 'kn-IN', label: 'Kannada', native_label: 'ಕನ್ನಡ', voice_name: 'kn-IN-Standard-A', accent: 'kn-IN' },
  { code: 'mr-IN', label: 'Marathi', native_label: 'मराठी', voice_name: 'mr-IN-Standard-A', accent: 'mr-IN' },
  { code: 'bn-IN', label: 'Bengali', native_label: 'বাংলা', voice_name: 'bn-IN-Standard-A', accent: 'bn-IN' },
  { code: 'gu-IN', label: 'Gujarati', native_label: 'ગુજરાતી', voice_name: 'gu-IN-Standard-A', accent: 'gu-IN' },
  { code: 'en-US', label: 'US English', native_label: 'English (US)', voice_name: 'en-US-Neural2-F', accent: 'en-US' },
  { code: 'en-GB', label: 'British English', native_label: 'English (UK)', voice_name: 'en-GB-Neural2-A', accent: 'en-GB' },
];

export class VoiceSessionManager {
  private ws: WebSocket | null = null;
  private workspaceId: string | number;
  private locale: string;
  private onMessageCallback?: (msg: any) => void;
  private onStatusChangeCallback?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

  constructor(
    workspaceId: string | number,
    locale: string = 'en-IN',
    callbacks?: {
      onMessage?: (msg: any) => void;
      onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
    }
  ) {
    this.workspaceId = workspaceId;
    this.locale = locale;
    this.onMessageCallback = callbacks?.onMessage;
    this.onStatusChangeCallback = callbacks?.onStatusChange;
  }

  async connect(): Promise<void> {
    const baseUrl = await getApiBaseUrl();
    const token = await getAuthToken();

    const wsProtocol = baseUrl.startsWith('https') ? 'wss:' : 'ws:';
    const hostWithPort = baseUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
    const wsUrl = `${wsProtocol}//${hostWithPort}/api/v1/voice/ws?token=${encodeURIComponent(token || '')}&workspace_id=${this.workspaceId}`;

    this.onStatusChangeCallback?.('connecting');

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.onStatusChangeCallback?.('connected');
        // Send initial configuration frame expected by the backend
        const configFrame = {
          voice: 'female',
          languageCode: this.locale || 'en-IN',
          languageInstruction: 'Respond conversationally as Arya the AI Startup Mentor.',
          openingMode: 'intake',
        };
        this.ws?.send(JSON.stringify(configFrame));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessageCallback?.(data);
        } catch {
          this.onMessageCallback?.({ type: 'text', content: event.data });
        }
      };

      this.ws.onerror = (error) => {
        console.warn('Voice WebSocket error:', error);
        this.onStatusChangeCallback?.('error');
      };

      this.ws.onclose = () => {
        this.onStatusChangeCallback?.('disconnected');
      };
    } catch {
      this.onStatusChangeCallback?.('error');
    }
  }

  sendTextMessage(text: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'text', content: text }));
    }
  }

  sendAudioFrame(pcmData: string | ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(pcmData);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
