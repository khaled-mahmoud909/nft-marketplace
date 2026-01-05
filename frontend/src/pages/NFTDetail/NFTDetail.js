import { useCallback, useEffect, useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { nftAPI, transactionAPI } from "../../services/api";
import { Link, useNavigate, useParams } from "react-router-dom";
import TransferNFTModal from "../../components/TransferNFTModal/TransferNFTModal";


const NFTDetail = () => {

    const { tokenId } = useParams();
    const navigate = useNavigate();
    const { account } = useWeb3();

    const [nft, setNft] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(false);

    const isOwner = nft && account && nft.owner.toLowerCase() === account.toLowerCase();


    const fetchNFTDetail = useCallback(async () => {
        try {
            setLoading(true);
            const nftRes = await nftAPI.getById(tokenId);
            setNft(nftRes.data);

            const txRes = await transactionAPI.getByToken(tokenId, { limit: 10 });
            setTransactions(txRes.data.transactions || []);

        } catch (err) {
            setError('Failed to load NFT details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [tokenId]);
    useEffect(() => {
        fetchNFTDetail();
    }, [fetchNFTDetail]);

    const handleTransferSuccess = () => {
        setShowTransferModal(false);
        fetchNFTDetail();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading NFT...</p>
            </div>
        </div>
        )
    };

    if (error || !nft) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="card max-w-md text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">NFT Not Found</h2>
            <p className="text-gray-600 mb-6">
                {error || 'This NFT does not exist or has been removed.'}
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
                Back to Gallery
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
            {/* Back Button */}
            <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
            >
            <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
                />
            </svg>
            Back to Gallery
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div className="card">
                <div className="relative pb-[100%] bg-gray-200 rounded-lg overflow-hidden">
                <img
                    src={nft.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s'}
                    alt={nft.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                    e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s';
                    }}
                />
                </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
                {/* NFT Info Card */}
                <div className="card">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {nft.name}
                </h1>
                
                {nft.description && (
                    <p className="text-gray-600 mb-6">{nft.description}</p>
                )}

                {/* Owner Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                    <p className="text-sm text-gray-500 mb-1">Owner</p>
                    <Link
                        to={`/profile`}
                        className="text-primary-600 hover:text-primary-700 font-mono text-sm font-medium"
                    >
                        {nft.owner.substring(0, 6)}...{nft.owner.substring(38)}
                    </Link>
                    {isOwner && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        You
                        </span>
                    )}
                    </div>

                    <div>
                    <p className="text-sm text-gray-500 mb-1">Creator</p>
                    <Link
                        to={`/profile`}
                        className="text-primary-600 hover:text-primary-700 font-mono text-sm font-medium"
                    >
                        {nft.minter.substring(0, 6)}...{nft.minter.substring(38)}
                    </Link>
                    </div>
                </div>

                {/* Token Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                    <span className="text-gray-600">Token ID</span>
                    <span className="font-bold text-gray-800">#{nft.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-600">Blockchain</span>
                    <span className="font-medium text-gray-800">Sepolia</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-600">Token Standard</span>
                    <span className="font-medium text-gray-800">ERC-721</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                    {isOwner && (
                    <button
                        onClick={() => setShowTransferModal(true)}
                        className="btn-primary w-full"
                    >
                        Transfer NFT
                    </button>
                    )}

                    <div className="text-center text-gray-500 w-full">
                        <a href={`https://sepolia.etherscan.io/token/${process.env.REACT_APP_CONTRACT_ADDRESS}?a=${nft.tokenId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary w-full text-center"
                            >
                            View on Etherscan
                        </a>
                    </div>
                </div>
            </div>

                {/* Transaction History Card */}
                <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Transaction History
                </h2>

                {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                    No transactions yet
                    </p>
                ) : (
                    <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div
                        key={tx.transactionHash}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                        <div className="flex items-center justify-between mb-2">
                            <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                tx.type === 'mint'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                            >
                            {tx.type === 'mint' ? '🎨 Minted' : '🔄 Transferred'}
                            </span>
                            <span className="text-xs text-gray-500">
                            {new Date(tx.timestamp).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="space-y-1 text-sm">
                            {tx.from && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">From:</span>
                                <span className="font-mono text-gray-800">
                                {tx.from.substring(0, 6)}...{tx.from.substring(38)}
                                </span>
                            </div>
                            )}
                            <div className="flex justify-between">
                            <span className="text-gray-600">To:</span>
                            <span className="font-mono text-gray-800">
                                {tx.to.substring(0, 6)}...{tx.to.substring(38)}
                            </span>
                            </div>
                        </div>

                        
                        <a href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-xs mt-2 inline-block"
                        >
                            View on Etherscan →
                        </a>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>

        {/* Transfer Modal */}
        {showTransferModal && (
            <TransferNFTModal
            nft={nft}
            onClose={() => setShowTransferModal(false)}
            onSuccess={handleTransferSuccess}
            />
        )}
        </div>
    );
};

export default NFTDetail;