import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function UserProfile() {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!user) return null;

  // Handle upgrading to premium
  const handleUpgrade = () => {
    setIsPurchasing(true);
    
    // Simulate payment process
    setTimeout(() => {
      // Update user status in localStorage
      updateUser({ 
        isPremium: true,
        generationsRemaining: 999999 // effectively unlimited
      });
      
      // Save the payment record in localStorage
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      payments.push({
        id: Date.now(),
        userId: user.id,
        amount: 9.99,
        status: 'completed',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('payments', JSON.stringify(payments));
      
      toast({
        title: 'Success',
        description: 'Your account has been upgraded to premium!',
      });
      
      setIsPurchasing(false);
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          User Profile
          <Button variant="outline" onClick={logout} size="sm">
            Logout
          </Button>
        </CardTitle>
        <CardDescription>
          Manage your account and subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Username</p>
          <p className="text-gray-600">{user.username}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Email</p>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Account Status</p>
          <p className="flex items-center">
            {user.isPremium ? (
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                Premium
              </span>
            ) : (
              <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold">
                Free
              </span>
            )}
          </p>
        </div>
        
        {!user.isPremium && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Generations Remaining</p>
            <p className="text-lg font-bold">
              {user.generationsRemaining} / 2
            </p>
          </div>
        )}
      </CardContent>
      
      {!user.isPremium && (
        <CardFooter>
          <div className="w-full space-y-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
              <p className="text-sm mb-4">
                Enjoy unlimited generations, priority support, and exclusive features.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">$9.99 / month</span>
                <Button
                  onClick={handleUpgrade}
                  disabled={isPurchasing}
                  className="bg-white text-purple-500 hover:bg-gray-100"
                >
                  {isPurchasing ? 'Processing...' : 'Upgrade Now'}
                </Button>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}