import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import Generator2D from "@/components/Generator2D";
import Generator3D from "@/components/Generator3D";
import Gallery from "@/components/Gallery";
import HelpSection from "@/components/HelpSection";
import Footer from "@/components/Footer";
import Auth from "@/components/auth/Auth";
import UserProfile from "@/components/UserProfile";
import ImageUpload from "@/components/ImageUpload";

export default function Home() {
  const [activeTab, setActiveTab] = useState("2d");
  const { user, isLoading } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoading && !user && (
          <div className="mb-10">
            <Auth />
          </div>
        )}
        
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            <div className="lg:col-span-3">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Welcome, {user.username}!
              </h1>
              <p className="text-gray-600 mb-6">
                Create stunning AI-generated art and 3D models with just a few clicks.
              </p>
            </div>
            
            <div className="lg:col-span-1" id="profile">
              <UserProfile />
            </div>
          </div>
        )}
      </div>
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white shadow-xl rounded-xl p-6 mb-10">
          {activeTab === "2d" ? <Generator2D /> : <Generator3D />}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            <Gallery />
          </div>
          
          <div className="lg:col-span-1">
            <ImageUpload />
          </div>
        </div>
        
        <HelpSection />
      </main>
      
      <Footer />
    </div>
  );
}
