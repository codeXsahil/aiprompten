import { Terminal, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
    searchTerm?: string;
    setSearchTerm?: (term: string) => void;
    isAdmin?: boolean;
    handleLogout?: () => void;
    showSearch?: boolean;
    showAdminControls?: boolean;
}

export const Navbar = ({
    searchTerm,
    setSearchTerm,
    isAdmin,
    handleLogout,
    showSearch = true,
    showAdminControls = true
}: NavbarProps) => {
    return (
        <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
                        <Terminal size={28} />
                        <span className="text-xl font-bold text-foreground tracking-tight">
                            Prompt<span className="text-primary">Gallery</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {showSearch && setSearchTerm && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-muted-foreground" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search prompts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-card border border-border text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-ring transition-all text-foreground"
                                />
                            </div>
                        )}

                        {showAdminControls && isAdmin && handleLogout && (
                            <>
                                <button
                                    onClick={() => window.location.href = '/admin'}
                                    className="text-xs font-medium px-3 py-1 rounded-full bg-primary/20 border border-primary text-primary hover:bg-primary/30 transition-colors"
                                >
                                    Admin Panel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs font-medium px-3 py-1 rounded-full border bg-primary/20 border-primary text-primary transition-colors"
                                >
                                    Log Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
