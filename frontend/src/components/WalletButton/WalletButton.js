import { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";


const WalletButton = () => {
    const {
        account,
        isConnecting,
        isAuthenticated,
        connectWallet,
        disconnectWallet,
        authenticate,
        error,
    } = useWeb3();

    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleConnect = async () => {
        const address = await connectWallet();
        if (address) {
            setIsAuthenticating(true);
            try {
                await authenticate();
            } catch (authError) {
                console.error('Authentication failed:', authError);
                alert('Authentication failed. Please try again.');
            } finally {
                setIsAuthenticating(false);
            }
        }
    };

    const formatAddress = (addr) => {
        return `${addr.substring(0, 6)}...${addr.substring(38)}`;
    };

    if(error) {
        return (
            <div className="text-red-600 text-sm">
                {error}
            </div>
        );
    }

    if(!account) {
        return (
            <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn-primary"
            >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
        );
    }

    if(!isAuthenticated) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                    {formatAddress(account)}
                </span>
                <button
                    onClick={authenticate}
                    disabled={isAuthenticating}
                    className="btn-primary"
                >
                    {isAuthenticating ? 'Signing...' : 'Sign In'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
                {formatAddress(account)}
            </span>
            <button
                onClick={disconnectWallet}
                className="btn-secondary text-sm"
            >
                Disconnect
            </button>
        </div>
    );
}

export default WalletButton;