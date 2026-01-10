import React, { useState, useEffect, useCallback } from 'react';
import { nftAPI, transactionAPI } from '../../services/api';
import NFTCard from '../../components/NFTCard/NFTCard';
import { Link } from 'react-router-dom';

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recentTransactions, setRecentTransactions] = useState([]);

  
  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching NFTs...');
      const response = await nftAPI.getAll({ page, limit: 12 });
      console.log('NFTs fetched:', response.data);
      setNfts(response.data.nfts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch NFTs:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('Error config:', err.config);
      
      let errorMessage = 'Failed to load NFTs. ';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage += 'Cannot connect to backend. Make sure it\'s running on http://localhost:5000';
      } else if (err.response) {
        errorMessage += `Server error: ${err.response.status} - ${err.response.statusText}`;
        if (err.response.data?.message) {
          errorMessage += ` (${err.response.data.message})`;
        }
      } else if (err.request) {
        errorMessage += 'No response from server. Check if backend is running.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchRecentTransactions = useCallback(async () => {
    try {
      const response = await transactionAPI.getAll({ page: 1, limit: 5 });
      setRecentTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch recent transactions:', err);
      setError('Failed to load recent transactions.');
    }
  }, []);

  useEffect(() => {
    fetchNFTs();
    fetchRecentTransactions();
  }, [fetchNFTs, fetchRecentTransactions]);
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchNFTs} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            NFT Gallery
          </h1>
          <p className="text-gray-600">
            Explore unique digital assets on the blockchain
          </p>
        </div>

        {recentTransactions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.transactionHash} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl`}>
                      {tx.type === 'mint' ? '🎨' : '🔄'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {tx.type === 'mint' ? 'NFT Minted' : 'NFT Transferred'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Token #{tx.tokenId} • {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link to={`/nft/${tx.tokenId}`} className="btn-secondary text-sm py-1 px-3">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NFT Grid */}
        {nfts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No NFTs found. Be the first to mint one!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <NFTCard key={nft.tokenId} nft={nft} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;