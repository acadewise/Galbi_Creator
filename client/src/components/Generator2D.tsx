import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { LoadingState } from "@/components/ui/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { downloadFromUrl } from "@/lib/utils";
import { Art2DGenerationRequest, ArtStyle, AspectRatio, ColorScheme } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/components/auth/Auth";

// Available art styles
const artStyles: ArtStyle[] = [
  { id: "abstract", name: "Abstract" },
  { id: "realistic", name: "Realistic" },
  { id: "impressionist", name: "Impressionist" },
  { id: "digital", name: "Digital Art" },
  { id: "pixel", name: "Pixel Art" },
  { id: "watercolor", name: "Watercolor" },
];

// Available aspect ratios
const aspectRatios: AspectRatio[] = [
  { id: "1:1", name: "1:1", value: "square" },
  { id: "4:3", name: "4:3", value: "landscape" },
  { id: "16:9", name: "16:9", value: "widescreen" },
];

// Available color schemes
const colorSchemes: ColorScheme[] = [
  { id: "red", name: "Red", color: "bg-red-500" },
  { id: "blue", name: "Blue", color: "bg-blue-500" },
  { id: "green", name: "Green", color: "bg-green-500" },
  { id: "yellow", name: "Yellow", color: "bg-yellow-500" },
  { id: "purple", name: "Purple", color: "bg-purple-500" },
];

