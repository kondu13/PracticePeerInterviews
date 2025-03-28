import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, CalendarDays, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Fetch match requests to show count in notification icon
  const { data: requests } = useQuery<any>({
    queryKey: ["/api/match-requests"],
    enabled: !!user
  });
  
  const pendingRequestsCount = requests 
    ? requests.incoming.filter((r: any) => r.status === "Pending").length 
    : 0;
  
  if (!user) return null;
  
  const getInitials = (name?: string) => {
    if (!name) return "U"; // Default to "U" for user if name is undefined
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center md:hidden">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary">MockMate</h1>
        </div>
        <button 
          className="text-gray-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>
      
      {/* Mobile Menu - Slide down when open */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setIsMenuOpen(false)}></div>
          <nav className="relative bg-white h-full w-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-bold text-primary">MockMate</h1>
              <button className="text-gray-500" onClick={() => setIsMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Link href="/">
                <div 
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                    location === '/' ? 'bg-indigo-50 text-primary' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </div>
              </Link>
              <Link href="/scheduled-interviews">
                <div 
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                    location === '/scheduled-interviews' ? 'bg-indigo-50 text-primary' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CalendarDays className="w-5 h-5 mr-3" />
                  My Schedule
                </div>
              </Link>
              <Link href="/match-requests">
                <div 
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                    location === '/match-requests' ? 'bg-indigo-50 text-primary' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Match Requests
                  {pendingRequestsCount > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                      {pendingRequestsCount}
                    </span>
                  )}
                </div>
              </Link>
              <Link href="/profile">
                <div 
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                    location === '/profile' ? 'bg-indigo-50 text-primary' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-3" />
                  My Profile
                </div>
              </Link>
            </div>
            
            <div className="mt-auto">
              <div className="py-4 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    ) : (
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    logoutMutation.mutate();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 fixed bottom-0 inset-x-0 z-10 md:hidden">
        <div className="grid grid-cols-4 h-16">
          <Link href="/">
            <div className={`flex flex-col items-center justify-center ${location === '/' ? 'text-primary' : 'text-gray-500'}`}>
              <Home className="text-xl" />
              <span className="text-xs mt-1">Home</span>
            </div>
          </Link>
          <Link href="/scheduled-interviews">
            <div className={`flex flex-col items-center justify-center ${location === '/scheduled-interviews' ? 'text-primary' : 'text-gray-500'}`}>
              <CalendarDays className="text-xl" />
              <span className="text-xs mt-1">Schedule</span>
            </div>
          </Link>
          <Link href="/match-requests">
            <div className={`flex flex-col items-center justify-center ${location === '/match-requests' ? 'text-primary' : 'text-gray-500'}`}>
              <div className="relative">
                <Bell className="text-xl" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {pendingRequestsCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">Requests</span>
            </div>
          </Link>
          <Link href="/profile">
            <div className={`flex flex-col items-center justify-center ${location === '/profile' ? 'text-primary' : 'text-gray-500'}`}>
              <User className="text-xl" />
              <span className="text-xs mt-1">Profile</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
