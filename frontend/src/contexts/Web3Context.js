import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api";


const Web3Context = createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error("useWeb3 must be used within a Web3Provider");
    }
    return context;
};

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const isMetaMaskInstalled = () => {
        return typeof window.ethereum !== 'undefined';
    };

    const isCorrectNetwork = async () => {
        if(!window.ethereum) return false;

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const expectedChainId = `0x${parseInt(process.env.REACT_APP_CHAIN_ID).toString(16)}`;

        return chainId === expectedChainId;
    };

    const switchNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${parseInt(process.env.REACT_APP_CHAIN_ID).toString(16)}` }],
            });
            return true;
        } catch (error) {
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${parseInt(process.env.REACT_APP_CHAIN_ID).toString(16)}`,
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: {
                                name: 'SepoliaETH',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io'],
                        }],
                    });
                    return true;
                } catch (addError) {
                    console.error('Failed to add network:', addError);
                    return false;
                }
            }
            console.error('Failed to switch network:', error);
            return false;
            }
    };

    const connectWallet = async () => {
        if (!isMetaMaskInstalled()) {
            setError("MetaMask is not installed. Please install MetaMask and try again.");
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const correctNetwork = await isCorrectNetwork();
            if (!correctNetwork) {
                const switched = await switchNetwork();
                if (!switched) {
                    throw new Error("Please switch to the Sepolia network in MetaMask.");
                }
            }

            const provider = new window.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = accounts[0];

            setProvider(provider);
            setSigner(signer);
            setAccount(address);

            localStorage.setItem('walletAddress', address);

            return address;
        } catch (err) {
            console.error("Failed to connect wallet:", err);
            setError(err.message || "Failed to connect wallet");
            return null;
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setContract(null);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const authenticate = async () => {
        if(!account || !signer) {
            throw new Error("Wallet not connected");
        }

        try {
            const nonceResponse = await authAPI.getNonce(account);
            const { message } = nonceResponse.data;

            const signature = await signer.signMessage(message);

            const loginResponse = await authAPI.login(account, signature, message);
            const { accessToken, user: userData } = loginResponse.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setIsAuthenticated(true);
            setUser(userData);

            return userData;
        } catch (error) {
            console.error("Authentication failed:", error);
            throw error;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const walletAddress = localStorage.getItem('walletAddress');

        if (token && storedUser && walletAddress) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
            setAccount(walletAddress);

            if (isMetaMaskInstalled()) {
                const provider = new window.BrowserProvider(window.ethereum);
                setProvider(provider);
                provider.getSigner().then(setSigner).catch(console.error);
            }
        }
    }, []);

    useEffect(() => {
        if(!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else if (accounts[0] !== account) {
                disconnectWallet();
                window.location.reload();
            }
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, [account]);

    const value = {
        account,
        provider,
        signer,
        contract,
        isConnecting,
        isAuthenticated,
        user,
        error,
        isMetaMaskInstalled,
        connectWallet,
        disconnectWallet,
        authenticate,
    };

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}