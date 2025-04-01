import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { downloadFromUrl } from '@/lib/utils';
import { Creation } from '@/types';

export default function Gallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('creations');

  // Load creations and uploads from localStorage
  useEffect(() => {
    if (!user) return;

    // Load creations
    const savedCreations = localStorage.getItem('creations');
    if (savedCreations) {
      const parsedCreations = JSON.parse(savedCreations);
      // Filter by current user
      const userCreations = parsedCreations.filter((creation: any) => 
        creation.userId === user.id
      );
      setCreations(userCreations);
    }

    // Load uploads
    const savedUploads = localStorage.getItem('uploads');
    if (savedUploads) {
      const parsedUploads = JSON.parse(savedUploads);
      // Filter by current user
      const userUploads = parsedUploads.filter((upload: any) => 
        upload.userId === user.id
      );
      setUploads(userUploads);
    }
  }, [user]);

  // Handle download
  const handleDownload = async (creation: Creation) => {
    try {
      await downloadFromUrl(creation.imageUrl, `galbi-art-${creation.id}.png`);
      toast({
        title: 'Downloaded',
        description: 'Image downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Could not download the image',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Gallery</CardTitle>
          <CardDescription>
            You need to be logged in to view your gallery
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Gallery</CardTitle>
        <CardDescription>
          View and manage your creations and uploads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="creations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="creations" 
              onClick={() => setActiveTab('creations')}
            >
              Generated Art
            </TabsTrigger>
            <TabsTrigger 
              value="uploads" 
              onClick={() => setActiveTab('uploads')}
            >
              Uploaded Images
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="creations" className="mt-4">
            {creations.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-gray-500">You haven't created any artwork yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Use the generators to create your first piece
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {creations.map((creation, index) => (
                  <div key={creation.id} className="group relative border rounded-lg overflow-hidden">
                    <img
                      src={creation.imageUrl}
                      alt={`Creation ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => handleDownload(creation)}
                      >
                        Download
                      </Button>
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-500 truncate">
                        {creation.prompt}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(creation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="uploads" className="mt-4">
            {uploads.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-gray-500">You haven't uploaded any images yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Upload images to use as references or inspiration
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploads.map((upload, index) => (
                  <div key={upload.id} className="group relative border rounded-lg overflow-hidden">
                    <img
                      src={upload.imageUrl}
                      alt={`Upload ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-500 truncate">
                        {upload.originalName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}