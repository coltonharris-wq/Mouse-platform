'use client';

import { useState } from 'react';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  Settings, 
  MessageSquare, 
  Radio, 
  Gauge,
  X,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { VoiceSettings, VoiceMode, VoiceGender, VoiceTone, InputMode } from '@/app/hooks/useVoiceChat';

interface VoiceSettingsPanelProps {
  settings: VoiceSettings;
  conversationMode: VoiceMode;
  isMuted: boolean;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
  onToggleMute: () => void;
  onSetConversationMode: (mode: VoiceMode) => void;
  onClose: () => void;
  voiceMinutesUsed: number;
  voiceCostMultiplier: number;
}

const VOICE_PREVIEWS: Record<VoiceGender, Record<VoiceTone, { name: string; desc: string }>> = {
  male: {
    professional: { name: 'Adam', desc: 'Confident, authoritative business voice' },
    friendly: { name: 'Josh', desc: 'Warm, approachable conversationalist' },
    energetic: { name: 'Antoni', desc: 'Dynamic, enthusiastic presenter' },
    calm: { name: 'Chris', desc: 'Relaxed, soothing narrator' },
  },
  female: {
    professional: { name: 'Alice', desc: 'Polished, corporate executive tone' },
    friendly: { name: 'Rachel', desc: 'Cheerful, helpful assistant vibe' },
    energetic: { name: 'Elli', desc: 'Bright, engaging storyteller' },
    calm: { name: 'Charlotte', desc: 'Gentle, meditative presence' },
  },
};

export default function VoiceSettingsPanel({
  settings,
  conversationMode,
  isMuted,
  onUpdateSettings,
  onToggleMute,
  onSetConversationMode,
  onClose,
  voiceMinutesUsed,
  voiceCostMultiplier,
}: VoiceSettingsPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('mode');
  const [testSpeaking, setTestSpeaking] = useState(false);

  const handleTestVoice = async () => {
    setTestSpeaking(true);
    setTimeout(() => setTestSpeaking(false), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="absolute bottom-full right-0 mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h3 className="font-semibold">Voice Settings</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('mode')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Radio className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Conversation Mode</p>
                <p className="text-xs text-gray-500">
                  {conversationMode === 'voice' ? 'Full voice chat' : 'Text only'}
                </p>
              </div>
            </div>
            {expandedSection === 'mode' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSection === 'mode' && (
            <div className="px-4 pb-4 space-y-2">
              <button
                onClick={() => onSetConversationMode('text')}
                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  conversationMode === 'text'
                    ? 'border-blue-700 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MessageSquare className={`w-5 h-5 ${conversationMode === 'text' ? 'text-blue-700' : 'text-gray-400'}`} />
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">Text Mode</p>
                  <p className="text-xs text-gray-500">Type your messages normally</p>
                </div>
                {conversationMode === 'text' && (
                  <div className="w-4 h-4 bg-blue-700 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>

              <button
                onClick={() => onSetConversationMode('voice')}
                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  conversationMode === 'voice'
                    ? 'border-blue-700 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mic className={`w-5 h-5 ${conversationMode === 'voice' ? 'text-blue-700' : 'text-gray-400'}`} />
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">Voice Mode</p>
                  <p className="text-xs text-gray-500">Speak naturally, King responds by voice</p>
                </div>
                {conversationMode === 'voice' && (
                  <div className="w-4 h-4 bg-blue-700 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>

              {conversationMode === 'voice' && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Voice chat uses {voiceCostMultiplier}x work hours
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('voice')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-purple-700" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">King&apos;s Voice</p>
                <p className="text-xs text-gray-500">
                  {VOICE_PREVIEWS[settings.gender][settings.tone].name} — {settings.gender}, {settings.tone}
                </p>
              </div>
            </div>
            {expandedSection === 'voice' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSection === 'voice' && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['male', 'female'] as VoiceGender[]).map((gender) => (
                    <button
                      key={gender}
                      onClick={() => onUpdateSettings({ gender })}
                      className={`p-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        settings.gender === gender
                          ? 'border-purple-700 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['professional', 'friendly', 'energetic', 'calm'] as VoiceTone[]).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => onUpdateSettings({ tone })}
                      className={`p-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        settings.tone === tone
                          ? 'border-purple-700 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {VOICE_PREVIEWS[settings.gender][settings.tone].name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {VOICE_PREVIEWS[settings.gender][settings.tone].desc}
                    </p>
                  </div>
                  <button
                    onClick={handleTestVoice}
                    disabled={testSpeaking}
                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                  >
                    {testSpeaking ? (
                      <span className="flex gap-0.5">
                        <span className="w-1 h-4 bg-purple-700 rounded-full animate-bounce" />
                        <span className="w-1 h-4 bg-purple-700 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-1 h-4 bg-purple-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </span>
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('speed')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Gauge className="w-4 h-4 text-green-700" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Speaking Speed</p>
                <p className="text-xs text-gray-500">{settings.speed.toFixed(1)}x</p>
              </div>
            </div>
            {expandedSection === 'speed' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSection === 'speed' && (
            <div className="px-4 pb-4">
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.speed}
                onChange={(e) => onUpdateSettings({ speed: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Slow (0.5x)</span>
                <span>Normal (1.0x)</span>
                <span>Fast (1.5x)</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('input')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-orange-700" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Input Mode</p>
                <p className="text-xs text-gray-500 capitalize">{settings.inputMode.replace('-', ' ')}</p>
              </div>
            </div>
            {expandedSection === 'input' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSection === 'input' && (
            <div className="px-4 pb-4 space-y-2">
              <button
                onClick={() => onUpdateSettings({ inputMode: 'auto-detect' })}
                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  settings.inputMode === 'auto-detect'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">Auto-Detect</p>
                  <p className="text-xs text-gray-500">Continuous listening, detects speech automatically</p>
                </div>
                {settings.inputMode === 'auto-detect' && (
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>

              <button
                onClick={() => onUpdateSettings({ inputMode: 'push-to-talk' })}
                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  settings.inputMode === 'push-to-talk'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">Push to Talk</p>
                  <p className="text-xs text-gray-500">Hold mic button while speaking</p>
                </div>
                {settings.inputMode === 'push-to-talk' && (
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Auto-reply</span>
                  <span className="text-xs text-gray-500">King speaks, then auto-listens</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ autoReply: !settings.autoReply })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.autoReply ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                      settings.autoReply ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-b border-gray-100">
          <button
            onClick={onToggleMute}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMuted ? 'bg-red-100' : 'bg-gray-100'}`}>
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-600" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="text-left">
                <p className={`font-medium ${isMuted ? 'text-red-600' : 'text-gray-900'}`}>
                  {isMuted ? 'Muted' : 'Sound On'}
                </p>
                <p className="text-xs text-gray-500">
                  {isMuted ? 'King will not speak aloud' : 'Voice responses enabled'}
                </p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${isMuted ? 'bg-red-500' : 'bg-gray-300'}`}>
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  isMuted ? 'left-6' : 'left-0.5'
                }`}
              />
            </div>
          </button>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Voice Usage Today</span>
            <span className="text-sm text-gray-900 font-semibold">{formatMinutes(voiceMinutesUsed)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Uses {voiceCostMultiplier}x work hours</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Estimated cost: {(voiceMinutesUsed * voiceCostMultiplier / 60).toFixed(2)} hours
          </div>
        </div>
      </div>
    </div>
  );
}
