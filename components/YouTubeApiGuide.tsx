import React, { useState } from 'react';
import { useTranslation } from '../shims';

export const YouTubeApiGuide: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (stepNumber: number) => {
    if (expandedStep === stepNumber) {
      setExpandedStep(null);
    } else {
      setExpandedStep(stepNumber);
    }
  };

  return (
    <div className="mt-6 p-4 bg-hud-bg-secondary border border-hud-border rounded-md">
      <h3 className="text-lg font-bold text-hud-text mb-4">{t('apiGuide.title')}</h3>
      
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="border border-hud-border rounded-md overflow-hidden">
          <button 
            className="w-full flex justify-between items-center p-3 text-left bg-hud-bg hover:bg-hud-bg-secondary transition-colors"
            onClick={() => toggleStep(1)}
          >
            <span className="font-medium">1. {t('apiGuide.step1.title')}</span>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedStep === 1 ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedStep === 1 && (
            <div className="p-4 border-t border-hud-border">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>{t('apiGuide.step1.instruction1')}</li>
                <li>{t('apiGuide.step1.instruction2')}</li>
                <li>{t('apiGuide.step1.instruction3')}</li>
              </ol>
              <div className="mt-3 p-3 bg-hud-bg rounded-md text-xs">
                <p className="font-mono">{t('apiGuide.step1.url')}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Step 2 */}
        <div className="border border-hud-border rounded-md overflow-hidden">
          <button 
            className="w-full flex justify-between items-center p-3 text-left bg-hud-bg hover:bg-hud-bg-secondary transition-colors"
            onClick={() => toggleStep(2)}
          >
            <span className="font-medium">2. {t('apiGuide.step2.title')}</span>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedStep === 2 ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedStep === 2 && (
            <div className="p-4 border-t border-hud-border">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>{t('apiGuide.step2.instruction1')}</li>
                <li>{t('apiGuide.step2.instruction2')}</li>
                <li>{t('apiGuide.step2.instruction3')}</li>
                <li>{t('apiGuide.step2.instruction4')}</li>
              </ol>
            </div>
          )}
        </div>
        
        {/* Step 3 */}
        <div className="border border-hud-border rounded-md overflow-hidden">
          <button 
            className="w-full flex justify-between items-center p-3 text-left bg-hud-bg hover:bg-hud-bg-secondary transition-colors"
            onClick={() => toggleStep(3)}
          >
            <span className="font-medium">3. {t('apiGuide.step3.title')}</span>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedStep === 3 ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedStep === 3 && (
            <div className="p-4 border-t border-hud-border">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>{t('apiGuide.step3.instruction1')}</li>
                <li>{t('apiGuide.step3.instruction2')}</li>
                <li>{t('apiGuide.step3.instruction3')}</li>
                <li>{t('apiGuide.step3.instruction4')}</li>
                <li>{t('apiGuide.step3.instruction5')}</li>
              </ol>
            </div>
          )}
        </div>
        
        {/* Step 4 */}
        <div className="border border-hud-border rounded-md overflow-hidden">
          <button 
            className="w-full flex justify-between items-center p-3 text-left bg-hud-bg hover:bg-hud-bg-secondary transition-colors"
            onClick={() => toggleStep(4)}
          >
            <span className="font-medium">4. {t('apiGuide.step4.title')}</span>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedStep === 4 ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedStep === 4 && (
            <div className="p-4 border-t border-hud-border">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>{t('apiGuide.step4.instruction1')}</li>
                <li>{t('apiGuide.step4.instruction2')}</li>
                <li>{t('apiGuide.step4.instruction3')}</li>
              </ol>
              <div className="mt-4 p-3 bg-hud-bg rounded-md">
                <p className="text-xs text-hud-text-secondary">{t('apiGuide.step4.note')}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Step 5 */}
        <div className="border border-hud-border rounded-md overflow-hidden">
          <button 
            className="w-full flex justify-between items-center p-3 text-left bg-hud-bg hover:bg-hud-bg-secondary transition-colors"
            onClick={() => toggleStep(5)}
          >
            <span className="font-medium">5. {t('apiGuide.step5.title')}</span>
            <svg 
              className={`w-5 h-5 transform transition-transform ${expandedStep === 5 ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedStep === 5 && (
            <div className="p-4 border-t border-hud-border">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>{t('apiGuide.step5.instruction1')}</li>
                <li>{t('apiGuide.step5.instruction2')}</li>
              </ol>
              <div className="mt-4 p-3 bg-hud-bg rounded-md">
                <p className="text-xs text-hud-text-secondary">{t('apiGuide.step5.note')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};