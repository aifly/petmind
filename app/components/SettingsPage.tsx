'use client';

import { useState } from 'react';
import { Settings, Globe, ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsPageProps {
  onBack: () => void;
}

type Language = 'zh' | 'en';

const translations: Record<Language, Record<string, string>> = {
  zh: {
    'title': '设置',
    'language': '语言设置',
    'interfaceLang': '界面语言',
    'about': '关于',
    'version': 'Version',
    'desc': 'AI 智能宠物管理平台，为你的毛孩子提供全方位的健康管理服务。',
  },
  en: {
    'title': 'Settings',
    'language': 'Language Settings',
    'interfaceLang': 'Interface Language',
    'about': 'About',
    'version': 'Version',
    'desc': 'AI Smart Pet Management Platform, providing comprehensive health management services for your pets.',
  },
};

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'zh';
  const saved = localStorage.getItem('petmind-language');
  if (saved === 'zh' || saved === 'en') return saved;
  return 'zh';
}

function setStoredLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('petmind-language', lang);
}

function t(key: string, lang: Language): string {
  return translations[lang][key] || key;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage());
  const [showLangPicker, setShowLangPicker] = useState(false);

  const languages = [
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const handleLanguageChange = (code: 'zh' | 'en') => {
    setStoredLanguage(code);
    setLanguageState(code);
    setShowLangPicker(false);
    toast.success(code === 'zh' ? '已切换到中文' : 'Language changed to English');
    // Force re-render
    window.location.reload();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="返回"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('title', language)}
              </h2>
              <p className="text-gray-400 text-sm">自定义你的使用体验</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Language */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">{t('language', language)}</h3>
            <button
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{t('interfaceLang', language)}</p>
                  <p className="text-sm text-gray-500">
                    {languages.find(l => l.code === language)?.name}
                  </p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
            </button>

            {showLangPicker && (
              <div className="mt-2 space-y-2 animate-fade-in">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as 'zh' | 'en')}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-colors ${
                      language === lang.code
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium text-gray-900">{lang.name}</span>
                    </div>
                    {language === lang.code && (
                      <Check className="w-5 h-5 text-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">{t('about', language)}</h3>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🐾</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">PetMind.ai</p>
                  <p className="text-sm text-gray-500">{t('version', language)} 1.0.0</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {t('desc', language)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
