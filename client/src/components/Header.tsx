import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <svg className="w-10 h-10 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L4 7L12 11L20 7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 17L12 21L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Galbi Creator</h1>
              <p className="text-xs md:text-sm opacity-80">by <span className="font-semibold">Acadewise</span></p>
            </div>
          </div>
          
          <nav className="flex-1 flex justify-center md:justify-center mx-8">
            <ul className="flex space-x-6">
              <li><a href="#generators" className="hover:text-gray-200 transition font-medium">Generators</a></li>
              <li><a href="#gallery" className="hover:text-gray-200 transition font-medium">Gallery</a></li>
              <li><a href="#upload" className="hover:text-gray-200 transition font-medium">Upload</a></li>
              <li><a href="#help" className="hover:text-gray-200 transition font-medium">Help</a></li>
            </ul>
          </nav>
          
          <div className="flex items-center mt-4 md:mt-0">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden md:inline-block text-sm">
                  {user.isPremium ? (
                    <span className="flex items-center">
                      <span className="animate-pulse mr-1">✨</span> 
                      Premium
                    </span>
                  ) : (
                    <span>Free Plan: {user.generationsRemaining}/2</span>
                  )}
                </span>
                <a href="#profile" className="text-white font-medium hover:underline">
                  {user.username}
                </a>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-purple-700"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          Create <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-300">Stunning Art</span> & 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-300"> 3D Models</span>
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Acadewise's professional AI toolkit for generating beautiful artwork and 3D models in seconds.
          {!user && " Sign in to get started."}
        </p>
        <div className="mt-6 text-xs opacity-75">
          Powered by Acadewise's proprietary algorithms • No external APIs
        </div>
      </div>
    </header>
  );
}