// Function to generate SVG art - client-side implementation of server's image generation
const generateSVGArt = (
  prompt: string,
  style: string,
  aspectRatio: string,
  colorScheme: string,
  complexity: number
): string => {
  // Get colors based on color scheme
  const getColors = (): [string, string] => {
    switch (colorScheme) {
      case 'red': return ['#FF5555', '#AA2222'];
      case 'blue': return ['#5555FF', '#2222AA'];
      case 'green': return ['#55FF55', '#22AA22'];
      case 'yellow': return ['#FFFF55', '#AAAA22'];
      case 'purple': return ['#FF55FF', '#AA22AA'];
      default: return ['#FF55FF', '#AA22AA'];
    }
  };

  const [primaryColor, secondaryColor] = getColors();
  
  // Determine dimensions based on aspect ratio
  let width = 800;
  let height = 600;
  
  if (aspectRatio === '1:1') {
    width = 800;
    height = 800;
  } else if (aspectRatio === '16:9') {
    width = 800;
    height = 450;
  }

  // Generate shapes based on style and complexity
  let shapes = '';
  const numShapes = complexity * 5;
  
  for (let i = 0; i < numShapes; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const size = Math.floor(Math.random() * (100 + complexity * 20)) + 20;
    
    // Use different shapes based on the style
    if (style === 'abstract') {
      // Random circles, rectangles, and polygons
      const shapeType = Math.floor(Math.random() * 3);
      
      if (shapeType === 0) {
        shapes += `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${Math.random() > 0.5 ? primaryColor : secondaryColor}" opacity="${0.2 + Math.random() * 0.8}" />`;
      } else if (shapeType === 1) {
        shapes += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${Math.random() > 0.5 ? primaryColor : secondaryColor}" opacity="${0.2 + Math.random() * 0.8}" />`;
      } else {
        const points = [];
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2;
          const pointX = x + Math.cos(angle) * size;
          const pointY = y + Math.sin(angle) * size;
          points.push(`${pointX},${pointY}`);
        }
        shapes += `<polygon points="${points.join(' ')}" fill="${Math.random() > 0.5 ? primaryColor : secondaryColor}" opacity="${0.2 + Math.random() * 0.8}" />`;
      }
    } else if (style === 'pixel') {
      // Small squares for pixel art
      const pixelSize = 20;
      shapes += `<rect x="${Math.floor(x / pixelSize) * pixelSize}" y="${Math.floor(y / pixelSize) * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${Math.random() > 0.5 ? primaryColor : secondaryColor}" />`;
    } else if (style === 'watercolor') {
      // Soft circles with blur for watercolor effect
      shapes += `<circle cx="${x}" cy="${y}" r="${size}" fill="${Math.random() > 0.5 ? primaryColor : secondaryColor}" opacity="${0.1 + Math.random() * 0.4}" filter="blur(10px)" />`;
    } else {
      // Default shape (for other styles)
      shapes += `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${Math.random() > 0.5 ? primaryColor : secondaryColor}" opacity="${0.2 + Math.random() * 0.8}" />`;
    }
  }

  // Add text with the prompt
  const truncatedPrompt = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
  const textElement = `<text x="${width / 2}" y="${height - 20}" 
                             text-anchor="middle" 
                             font-family="Arial" 
                             font-size="14" 
                             fill="#333333">${truncatedPrompt}</text>`;

  // Create the final SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f8f8f8" />
    ${shapes}
    ${textElement}
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function Generator2D() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  
  // Form state
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("abstract");
  const [aspectRatio, setAspectRatio] = useState("4:3");
  const [colorScheme, setColorScheme] = useState("purple");
  const [complexity, setComplexity] = useState(3);
  const [numImages, setNumImages] = useState(1); // Default to 1 image
  
  // Generated images
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  
  // Authentication state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Check if the user is authenticated and has generations remaining
  const canGenerate = user && (user.isPremium || user.generationsRemaining > 0);
  
  // Mutation for generating art
  const generateMutation = useMutation({
    mutationFn: async (data: Art2DGenerationRequest) => {
      // For demo purposes, we'll generate the art on the client side using SVG
      // In a real app, you'd make an API call to your backend

      return new Promise<any[]>((resolve) => {
        const images = [];
        
        for (let i = 0; i < data.numImages; i++) {
          const imageUrl = generateSVGArt(
            data.prompt,
            data.style,
            data.aspectRatio,
            data.colorScheme,
            data.complexity
          );
          
          const id = Date.now() + i;
          
          images.push({
            id,
            prompt: data.prompt,
            imageUrl,
            type: '2d',
            settings: {
              style: data.style,
              aspectRatio: data.aspectRatio,
              colorScheme: data.colorScheme,
              complexity: data.complexity,
            },
            createdAt: new Date().toISOString(),
            userId: user?.id
          });
        }
        
        // Simulate a network delay
        setTimeout(() => {
          resolve(images);
        }, 1000);
      });
    },
    onSuccess: (data) => {
      // Save generated images to localStorage
      const savedCreations = localStorage.getItem('creations');
      const creations = savedCreations ? JSON.parse(savedCreations) : [];
      const updatedCreations = [...creations, ...data];
      localStorage.setItem('creations', JSON.stringify(updatedCreations));
      
      // Update the UI
      setGeneratedImages(data);
      
      // If the user is not premium, decrement their remaining generations
      if (user && !user.isPremium) {
        updateUser({
          generationsRemaining: user.generationsRemaining - 1
        });
      }
      
      toast({
        title: "Success",
        description: "Your artwork has been generated!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate artwork",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a prompt to generate artwork",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    
    if (!canGenerate) {
      toast({
        title: "Generation Limit Reached",
        description: "You've reached your free generations limit. Please upgrade to premium to continue.",
        variant: "destructive",
      });
      return;
    }
    
    generateMutation.mutate({
      prompt,
      style,
      aspectRatio,
      colorScheme,
      complexity,
      numImages,
    });
  };
  
  // Handle download
  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      await downloadFromUrl(imageUrl, `galbi-art-${index}.png`);
      toast({
        title: "Downloaded",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
  };
  
  // Handle incrementing/decrementing number of images
  const incrementNumImages = () => setNumImages(Math.min(numImages + 1, 4));
  const decrementNumImages = () => setNumImages(Math.max(numImages - 1, 1));
  
  if (isAuthOpen) {
    return (
      <div className="max-w-lg mx-auto my-8">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In to Continue</h2>
        <Auth onSuccess={() => setIsAuthOpen(false)} />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Control Panel */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Art Configuration</h3>
          
          {user && !user.isPremium && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertTitle>Free Plan</AlertTitle>
              <AlertDescription>
                You have {user.generationsRemaining} free generation{user.generationsRemaining !== 1 ? 's' : ''} remaining. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => window.location.href = '#profile'}
                >
                  Upgrade to premium
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Prompt Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
            <Textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" 
              rows={3} 
              placeholder="Describe what you want to create..."
            />
          </div>
          
          {/* Style Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Art Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {artStyles.map((artStyle) => (
                  <SelectItem key={artStyle.id} value={artStyle.id}>
                    {artStyle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Aspect Ratio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
            <div className="flex space-x-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`flex-1 py-2 border rounded-lg text-center transition-colors ${
                    aspectRatio === ratio.id
                      ? "bg-gray-100 text-primary border-primary"
                      : "border-gray-300 hover:bg-gray-100 focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                >
                  {ratio.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Color Scheme */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
            <div className="grid grid-cols-5 gap-2">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setColorScheme(scheme.id)}
                  className={`w-full aspect-square rounded-full ${scheme.color} cursor-pointer border-2 ${
                    colorScheme === scheme.id
                      ? "border-gray-900"
                      : "border-transparent hover:border-gray-400"
                  }`}
                  aria-label={`Select ${scheme.name} color scheme`}
                />
              ))}
            </div>
          </div>
          
          {/* Complexity */}
          <div className="mb-4">
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700">Complexity</label>
              <span className="text-sm text-gray-500">
                {complexity === 1 ? "Simple" : 
                 complexity === 2 ? "Basic" : 
                 complexity === 3 ? "Medium" : 
                 complexity === 4 ? "Detailed" : "Complex"}
              </span>
            </div>
            <Slider
              value={[complexity]}
              onValueChange={(values) => setComplexity(values[0])}
              min={1}
              max={5}
              step={1}
              className="w-full h-2"
            />
          </div>
          
          {/* Number of Generations */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Images</label>
            <div className="flex items-center">
              <button 
                onClick={decrementNumImages}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l-lg"
              >
                -
              </button>
              <div className="flex-1 h-8 border-t border-b border-gray-300 flex items-center justify-center">
                {numImages}
              </div>
              <button 
                onClick={incrementNumImages}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r-lg"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !prompt.trim() || (user && !canGenerate)}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium flex items-center justify-center hover:bg-primary/90 transition"
          >
            {generateMutation.isPending ? (
              <>Generating<span className="ml-2 loading-dots">
                <span className="bg-white"></span>
                <span className="bg-white"></span>
                <span className="bg-white"></span>
              </span></>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Generate Art
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Preview Area */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="h-full flex flex-col">
          <h3 className="text-xl font-semibold mb-4">Preview</h3>
          
          {/* Generation in Progress or Empty State */}
          {generateMutation.isPending ? (
            <div className="flex-1 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 min-h-[400px]">
              <LoadingState text="Generating your artwork..." />
            </div>
          ) : generatedImages.length === 0 ? (
            <div className="flex-1 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-indigo-500 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-medium mb-2">Your Art Will Appear Here</h4>
                <p className="text-gray-500 max-w-md mx-auto">Enter a prompt and adjust settings on the left to generate your custom artwork.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 min-h-[400px]">
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={generatedImages[0].imageUrl} 
                  alt={generatedImages[0].prompt} 
                  className="max-h-[400px] object-contain rounded-lg shadow-md"
                />
              </div>
            </div>
          )}
          
          {/* Generated Thumbnails */}
          {generatedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img 
                    src={image.imageUrl}
                    alt={`Generated ${image.settings.style} art`} 
                    className="w-full h-48 object-cover rounded-lg" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={() => handleDownload(image.imageUrl, index)}
                      className="p-2 bg-white rounded-full mr-2 hover:bg-gray-100" 
                      title="Download"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
