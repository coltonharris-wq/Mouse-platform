'use client';

import { Settings, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-mouse-teal" />
        <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Platform Name</label>
              <input
                type="text"
                defaultValue="Mouse Platform"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Support Email</label>
              <input
                type="email"
                defaultValue="support@mouseplatform.com"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
              </div>
              <button className="w-12 h-6 bg-mouse-teal rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Session Timeout</p>
                <p className="text-sm text-gray-500">Auto-logout after 30 minutes</p>
              </div>
              <button className="w-12 h-6 bg-mouse-teal rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-mouse-teal text-white rounded-lg hover:bg-mouse-teal-dark transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
