import { useState } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import { ethers } from "ethers";


const TransferNFTModal = ({nft, onClose, onSuccess}) => {
    const { signer, account } = useWeb3();
    const [recipient, setRecipient] = useState("");
    const [transferring, setTransferring] = useState(false);
    const [error, setError] = useState(null);

    const validateAddress = (address) => {
        try {
            return ethers.isAddress(address)
        } catch {
            return false;
        }
    }

    const handleTransfer = async (e) => {

        e.preventDefault();
        setError(null);

        if(!signer || !account) {
            setError("Wallet not connected");
            return;
        }

        const validAddress = validateAddress(recipient);
        console.log("Valid address:", recipient, validAddress);
        if(!validAddress) {
            setError("Invalid recipient address");
            return;
        }

        if(recipient.toLowerCase() === account.toLowerCase()) {
            setError("Cannot transfer to your own address");
            return;
        }

        setTransferring(true);

        try {
            const constractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
            const abi = [ 'function transferFrom(address from, address to, uint256 tokenId) public',
            'event NFTTransferred(uint256 indexed tokenId, address indexed from, address indexed to)', ];

            const contract = new ethers.Contract(constractAddress, abi, signer);

            console.log("Initiating transfer:", {from: account, to: recipient, tokenId: nft.tokenId});

            const tx = await contract.transferFrom(account, recipient, nft.tokenId);

            const receipt = await tx.wait();

            console.log("Transfer successful:", receipt);

            alert("Transfer successful!");
            onSuccess();
        } catch (err) {
            console.error("Transfer failed:", err);
            setError("Transfer failed: " + err.message);
        } finally {
            setTransferring(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Transfer NFT</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                        disabled={transferring}
                    >
                        ×
                    </button>
                </div>

                {/* NFT Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                        <img
                            src={nft.imageUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s"}
                            alt={nft.name}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                                e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s';
                            }}
                        />
                        <div>
                            <h3 className="font-bold text-gray-800">{nft.name}</h3>
                            <p className="text-sm text-gray-600">Token ID: #{nft.tokenId}</p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
                )}

                {/* Transfer Form */}
                <form onSubmit={handleTransfer}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            Recipient Address *
                        </label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="0x..."
                            required
                            disabled={transferring}
                            className="input"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Enter the wallet address of the recipient
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ <strong>Warning:</strong> This action cannot be undone. Make sure you trust the recipient and the address is correct.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={transferring}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={transferring || !recipient}
                            className="btn-primary flex-1"
                        >
                            {transferring ? (
                                <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                    Transferring...
                                </span>
                            ) : (
                                'Transfer NFT'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TransferNFTModal;
