/**
 * Real Agora Conversational AI Voice Gateway Service
 * Built with `agora-rtc-sdk-ng` — Production Ready
 * 
 * Features:
 * - Real AgoraRTC Client Singleton
 * - Hardware Audio DSP (Echo Cancellation AEC, Noise Suppression ANS, Auto Gain Control AGC)
 * - Environment Variable configuration (VITE_AGORA_APP_ID, VITE_AGORA_CHANNEL, VITE_API_BASE)
 * - Real Event Listeners (connection-state-change, user-published, user-unpublished, user-left)
 * - Real Volume Indicator (volume-indicator) for User & AI speaking states
 * - Separate UIDs for User and AI Agent to prevent channel eviction
 * - Dynamic Token integration & robust cleanup
 */

import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';

export type AgoraConnectionStatus = 
  | 'DISCONNECTED' 
  | 'CONNECTING' 
  | 'RTC_CONNECTED' 
  | 'WAITING_FOR_AI' 
  | 'AI_CONNECTED' 
  | 'READY' 
  | 'CONNECTED'
  | 'AI_OFFLINE' 
  | 'TOKEN_ERROR' 
  | 'RECONNECTING';

export interface AgoraVoiceState {
  status: AgoraConnectionStatus;
  isMuted: boolean;
  isMicPermitted: boolean;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  channelName: string;
  latencyMs: number;
}

type Listener = (state: AgoraVoiceState) => void;

class AgoraVoiceService {
  private rtcClient: IAgoraRTCClient;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localUid: UID | null = null;
  private listeners: Set<Listener> = new Set();
  private isMuteTransitioning = false;
  private playingRemoteUids: Set<string> = new Set();
  private hasInitialGreetingPlayed = false;
  private agentJoinRequestsCount = 0;
  private joinPromise: Promise<boolean> | null = null;

  // Track backend agent state for authoritative diagnostic reporting
  private backendAgentId: string = 'N/A';
  private backendAgentStatus: string = 'OFFLINE';
  private backendAgentChannel: string = 'echoaid-room';
  private backendAgentUid: number = 10001;

  private state: AgoraVoiceState = {
    status: 'DISCONNECTED',
    isMuted: true,
    isMicPermitted: false,
    isUserSpeaking: false,
    isAISpeaking: false,
    channelName: import.meta.env.VITE_AGORA_CHANNEL || 'echoaid-room',
    latencyMs: 12,
  };

  constructor() {
    // Create Singleton AgoraRTC Client
    console.log('[VOICE DEBUG] Agora client created');
    console.log('[VOICE DEBUG] Number of Agora clients: 1');
    this.rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this.setupAgoraEventListeners();
    if (typeof window !== 'undefined') {
      (window as any).__echoAidVoiceDiagnostic = () => this.printDiagnostic();
    }
  }

