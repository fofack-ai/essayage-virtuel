import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const currentLang = i18n.language?.slice(0, 2) || 'fr';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="lang-switcher" ref={wrapperRef}>
      <button
        className={`lang-switcher-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Changer de langue"
        aria-expanded={isOpen}
      >
        <Globe size={16} strokeWidth={2} />
        <span className="lang-switcher-code">{currentLang.toUpperCase()}</span>
        <ChevronDown size={14} strokeWidth={2} className="lang-switcher-chevron" />
      </button>

      {isOpen && (
        <div className="lang-switcher-menu">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`lang-switcher-option ${currentLang === lang.code ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span>{lang.label}</span>
              {currentLang === lang.code && <Check size={15} strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}