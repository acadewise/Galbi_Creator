import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8" id="generators">
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col sm:flex-row mb-6">
        <button 
          onClick={() => onTabChange("2d")}
          className={cn(
            "flex-1 py-4 px-4 rounded-lg font-medium text-lg mb-2 sm:mb-0 sm:mr-3 flex items-center justify-center transition-all duration-200",
            activeTab === "2d" 
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md" 
              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full mr-3 flex items-center justify-center",
            activeTab === "2d" ? "bg-white/20" : "bg-white"
          )}>
            <svg className={cn(
              "w-5 h-5",
              activeTab === "2d" ? "text-white" : "text-purple-600"
            )} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div className="text-left">
            <div className="font-bold">2D Art Creator</div>
            <div className="text-xs opacity-80">
              {activeTab === "2d" ? "Currently selected" : "Generate stunning artwork"}
            </div>
          </div>
        </button>
        <button 
          onClick={() => onTabChange("3d")}
          className={cn(
            "flex-1 py-4 px-4 rounded-lg font-medium text-lg flex items-center justify-center transition-all duration-200",
            activeTab === "3d" 
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md" 
              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full mr-3 flex items-center justify-center",
            activeTab === "3d" ? "bg-white/20" : "bg-white"
          )}>
            <svg className={cn(
              "w-5 h-5",
              activeTab === "3d" ? "text-white" : "text-purple-600"
            )} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
            </svg>
          </div>
          <div className="text-left">
            <div className="font-bold">3D Model Creator</div>
            <div className="text-xs opacity-80">
              {activeTab === "3d" ? "Currently selected" : "Design unique 3D models"}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
