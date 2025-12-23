import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { userAPI } from '../../services/api';
import NFTCard from '../../components/NFTCard/NFTCard';

const Profile = () => {
    const {account, user} = useWeb3();
    const [Profile, setProfile] = useState(null);
    const [nfts, setNfts] = useState([]);
    const [minted, setMinted] = useState([]);
    const [activeTab, setActiveTab] = useState('owned');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(account) {
            fetchProfile();
        }
    }, [account]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const [profileRes, nftsRes, mintedRes] = await Promise.all([
                userAPI.getProfile(account),
                userAPI.getNFTs(account, { limit: 100 }),
                userAPI.getMintedNFTs(account, { limit: 100 }),
            ]);

            setProfile(profileRes.data);
            setNfts(nftsRes.data.nfts);
            setMinted(mintedRes.data.nfts);
        } catch (err) {
            console.error('Failed to fetch profile data:', err);
        } finally {
            setLoading(false);
        }

    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }
    
    const displayNFTs = activeTab === 'owned' ? nfts : minted;

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="container mx-auto px-4">
                {/* Profile Header */}
                <div className="card mb-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">
                                {user?.username?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {user?.username || 'Anonymous User'}
                            </h1>
                            <p className="text-gray-600 text-sm font-mono">
                                {account?.substring(0, 6)}...{account?.substring(36)}
                            </p>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        <div className="text-center p-4 bg-gray-50 rounded-lg shadow">
                            <p className="text-2xl font-bold text-primary-600">
                                {Profile?.nftsOwned || 0}
                            </p>
                            <p className="text-gray-600 text-sm">NFTs Owned</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg shadow">
                            <p className="text-2xl font-bold text-primary-600">
                                {Profile?.nftsMinted || 0}
                            </p>
                            <p className="text-gray-600 text-sm">NFTs Minted</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}

                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors
                            ${activeTab === 'owned'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Owned {nfts.length}
                    </button>
                    <button
                        onClick={() => setActiveTab('minted')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'minted'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Minted ({minted.length})
                    </button>
                </div>

                {/* NFT Grid */}
                {displayNFTs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                        No NFTs found in this category
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayNFTs.map((nft) => (
                            <NFTCard key={nft.tokenId} nft={nft} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;





