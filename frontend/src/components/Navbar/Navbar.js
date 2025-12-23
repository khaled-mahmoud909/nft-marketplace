import { useWeb3 } from "../../contexts/Web3Context";
import WalletButton from "../WalletButton/Wallet.Button";

const Navbar = () => {
    const { isAuthenticated } = useWeb3();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo */}
                    <link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className="text-xl font-bold text-gray-800">NFT Marketplace</span>
                </link>

                {/* Right side - Nav links */}
                <div className="hidden md:flex space-x-8 items-center">
                    <link to="/" className="text-gray-600 hover:text-gray-600 font-medium transition-colors">
                        Gallary
                    </link>

                    {isAuthenticated && (
                        <>
                            <link to="/mint" className="text-gray-600 hover:text-gray-600 font-medium transition-colors">
                                Mint NFT
                            </link>
                            <link to="/profile" className="text-gray-600 hover:text-gray-600 font-medium transition-colors">
                                Profile
                            </link>
                            <link to="/transactions" className="text-gray-600 hover:text-gray-600 font-medium transition-colors">
                                Transactions
                            </link>
                        </>
                    )}
                </div>

                {/* Wallet Button */}
                <WalletButton />
            </div>
        </div>
    </nav>
    );
};

export default Navbar;