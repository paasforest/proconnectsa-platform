"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LogOut, Settings, Bell } from "lucide-react"

export function ClientHeader() {
  const { user, token } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl">ProConnectSA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/how-it-works" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </Link>
          <Link 
            href="/services" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Services
          </Link>
          <Link 
            href="/request-quote" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Request Quote
          </Link>
          <Link 
            href="/immigration" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            🌍 Travel Overseas?
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-4">
          {false ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/how-it-works" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link 
                href="/services" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/request-quote" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Request Quote
              </Link>
              <Link 
                href="/immigration" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🌍 Travel Overseas?
              </Link>
            </nav>
            
            {user ? (
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      Profile
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                      Settings
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="justify-start"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t space-y-2">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}













