import { Link } from "react-router-dom"


const NFTCard = ({ nft }) => {
    return (
        <Link to={`/nft/${nft.tokenId}`} className="block">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                
                <div className="relative pb-[100%] bg-gray-200 rounded-lg overflow-hidden mb-4">
                    <img
                        src={nft.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'}
                        alt={nft.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                        }}
                    />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                        {nft.name || `NFT #${nft.tokenId}`}
                    </h3>

                    {nft.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {nft.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-gray-500">Owner</p>
                            <p className="text-gray-800 font-mono font-medium">
                                {nft.owner?.substring(0, 6)}...{nft.owner?.substring(38)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500">Token ID</p>
                            <p className="text-primary-600 font-bold">
                                #{nft.tokenId}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default NFTCard;