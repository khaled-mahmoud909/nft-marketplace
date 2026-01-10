import { useCallback, useEffect, useState } from "react";
import { transactionAPI } from "../../services/api";
import { Link } from "react-router-dom";


const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);

    const limit = 20;

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {

            const params = {
                page,
                limit
            }


            if(filter !== "all") {
                params.type = filter;
            }

            const response = await transactionAPI.getAll(params);
            setTransactions(response.data.transactions || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            setError("Failed to fetch transactions: " + err.message);
            console.error("Fetch transactions error:", err);
        } finally {
            setLoading(false);
        }
    }, [filter, page, limit]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await transactionAPI.getStats();
            setStats(response.data);
        } catch (err) {
            console.error("Fetch stats error:", err);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const truncateAddress = (address) => {
        if (!address) return "";
        return address.slice(0, 6) + "..." + address.slice(-4);
    };

    const getTransactionTypeIcon = (type) => {
        return type === "mint" ? "🎨" : type === "transfer" ? "🔄" : "⚪️";
    };

    const getTransactionTypeBadge = (type) => {
        return type === "mint" ? "bg-green-100 text-green-800" :
            type === "transfer" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800";
    };
    
    if (loading && transactions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Transaction History
                    </h1>
                    <p className="text-gray-600">
                        View all NFT minting and transfer activity on the marketplace
                    </p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                                    <p className="text-3xl font-bold text-gray-800">
                                        {stats.totalTransactions || 0}
                                    </p>
                                </div>
                                <div className="text-4xl">📊</div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Mints</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {stats.totalMints || 0}
                                    </p>
                                </div>
                                <div className="text-4xl">🎨</div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Transfers</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {stats.totalTransfers || 0}
                                    </p>
                                </div>
                                <div className="text-4xl">🔄</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <p className="text-gray-700 font-medium">Filter by type:</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setFilter('all');
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'all'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => {
                                    setFilter('mint');
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'mint'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                🎨 Mints
                            </button>
                            <button
                                onClick={() => {
                                    setFilter('transfer');
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'transfer'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                🔄 Transfers
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="card bg-red-50 border border-red-200 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Transactions List */}
                <div className="card">
                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                No Transactions Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {filter === 'all'
                                    ? 'No transactions have been recorded yet'
                                    : `No ${filter} transactions found`}
                            </p>
                            <Link to="/mint" className="btn-primary inline-block">
                                Mint Your First NFT
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Token ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                From
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                To
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Transaction
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((tx) => (
                                            <tr
                                                key={tx.transactionHash}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionTypeBadge(
                                                        tx.type,
                                                        )}`}
                                                    >
                                                        {getTransactionTypeIcon(tx.type)}{' '}
                                                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        to={`/nft/${tx.tokenId}`}
                                                        className="text-primary-600 hover:text-primary-700 font-bold"
                                                    >
                                                        #{tx.tokenId}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {tx.from ? (
                                                        <span className="text-gray-800 font-mono text-sm">
                                                        {truncateAddress(tx.from)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-800 font-mono text-sm">
                                                        {truncateAddress(tx.to)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(tx.timestamp)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary-600 hover:text-primary-700 text-sm"
                                                    >
                                                        View →
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {transactions.map((tx) => (
                                    <div
                                        key={tx.transactionHash}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionTypeBadge(
                                                tx.type,
                                                )}`}
                                            >
                                                {getTransactionTypeIcon(tx.type)}{' '}
                                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                            </span>
                                            <Link
                                                to={`/nft/${tx.tokenId}`}
                                                className="text-primary-600 hover:text-primary-700 font-bold"
                                            >
                                                Token #{tx.tokenId}
                                            </Link>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            {tx.from && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">From:</span>
                                                    <span className="text-gray-800 font-mono">
                                                        {truncateAddress(tx.from)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">To:</span>
                                                <span className="text-gray-800 font-mono">
                                                    {truncateAddress(tx.to)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Date:</span>
                                                <span className="text-gray-800">
                                                    {formatDate(tx.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                        <a                   
                                            href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 text-primary-600 hover:text-primary-700 text-sm inline-block"
                                        >
                                            View on Etherscan →
                                        </a>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-gray-600">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;