import { Link } from "react-router-dom";
import { useWeb3 } from "../../contexts/Web3Context";
import WalletButton from "../WalletButton/WalletButton";

const Navbar = () => {
    const { isAuthenticated } = useWeb3();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className="text-xl font-bold text-gray-800">NFT Marketplace</span>
                </Link>

                {/* Right side - Nav links */}
                <div className="hidden md:flex space-x-8 items-center">
                    <Link to="/" className="text-gray-600 hover:text-gray-600 font-medium transition-colors">
                        Gallary
                    </Link>

                    {isAuthenticated && (
                        <>
                            <Link to="/mint" className="text-gray-600 hover:text-gray-600 font-medium transition-colors">
                                Mint NFT
                            </Link>
                            <Link to="/profile" className="text-gray-600 hover:text-gray-600 font-medium transition-colors">
                                Profile
                            </Link>
                            <Link to="/transactions" className="text-gray-600 hover:text-gray-600 font-medium transition-colors">
                                Transactions
                            </Link>
                        </>
                    )}
                </div>

                {/* Wallet Button */}
                <WalletButton />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden pb-4 space-y-2">
                <Link
                    to="/"
                    className="block text-gray-700 hover:text-primary-600 font-medium py-2"
                >
                    Gallery
                </Link>
                {isAuthenticated && (
                    <>
                        <Link
                            to="/mint"
                            className="block text-gray-700 hover:text-primary-600 font-medium py-2"
                        >
                            Mint NFT
                        </Link>
                        <Link
                            to="/profile"
                            className="block text-gray-700 hover:text-primary-600 font-medium py-2"
                        >
                            Profile
                        </Link>
                        <Link
                            to="/transactions"
                            className="block text-gray-700 hover:text-primary-600 font-medium py-2"
                        >
                            Transactions
                        </Link>
                    </>
                )}
            </div>
        </div>
    </nav>
    );
};

export default Navbar;