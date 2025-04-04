import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Home, CalendarDays, Clock, User, Settings, LogOut } from "lucide-react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  if (!user) return null;
  
  const getInitials = (name?: string) => {
    if (!name) return "U"; // Default to "U" for user if name is undefined
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">MockMate</h1>
        </div>
        
        <div className="space-y-1">
          <Link href="/dashboard">
            <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/dashboard') 
                ? 'bg-indigo-50 text-primary' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}>
              <Home className="w-5 h-5 mr-2" />
              Dashboard
            </div>
          </Link>
          <Link href="/scheduled-interviews">
            <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/scheduled-interviews') 
                ? 'bg-indigo-50 text-primary' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}>
              <CalendarDays className="w-5 h-5 mr-2" />
              My Schedule
            </div>
          </Link>
          <Link href="/match-requests">
            <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/match-requests') 
                ? 'bg-indigo-50 text-primary' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}>
              <Clock className="w-5 h-5 mr-2" />
              Match Requests
            </div>
          </Link>
          <Link href="/profile">
            <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/profile') 
                ? 'bg-indigo-50 text-primary' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}>
              <User className="w-5 h-5 mr-2" />
              My Profile
            </div>
          </Link>
          <Link href="/settings">
            <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/settings') 
                ? 'bg-indigo-50 text-primary' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}>
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </div>
          </Link>
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            ) : (
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 w-full flex items-center justify-center"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" /> 
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </nav>
  );
}
