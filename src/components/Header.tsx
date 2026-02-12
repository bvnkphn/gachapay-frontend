import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Search, User, Crown, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { path: "/", label: "หน้าแรก" },
  { path: "/history", label: "ประวัติการเติม" },
  { path: "/vip", label: "VIP" },
  { path: "/support", label: "ช่วยเหลือ" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CYBERPAY
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-1">
                Game Top-up Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="headerNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-cyber rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* VIP Badge - only show when logged in */}
            {user && (
              <Link to="/vip" className="hidden sm:block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30"
                >
                  <Crown className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-medium text-secondary">Silver</span>
                </motion.div>
              </Link>
            )}

            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full">
                      <Avatar className="w-8 h-8 border border-primary/50">
                        <AvatarFallback className="bg-gradient-cyber text-primary-foreground text-sm font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">บัญชีของฉัน</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/history" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        ประวัติการเติม
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/vip" className="flex items-center gap-2 cursor-pointer">
                        <Crown className="w-4 h-4" />
                        VIP Membership
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-cyber border-0 text-primary-foreground hover:opacity-90"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    เข้าสู่ระบบ
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
