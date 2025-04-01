import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
      <Card className="w-full max-w-md mx-4 border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center mb-6">
            <svg className="w-8 h-8 mr-2 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L4 7L12 11L20 7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 17L12 21L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold text-purple-600">Galbi Creator</span>
          </div>
          
          <div className="flex items-center mb-4 gap-2 justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
          </div>

          <p className="mt-2 text-sm text-gray-600 text-center mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                <ArrowLeft size={16} />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Acadewise Inc. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
