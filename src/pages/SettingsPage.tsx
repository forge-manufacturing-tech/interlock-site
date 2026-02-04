import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [rotating, setRotating] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadApiKey();
    }, []);

    const loadApiKey = async () => {
        try {
            setLoading(true);
            // Note: getCurrentUser endpoint doesn't exist in generated API
            // Using user data from auth context instead
            setApiKey((user as any)?.api_key || null);
        } catch (error: any) {
            console.error('Failed to load API key:', error);
            if (error.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRotateKey = async () => {
        if (!window.confirm('Are you sure you want to rotate your API key? The old key will stop working immediately.')) {
            return;
        }

        try {
            setRotating(true);
            // Note: rotateApiKey endpoint doesn't exist in generated API
            alert('API key rotation is not yet implemented');
        } catch (error) {
            console.error('Failed to rotate API key:', error);
            alert('Failed to rotate API key');
        } finally {
            setRotating(false);
        }
    };

    const copyToClipboard = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            alert('API key copied to clipboard');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center metal-texture">
                <div className="text-industrial-steel-400 font-mono uppercase tracking-wider">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-industrial-steel-950 text-neutral-100 metal-texture">
            {/* Header */}
            <header className="border-b border-industrial-concrete bg-industrial-steel-900/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-industrial-steel-400 hover:text-industrial-copper-500 transition-colors font-mono text-sm uppercase"
                        >
                            ← Back to Dashboard
                        </button>
                        <h1 className="industrial-headline text-2xl">SETTINGS</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-industrial-steel-400 font-mono">{user?.email}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-xs bg-industrial-steel-800 hover:bg-industrial-steel-700 border border-industrial-concrete rounded-sm transition-colors uppercase tracking-wide font-mono"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-6 py-8 scanlines">
                <div className="industrial-panel p-8 rounded-sm">
                    <h2 className="industrial-headline text-xl mb-6">API Access</h2>

                    <div className="mb-8">
                        <p className="text-industrial-steel-400 text-sm font-mono mb-4">
                            Your API key grants access to the Interlock API. Keep it secure and do not share it.
                        </p>

                        <div className="bg-industrial-steel-950 border border-industrial-concrete p-4 rounded-sm flex items-center justify-between gap-4">
                            <code className="font-mono text-industrial-copper-400 text-sm truncate flex-1">
                                {apiKey || 'No API key generated'}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                disabled={!apiKey}
                                className="text-industrial-steel-500 hover:text-industrial-copper-500 disabled:opacity-50 transition-colors"
                                title="Copy to clipboard"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleRotateKey}
                            disabled={rotating}
                            className="industrial-btn px-6 py-3 text-sm flex items-center gap-2"
                        >
                            {rotating ? (
                                <>
                                    <span className="animate-spin">⟳</span> Rotating...
                                </>
                            ) : (
                                <>
                                    <span>⟳</span> Rotate API Key
                                </>
                            )}
                        </button>
                        <p className="text-industrial-steel-500 text-xs font-mono mt-2">
                            Rotating your key will invalidate the previous one immediately.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