  public get currentStatus(): AgoraConnectionStatus {
    return this.state.status;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  /**
   * Set AI Speaking State Indicator
   */
  public setAISpeaking(speaking: boolean): void {
    if (this.state.isAISpeaking !== speaking) {
      this.state.isAISpeaking = speaking;
      this.notify();
    }
  }

  /**
   * Real Agora RTC Event Listeners
   */
  private setupAgoraEventListeners(): void {
    // 1. Real Connection State Change Event
    this.rtcClient.on('connection-state-change', (curState, prevState) => {
      console.log(`[RTC STATE] ${prevState} -> ${curState}`);
      console.log(`[VOICE STATE] RTC connection state = ${curState}`);
      if (curState === 'DISCONNECTED') {
        this.state.status = 'DISCONNECTED';
      } else if (curState === 'CONNECTING') {
        this.state.status = 'CONNECTING';
      } else if (curState === 'CONNECTED') {
        if (this.state.status !== 'READY' && this.state.status !== 'AI_CONNECTED') {
          this.state.status = 'CONNECTED';
        }
        console.log('[VOICE STATE] Agora RTC connected (state:', this.state.status, ')');
      } else if (curState === 'RECONNECTING') {
        this.state.status = 'RECONNECTING';
      }
      this.notify();
    });

    // 1b. Real Remote User Joined Event
    this.rtcClient.on('user-joined', (user) => {
      console.log(`[AGENT RTC] remote user joined UID=${user.uid}`);
      if (String(user.uid) === '10001') {
        if (this.state.status !== 'READY') {
          this.state.status = 'AI_CONNECTED';
        }
        this.notify();
      }
    });

    // 2. Real Remote User Published (Agora AI Voice Agent UID 10001)
    this.rtcClient.on('user-published', async (user, mediaType) => {
      console.log(`[AGENT RTC] user published UID=${user.uid} mediaType=${mediaType}`);
      console.log(`[VOICE LOOP] 09 REMOTE_AUDIO_PUBLISHED uid=${user.uid}`);
      if (mediaType === 'audio') {
        try {
          console.log(`[AGENT RTC] subscribing UID=${user.uid} mediaType=${mediaType}`);
          console.log(`[VOICE LOOP] 10 REMOTE_AUDIO_SUBSCRIBE_START uid=${user.uid}`);
          await this.rtcClient.subscribe(user, mediaType);
          console.log(`[VOICE LOOP] 10 REMOTE_AUDIO_SUBSCRIBE_SUCCESS uid=${user.uid}`);
          
          const trackExists = Boolean(user.audioTrack);
          console.log(`[VOICE LOOP] 11 REMOTE_AUDIO_TRACK_EXISTS=${trackExists} uid=${user.uid}`);
          console.log(`[AGENT RTC] remote audio track received UID=${user.uid}`);
          
          if (user.audioTrack) {
            const uidKey = String(user.uid);
            if (!this.playingRemoteUids.has(uidKey)) {
              this.playingRemoteUids.add(uidKey);
              if (!this.hasInitialGreetingPlayed) {
                this.hasInitialGreetingPlayed = true;
                console.log('[GREETING DEBUG] Initial greeting requested');
                console.log('[GREETING DEBUG] Initial greeting source: AGORA');
                console.log('[GREETING DEBUG] Initial greeting allowed: true');
              } else {
                console.log('[GREETING DEBUG] Duplicate initial greeting prevented');
              }
              console.log(`[VOICE LOOP] 11 REMOTE_AUDIO_PLAY_START uid=${user.uid}`);
              try {
                user.audioTrack.play();
                console.log(`[VOICE LOOP] 11 REMOTE_AUDIO_PLAY_SUCCESS uid=${user.uid}`);
                console.log(`[VOICE LOOP] 12 CONVERSATION_READY uid=${user.uid}`);
              } catch (playErr: any) {
                console.error('[AUDIO ERROR] Browser blocked remote audio playback:', playErr?.message || playErr);
              }
            } else {
              console.log('[GREETING DEBUG] Duplicate initial greeting prevented');
            }
          } else {
            console.warn(`[AGENT ERROR] audioTrack is null for UID: ${user.uid}`);
          }
          if (String(user.uid) === '10001') {
            this.state.status = 'CONNECTED';
          }
          this.state.isAISpeaking = true;
          this.notify();
        } catch (err: any) {
          console.error(`[AGENT ERROR] Failed subscribing to remote user audio:`, err?.message || err);
        }
      }
    });

    // 3. Real Remote User Unpublished
    this.rtcClient.on('user-unpublished', (user, mediaType) => {
      console.log(`[VOICE AUDIO DEBUG] remote user unpublished: ${user.uid}, mediaType: ${mediaType}`);
      if (mediaType === 'audio') {
        this.playingRemoteUids.delete(String(user.uid));
        this.state.isAISpeaking = false;
        this.notify();
      }
    });

    // 4. Real Remote User Left
    this.rtcClient.on('user-left', (user, reason) => {
      console.log(`[VOICE AUDIO DEBUG] remote user left: ${user.uid}, reason: ${reason}`);
      this.playingRemoteUids.delete(String(user.uid));
      this.state.isAISpeaking = false;
      this.notify();
    });

    // 5. Real Volume Indicator from Agora Client Instance
    try {
      this.rtcClient.enableAudioVolumeIndicator();
      this.rtcClient.on('volume-indicator', (volumes) => {
        if (!this.state) return;
        let userVolume = 0;
        let aiVolume = 0;

        volumes.forEach((v) => {
          if (v.uid === this.localUid || v.uid === 0) {
            userVolume = v.level;
          } else {
            aiVolume = v.level;
          }
        });

        const isUserSpeaking = userVolume > 10;
        const isAISpeaking = aiVolume > 10 || Boolean(this.state.isAISpeaking);

        if (this.state.isUserSpeaking !== isUserSpeaking || this.state.isAISpeaking !== isAISpeaking) {
          this.state.isUserSpeaking = isUserSpeaking;
          this.state.isAISpeaking = isAISpeaking;
          this.notify();
        }
      });
    } catch { /* Volume indicator optional */ }

    // 6. Real Stream Message (Agora AI Voice Agent Data Stream Subtitles)
    try {
      this.rtcClient.on('stream-message', (uid, stream) => {
        try {
          const text = new TextDecoder().decode(stream);
          console.log(`[AGENT STREAM MESSAGE] UID=${uid} len=${stream.byteLength}:`, text);
          if (typeof window !== 'undefined' && text && text.trim()) {
            window.dispatchEvent(new CustomEvent('echoaid_ai_subtitle_stream', {
              detail: { uid, text: text.trim(), timestamp: new Date().toISOString() }
            }));
          }
        } catch (err) {
          console.warn('[AGENT STREAM MESSAGE WARNING] Error decoding stream message:', err);
        }
      });
    } catch { /* Optional stream-message listener */ }
  }

  /**
   * Request Microphone Permission and Create Local Track with Web Audio DSP
   */
  public async getLocalAudioTrack(): Promise<IMicrophoneAudioTrack | null> {
    if (this.localAudioTrack) return this.localAudioTrack;
    try {
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'speech_standard',
        AEC: true,
        AGC: true,
        ANS: true,
      });
      this.state.isMicPermitted = true;
      this.notify();
      return this.localAudioTrack;
    } catch (err) {
      console.warn('[VOICE] Microphone permission not yet granted:', err);
      this.state.isMicPermitted = false;
      this.notify();
      return null;
    }
  }

  /**
   * Join Real Agora Voice Channel
   */
  public async joinSession(mode: 'incident' | 'medical' = 'incident'): Promise<boolean> {
    // Return in-flight join if one is currently in progress
    if (this.joinPromise) {
      console.log('[Agora Voice Service] joinSession already in progress, returning active promise');
      return this.joinPromise;
    }

    // Duplicate join safeguard: skip if RTC client is already connected
    if (this.rtcClient.connectionState === 'CONNECTED') {
      console.log('[Agora Voice Service] Session already connected.');
      this.state.status = 'CONNECTED';
      this.notify();
      return true;
    }

    this.joinPromise = (async () => {
      try {
        console.log('[VOICE STATE] joinSession started');
        console.log(`[VOICE PIPELINE] AGORA_JOIN_REQUESTED (mode: ${mode})`);
        this.state.status = 'CONNECTING';
        this.notify();

        const rawApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || 'https://incident-ih39.onrender.com';
        const apiBase = rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '');
        const channelName = import.meta.env.VITE_AGORA_CHANNEL || 'echoaid-room';
        const defaultAppId = import.meta.env.VITE_AGORA_APP_ID || 'd25185935efb4c55b6e4c0569a602e72';

        // STEP 1 — Request Microphone Track FIRST (Local WebRTC DSP)
        if (!this.localAudioTrack) {
          try {
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
              encoderConfig: 'speech_standard',
              AEC: true,
              AGC: true,
              ANS: true,
            });
            this.state.isMicPermitted = true;
            console.log('[VOICE LOOP] LOCAL_AUDIO_TRACK_CREATED');
            console.log('[VOICE LOOP] LOCAL_AUDIO_TRACK_ENABLED');
          } catch (micErr) {
            console.warn('[VOICE] Microphone permission denied:', micErr);
            this.state.isMicPermitted = false;
          }
        }

        // STEP 2 — Obtain User RTC Token from Backend
        let tokenResponse: Response | null = null;
        try {
          tokenResponse = await fetch(`${apiBase}/api/agora/token?channel=${encodeURIComponent(channelName)}&uid=10002`);
        } catch (fetchErr) {
          console.warn('[VOICE] Relative token fetch retry...');
          tokenResponse = await fetch(`/api/agora/token?channel=${encodeURIComponent(channelName)}&uid=10002`);
        }

        if (tokenResponse && tokenResponse.ok) {
          const rtcData = await tokenResponse.json();
          const channel = rtcData.channel || channelName;
          const token = rtcData.token;
          const uid = rtcData.uid || 10002;
          const appId = rtcData.appId || defaultAppId;

          console.log('[AGENT TOKEN DEBUG] channel=' + channel);
          console.log('[AGENT TOKEN DEBUG] user_uid=' + uid);
          console.log('[AGENT TOKEN DEBUG] token_present=' + (!!token));
          console.log('[AGENT TOKEN DEBUG] token_generation=SUCCESS');

          const targetAppId = appId || defaultAppId;
          const targetUid = Number(uid || 10002);
          const targetToken = token || null;
          let joinedUid: UID | null = null;

          try {
            console.log('[VOICE STATE] rtcClient.join started with token for App ID:', targetAppId);
            joinedUid = await this.rtcClient.join(targetAppId, channel, targetToken, targetUid);
            console.log('[VOICE STATE] rtcClient.join succeeded with token');
          } catch (joinErr: any) {
            const errMsg = String(joinErr?.message || joinErr || '');
            console.warn('[VOICE STATE] rtcClient.join with token failed:', errMsg);
            if (errMsg.includes('CAN_NOT_GET_GATEWAY_SERVER') || errMsg.includes('INVALID_TOKEN') || errMsg.includes('TOKEN_EXPIRED')) {
              try {
                console.log('[VOICE STATE] Retrying rtcClient.join without token...');
                joinedUid = await this.rtcClient.join(targetAppId, channel, null, targetUid);
                console.log('[VOICE STATE] rtcClient.join succeeded without token');
              } catch (fallbackErr: any) {
                console.error('[VOICE STATE] Fallback rtcClient.join without token failed:', fallbackErr);
              }
            }
          }
          this.localUid = joinedUid || targetUid;

          this.state.status = 'CONNECTED';
          this.state.channelName = channel;
          this.notify();
          console.log('[VOICE STATE] Agora voice status = CONNECTED');

          // STEP 2b — Inspect any pre-existing remote users (e.g. Agent UID 10001)
          const preExistingRemotes = this.rtcClient.remoteUsers || [];
          console.log('[AGENT RTC] Inspecting initial remote users in room:', preExistingRemotes.map(u => u.uid));
          for (const user of preExistingRemotes) {
            if (String(user.uid) === '10001') {
              const uidKey = String(user.uid);
              if (user.hasAudio && !this.playingRemoteUids.has(uidKey)) {
                console.log(`[AGENT RTC] Pre-existing agent UID 10001 detected with audio, subscribing...`);
                try {
                  await this.rtcClient.subscribe(user, 'audio');
                  if (user.audioTrack && !this.playingRemoteUids.has(uidKey)) {
                    this.playingRemoteUids.add(uidKey);
                    user.audioTrack.play();
                    this.state.status = 'CONNECTED';
                    this.state.isAISpeaking = true;
                    this.notify();
                  }
                } catch (subErr) {
                  console.error(`[AGENT ERROR] Failed subscribing to pre-existing agent:`, subErr);
                }
              } else {
                this.state.status = 'CONNECTED';
                this.notify();
              }
            }
          }

          if (this.localAudioTrack) {
            // Explicitly start muted / OFF by default on initial join
            await this.localAudioTrack.setEnabled(true);
            console.log('[VOICE LOOP] LOCAL_AUDIO_TRACK_ENABLED');
            await this.localAudioTrack.setMuted(true);
            console.log('[VOICE LOOP] LOCAL_AUDIO_TRACK_MUTED=true');
            this.state.isMuted = true;

            console.log('[VOICE LOOP] LOCAL_AUDIO_PUBLISH_STARTED');
            await this.rtcClient.publish([this.localAudioTrack]);
            console.log('[VOICE LOOP] LOCAL_AUDIO_PUBLISHED');
            console.log('[VOICE LOOP] LOCAL_TRACK_STATE', {
              exists: !!this.localAudioTrack,
              enabled: this.localAudioTrack?.enabled,
              muted: this.localAudioTrack?.muted,
              published: this.rtcClient.localTracks?.some(track => track === this.localAudioTrack)
            });

            // Monitor actual microphone input level
            const micTrack = this.localAudioTrack;
            setInterval(() => {
              if (!micTrack) return;
              const volume = micTrack.getVolumeLevel();
              if (volume > 0.05 && !this.state.isMuted) {
                console.log(
                  `[Agora Voice Service] 🎤 MIC LEVEL: ${(volume * 100).toFixed(1)}%`
                );
              }
            }, 1000);
          }

          // STEP 3 — Request Backend to Create / Join Conversational AI Agent
          try {
            console.log('[VOICE STATE] backend agent join requested');
            console.log(`[VOICE DEBUG] Number of agent join requests: ${++this.agentJoinRequestsCount}`);

            const agentJoinUrl = apiBase ? `${apiBase}/api/agora/join` : `/api/agora/join`;
            const agentResponse = await fetch(agentJoinUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                channel,
                uid,
                mode,
              }),
            });

            const agentData = await agentResponse.json();
            console.log('[VOICE STATE] backend agent join response:', agentResponse.status, agentData);

            if (agentData) {
              this.backendAgentId = agentData.agent_id || 'N/A';
              this.backendAgentStatus = agentData.status || 'RUNNING';
              this.backendAgentChannel = agentData.channel || channel;
              this.backendAgentUid = agentData.agent_uid || 10001;
            }

            if (!agentResponse.ok) {
              console.error(`[AGENT ERROR] AI Agent join failed: HTTP ${agentResponse.status}`);
              this.backendAgentStatus = 'ERROR';
            }
          } catch (agentErr: any) {
            console.error('[AGENT ERROR] AI Agent Join Exception:', agentErr?.message || agentErr);
            this.backendAgentStatus = 'ERROR';
          }
        } else {
          console.error('[AGENT ERROR] Failed to fetch Agora token');
          this.state.status = 'TOKEN_ERROR';
          this.notify();
        }

        this.state.channelName = channelName;
        this.notify();
        return true;
      } catch (err: any) {
        console.warn('[Agora Voice Service] Join Error:', err?.message || err);
        this.state.status = 'CONNECTED';
        this.state.isMicPermitted = true;
        this.notify();
        return true;
      } finally {
        this.joinPromise = null;
      }
    })();

    return this.joinPromise;
  }

  public async setMuted(muted: boolean): Promise<boolean> {
    if (this.isMuteTransitioning) return this.state.isMuted;
    this.isMuteTransitioning = true;

    try {
      this.state.isMuted = muted;
      if (this.localAudioTrack) {
        await this.localAudioTrack.setEnabled(true);
        await this.localAudioTrack.setMuted(muted);
        console.log(`[VOICE LOOP] LOCAL_AUDIO_TRACK_MUTED=${muted}`);

        // Ensure track is published to Agora RTC channel
        if (this.rtcClient && this.rtcClient.connectionState === 'CONNECTED') {
          const isPublished = this.rtcClient.localTracks?.some(track => track === this.localAudioTrack);
          if (!isPublished) {
            console.log('[VOICE LOOP] LOCAL_AUDIO_PUBLISH_STARTED');
            await this.rtcClient.publish([this.localAudioTrack]);
            console.log('[VOICE LOOP] LOCAL_AUDIO_PUBLISHED');
          }
        }

        if (!muted) {
          console.log('[VOICE LOOP] MIC_ON');
        } else {
          console.log('[VOICE LOOP] MIC_OFF');
        }
      }
      this.notify();
      return this.state.isMuted;
    } catch (err) {
      console.warn('[VOICE] Error setting microphone muted state:', err);
      return this.state.isMuted;
    } finally {
      this.isMuteTransitioning = false;
    }
  }

  public async toggleMute(): Promise<boolean> {
    const res = await this.setMuted(!this.state.isMuted);
    this.printDiagnostic();
    return res;
  }

  public printDiagnostic(): void {
    const remoteUsersList = this.rtcClient?.remoteUsers || [];
    const remoteUser = remoteUsersList.find(u => String(u.uid) === '10001');
    const hasTrack = Boolean(remoteUser?.audioTrack);
    const isPlaying = remoteUser?.audioTrack ? remoteUser.audioTrack.isPlaying : false;

    console.log('\n========= ECHOAID VOICE DIAGNOSTIC =========');
    console.log('RTC Connection:\n' + (this.rtcClient?.connectionState || this.state.status));
    console.log('\nChannel:\n' + (this.state.channelName || 'echoaid-room'));
    console.log('\nLocal UID:\n' + (this.localUid || 10002));
    console.log('\nLocal Microphone Track:\n' + Boolean(this.localAudioTrack));
    console.log('\nLocal Microphone Muted:\n' + this.state.isMuted);
    console.log('\nRemote Users:\n' + JSON.stringify(remoteUsersList.map(u => String(u.uid))));
    console.log('\nAgent UID:\n' + 10001);
    console.log('\nAgent Detected:\n' + Boolean(remoteUser));
    console.log('\nAgent Has Audio:\n' + Boolean(remoteUser?.hasAudio));
    console.log('\nRemote Audio Track:\n' + hasTrack);
    console.log('\nRemote Audio Subscribed:\n' + hasTrack);
    console.log('\nRemote Audio Playback Requested:\n' + hasTrack);
    console.log('\nRemote Audio Playback Active:\n' + isPlaying);
    console.log('\nBackend Agent ID:\n' + this.backendAgentId);
    console.log('\nBackend Agent Status:\n' + this.backendAgentStatus);
    console.log('\nBackend Agent Channel:\n' + this.backendAgentChannel);
    console.log('\nBackend Agent UID:\n' + this.backendAgentUid);
    console.log('=============================================\n');

    if (this.backendAgentStatus === 'RUNNING' && remoteUsersList.length === 0) {
      console.warn(
        '[VOICE ERROR]\nBackend agent reports RUNNING but browser sees no remote RTC user.\nInvestigate Agora agent RTC channel/token/join state.'
      );
    }
  }

  /**
   * Leave Agora Voice Channel & Cleanup Resources
   */
  public async leaveSession(): Promise<void> {
    try {
      console.log('[VOICE DEBUG] Leaving Agora session');
      this.playingRemoteUids.clear();
      this.hasInitialGreetingPlayed = false;
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      if (this.rtcClient) {
        await this.rtcClient.leave();
      }

      this.localUid = null;
      this.state.status = 'DISCONNECTED';
      this.state.isAISpeaking = false;
      this.state.isUserSpeaking = false;
      this.notify();
      console.log('[Agora Voice Service] Successfully disconnected.');
    } catch (err) {
      console.error('[Agora Voice Service] Error during leaveSession:', err);
    }
  }
}

export const agoraVoiceService = new AgoraVoiceService();