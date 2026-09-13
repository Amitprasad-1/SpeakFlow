import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, Check, X, Share } from 'lucide-react';

export const InstallAppButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone app mode
    if (typeof window !== 'undefined') {
      const isRunningStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isRunningStandalone);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent browser from automatically showing generic mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('SpeakFlow PWA was successfully installed as an app');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Detect iOS Safari
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome, Edge, Android native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS doesn't support beforeinstallprompt, show instructions
      setShowIOSModal(true);
    } else {
      // Desktop Chrome or Edge when prompt not fired yet or manual install
      alert('To install SpeakFlow on your computer:\n\nClick the Install icon (💻 or ⊕) in your browser address bar at the top right, or open your browser menu (⋮) and select "Install SpeakFlow".');
    }
  };

  // If already running inside installed standalone app, don't show install button
  if (isStandalone || isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="speakflow-btn"
        title="Install SpeakFlow as a native app on your phone or computer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: 'var(--radius-pill)',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.35)',
          color: 'var(--color-primary)',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(14, 165, 233, 0.12)',
          transition: 'all 0.15s ease'
        }}
      >
        <Download size={13} color="var(--color-primary)" />
        <span>Install App</span>
      </button>

      {/* iOS Safari Install Guide Modal */}
      {showIOSModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '16px'
          }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            style={{
              background: 'var(--color-surface, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              borderRadius: '20px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
              color: 'var(--color-text-primary, #f8fafc)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={20} color="#0ea5e9" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.5 }}>
              Install SpeakFlow to your home screen for full-screen reading without the browser address bar:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  1
                </div>
                <span>Tap the <strong>Share</strong> button (box with arrow <Share size={14} style={{ display: 'inline' }} />) in Safari</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  2
                </div>
                <span>Scroll down and select <strong>'Add to Home Screen'</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  3
                </div>
                <span>Tap <strong>'Add'</strong> in the top-right corner</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                marginTop: '6px',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--color-primary, #0ea5e9)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
