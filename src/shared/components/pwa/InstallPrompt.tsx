import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            toast.success("Thanks for installing the app!");
        }
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-bottom-5">
            <div>
                <h4 className="font-semibold text-sm">Install App</h4>
                <p className="text-xs text-muted-foreground">Add to your home screen for a better experience.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
                    Later
                </Button>
                <Button size="sm" onClick={handleInstallClick} className="gap-2">
                    <Download size={14} />
                    Install
                </Button>
            </div>
        </div>
    );
};

// Type for the BeforeInstallPromptEvent (not in standard TS lib)
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
