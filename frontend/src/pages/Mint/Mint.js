import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../../contexts/Web3Context";
import { useState } from "react";
import { ethers } from "ethers";


const Mint = () => {
    const { Signer, account } = useWeb3();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
    });
    const [minting, setMinting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!Signer || !account) {
            setError('Please connect your wallet to mint an NFT.');
            return;
        }

        try {
            setMinting(true);
            setError(null);

            const contractAdress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
            const contractABI = [
                "function mintNFT(string memory name, string memory description, string memory imageUrl) public returns (uint256)"
            ]
            const contract = new ethers.Contract(contractAdress, contractABI, Signer);

            const tx = await contract.mintNFT(
                formData.name,
                formData.description,
                formData.imageUrl
            );

            await tx.wait();

            alert('NFT minted successfully!');
            navigate('/profile');
        } catch (err) {
            console.error('Minting failed', err);
            setError(err.message || 'Failed to mint NFT');
        } finally {
            setMinting(false)
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="card">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Mint New NFT
                </h1>
                <p className="text-gray-600 mb-6">
                    Create a unique digital asset on the blockchain
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            NFT Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Cool Dragon #1"
                            className="input"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your NFT..."
                            rows="4"
                            className="input resize-none"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            Image URL *
                        </label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            required
                            placeholder="e.g., https://example.com/image.png"
                            className="input"
                        />
                        <p className="text-gray-500 text-sm mt-1">
                            Paste a URL to your image hosted online (PNG, JPG, GIF).
                        </p>
                    </div>

                    {formData.imageUrl && (
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">
                                Preview:
                            </label>
                            <img
                                src={formData.imageUrl}
                                alt="NFT Preview"
                                className="w-48 h-48 object-cover rounded-lg border"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x400?text=Invalid+Image';
                                }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={minting}
                        className="btn-primary w-full"
                    >
                        {minting ? 'Minting...' : 'Mint NFT'}
                    </button>
                </form>
            </div>
        </div>
    </div>
    );
};

export default Mint;
