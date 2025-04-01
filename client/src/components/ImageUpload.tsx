import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // In a real app, we'd use the server to upload the image
      // For now we'll just pretend to upload and store the image in localStorage
      return new Promise<{id: number, imageUrl: string}>((resolve) => {
        // Create a local URL for the image
        const imageUrl = URL.createObjectURL(selectedFile!);
        
        // Store in localStorage (in a real app this would be server-side)
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        const newUpload = {
          id: Date.now(),
          userId: user?.id || 0,
          imageUrl,
          originalName: selectedFile!.name,
          createdAt: new Date().toISOString()
        };
        uploads.push(newUpload);
        localStorage.setItem('uploads', JSON.stringify(uploads));
        
        // Simulate network delay
        setTimeout(() => {
          resolve({
            id: newUpload.id,
            imageUrl
          });
        }, 1000);
      });
    },
    onSuccess: () => {
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select an image to upload',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload images',
        variant: 'destructive',
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    uploadMutation.mutate(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
        <CardDescription>
          Upload your own images to use as references or inspiration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Select Image
            </label>
            <Input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
          </div>
          
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview</p>
              <div className="relative aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-md border border-gray-200">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={uploadMutation.isPending || !selectedFile}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}