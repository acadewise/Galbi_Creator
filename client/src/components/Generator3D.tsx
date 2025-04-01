import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { LoadingState } from "@/components/ui/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { downloadFromUrl } from "@/lib/utils";
import { Model3DGenerationRequest, ModelType, ModelStyle, ModelFormat } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/components/auth/Auth";

// Available model types
const modelTypes: ModelType[] = [
  { id: "character", name: "Character" },
  { id: "object", name: "Object" },
  { id: "environment", name: "Environment" },
  { id: "architecture", name: "Architecture" },
  { id: "abstract", name: "Abstract" },
];

// Available model styles
const modelStyles: ModelStyle[] = [
  { id: "realistic", name: "Realistic" },
  { id: "stylized", name: "Stylized" },
  { id: "lowpoly", name: "Low Poly" },
];

// Available output formats
const modelFormats: ModelFormat[] = [
  { id: "obj", name: "OBJ Format", description: "Standard 3D model format" },
  { id: "fbx", name: "FBX Format", description: "Used in animation and games" },
  { id: "glb", name: "GLB Format", description: "Web-friendly 3D format" },
  { id: "stl", name: "STL Format", description: "For 3D printing" },
];

// Function to generate 3D model SVG
const generate3DModelSVG = (
  prompt: string,
  modelType: string,
  style: string,
  detailLevel: number,
  textureQuality: number
): string => {
  // Determine colors based on the model type
  const getModelColors = (): string[] => {
    switch (modelType) {
      case 'character':
        return ['#6E4AFF', '#47A0FF', '#65DFFF'];
      case 'environment':
        return ['#4CAF50', '#8BC34A', '#CDDC39'];
      case 'architecture':
        return ['#9C27B0', '#673AB7', '#3F51B5'];
      case 'object':
        return ['#FF5722', '#FF9800', '#FFC107'];
      case 'abstract':
        return ['#F44336', '#E91E63', '#9C27B0'];
      default:
        return ['#6E4AFF', '#47A0FF', '#65DFFF'];
    }
  };
  
  const colors = getModelColors();
  
  // Generate different SVG based on model type
  const generateModelSVG = (): string => {
    switch (modelType) {
      case 'character':
        return generateCharacterSVG(colors);
      case 'environment':
        return generateEnvironmentSVG(colors);
      case 'architecture':
        return generateArchitectureSVG(colors);
      case 'object':
        return generateObjectSVG(colors);
      case 'abstract':
        return generateAbstractSVG(colors);
      default:
        return generateCharacterSVG(colors);
    }
  };
  
  // Generate character SVG
  const generateCharacterSVG = (colors: string[]): string => {
    const detailFactor = detailLevel / 5;
    return `
      <!-- Character 3D Model -->
      <rect x="150" y="100" width="200" height="300" rx="20" fill="${colors[0]}" />
      <circle cx="250" cy="100" r="60" fill="${colors[1]}" />
      <rect x="175" y="400" width="50" height="100" fill="${colors[2]}" />
      <rect x="275" y="400" width="50" height="100" fill="${colors[2]}" />
      <circle cx="215" cy="90" r="${10 + detailFactor * 5}" fill="white" />
      <circle cx="285" cy="90" r="${10 + detailFactor * 5}" fill="white" />
      <circle cx="215" cy="90" r="${5 + detailFactor * 3}" fill="black" />
      <circle cx="285" cy="90" r="${5 + detailFactor * 3}" fill="black" />
      <path d="M 220 130 Q 250 ${150 + detailFactor * 10} 280 130" fill="none" stroke="${colors[2]}" stroke-width="${2 + detailFactor * 2}" />
      ${detailLevel > 3 ? `<path d="M 180 60 Q 200 40 220 60" fill="none" stroke="${colors[2]}" stroke-width="2" />` : ''}
      ${detailLevel > 3 ? `<path d="M 320 60 Q 300 40 280 60" fill="none" stroke="${colors[2]}" stroke-width="2" />` : ''}
    `;
  };
  
  // Generate environment SVG
  const generateEnvironmentSVG = (colors: string[]): string => {
    const detailFactor = detailLevel / 5;
    return `
      <!-- Environment 3D Model -->
      <rect x="50" y="300" width="400" height="100" fill="${colors[0]}" />
      <path d="M 100 300 L 150 200 L 200 300 Z" fill="${colors[1]}" />
      <path d="M 220 300 L 270 150 L 320 300 Z" fill="${colors[1]}" />
      <path d="M 340 300 L 390 220 L 440 300 Z" fill="${colors[1]}" />
      <circle cx="350" cy="100" r="${30 + detailFactor * 10}" fill="${colors[2]}" />
      ${detailLevel > 2 ? Array.from({ length: Math.floor(5 * detailFactor) }).map((_, i) => 
        `<circle cx="${100 + i * 80}" cy="${280 - Math.random() * 20}" r="${5 + Math.random() * 5}" fill="${colors[2]}" />`
      ).join('') : ''}
      ${detailLevel > 3 ? `<path d="M 50 320 Q 250 ${340 + detailFactor * 10} 450 320" fill="none" stroke="${colors[2]}" stroke-width="2" />` : ''}
    `;
  };
  
  // Generate architecture SVG
  const generateArchitectureSVG = (colors: string[]): string => {
    const detailFactor = detailLevel / 5;
    return `
      <!-- Architecture 3D Model -->
      <rect x="150" y="150" width="200" height="250" fill="${colors[0]}" />
      <rect x="175" y="175" width="50" height="50" fill="${colors[1]}" />
      <rect x="275" y="175" width="50" height="50" fill="${colors[1]}" />
      <rect x="175" y="250" width="50" height="50" fill="${colors[1]}" />
      <rect x="275" y="250" width="50" height="50" fill="${colors[1]}" />
      <rect x="200" y="325" width="100" height="75" fill="${colors[2]}" />
      <polygon points="150,150 250,50 350,150" fill="${colors[2]}" />
      ${detailLevel > 3 ? Array.from({ length: Math.floor(10 * detailFactor) }).map((_, i) => 
        `<rect x="${160 + (i % 5) * 40}" y="${200 + Math.floor(i / 5) * 30}" width="20" height="20" fill="${colors[i % 3]}" opacity="${0.5 + Math.random() * 0.5}" />`
      ).join('') : ''}
    `;
  };
  
  // Generate object SVG
  const generateObjectSVG = (colors: string[]): string => {
    const detailFactor = detailLevel / 5;
    return `
      <!-- Object 3D Model -->
      <rect x="175" y="175" width="150" height="150" rx="${10 * detailFactor}" fill="${colors[0]}" />
      <circle cx="250" cy="250" r="${50 * detailFactor}" fill="${colors[1]}" />
      <rect x="200" y="175" width="100" height="${20 + 10 * detailFactor}" fill="${colors[2]}" />
      ${detailLevel > 2 ? `<circle cx="220" cy="220" r="${10 + 5 * detailFactor}" fill="${colors[2]}" />` : ''}
      ${detailLevel > 2 ? `<circle cx="280" cy="220" r="${10 + 5 * detailFactor}" fill="${colors[2]}" />` : ''}
      ${detailLevel > 3 ? `<path d="M 220 270 Q 250 ${290 + detailFactor * 10} 280 270" fill="none" stroke="${colors[2]}" stroke-width="${2 + detailFactor * 2}" />` : ''}
    `;
  };
  
  // Generate abstract SVG
  const generateAbstractSVG = (colors: string[]): string => {
    const detailFactor = detailLevel / 5;
    return `
      <!-- Abstract 3D Model -->
      <polygon points="250,100 350,200 300,300 200,300 150,200" fill="${colors[0]}" />
      <circle cx="250" cy="200" r="${30 + detailFactor * 20}" fill="${colors[1]}" />
      ${detailLevel > 2 ? Array.from({ length: Math.floor(20 * detailFactor) }).map((_, i) => 
        `<circle cx="${150 + Math.random() * 200}" cy="${150 + Math.random() * 200}" r="${2 + Math.random() * 10}" fill="${colors[i % 3]}" opacity="${0.3 + Math.random() * 0.7}" />`
      ).join('') : ''}
      ${detailLevel > 3 ? `<path d="M 150 ${230 + detailFactor * 20} Q 250 ${330 - detailFactor * 30} 350 ${230 + detailFactor * 20}" fill="none" stroke="${colors[2]}" stroke-width="${1 + detailFactor * 3}" />` : ''}
    `;
  };
  
  // Apply style effects
  const applyStyle = (svgContent: string): string => {
    let styledSvg = svgContent;
    
    // Apply style-specific effects
    if (style === 'realistic') {
      // Add gradient and shadow effects for realistic style
      styledSvg = `
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="5" dy="5" stdDeviation="5" flood-opacity="0.3" />
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <g filter="url(#shadow)">
          ${svgContent}
        </g>
      `;
    } else if (style === 'lowpoly') {
      // Add polygon effect for low poly style
      styledSvg = `
        <defs>
          <pattern id="polygonPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <polygon points="0,0 15,30 30,0" fill="${colors[0]}" fill-opacity="0.1" />
            <polygon points="0,30 30,30 15,0" fill="${colors[1]}" fill-opacity="0.1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="500" height="500" fill="url(#polygonPattern)" />
        ${svgContent}
      `;
    }
    
    return styledSvg;
  };
  
  // Create the final SVG with the model and prompt text
  const modelSvg = generateModelSVG();
  const styledSvg = applyStyle(modelSvg);
  
  // Truncate the prompt if too long
  const truncatedPrompt = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
  
  // Add texture effects based on quality
  const textureFilter = textureQuality > 3 
    ? `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="${textureQuality}" /><feDisplacementMap in="SourceGraphic" scale="5" /></filter>` 
    : '';
  
  // Final SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
    <rect width="100%" height="100%" fill="#f8f8f8" />
    <defs>
      ${textureFilter}
    </defs>
    ${styledSvg}
    <text x="250" y="470" 
          text-anchor="middle" 
          font-family="Arial" 
          font-size="14" 
          fill="#333333">${truncatedPrompt}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Example 3D models (client-side)
const exampleModels = [
  { 
    id: 1, 
    imageUrl: generate3DModelSVG("Example character model", "character", "stylized", 4, 4), 
    name: "Character Example" 
  },
  { 
    id: 2, 
    imageUrl: generate3DModelSVG("Example architecture model", "architecture", "lowpoly", 3, 3), 
    name: "Building Example" 
  },
  { 
    id: 3, 
    imageUrl: generate3DModelSVG("Example abstract model", "abstract", "realistic", 5, 5), 
    name: "Abstract Example" 
  },
];

export default function Generator3D() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  
  // Form state
  const [prompt, setPrompt] = useState("");
  const [modelType, setModelType] = useState("character");
  const [detailLevel, setDetailLevel] = useState(3);
  const [textureQuality, setTextureQuality] = useState(4);
  const [style, setStyle] = useState("stylized");
  const [format, setFormat] = useState("obj");
  
  // Generated model
  const [generatedModel, setGeneratedModel] = useState<any | null>(null);
  
  // Authentication state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Check if the user is authenticated and has generations remaining
  const canGenerate = user && (user.isPremium || user.generationsRemaining > 0);
  
  // Mutation for generating 3D model
  const generateMutation = useMutation({
    mutationFn: async (data: Model3DGenerationRequest) => {
      // For demo purposes, we'll generate the 3D model on the client side
      // In a real app, you'd make an API call to your backend

      return new Promise<any>((resolve) => {
        const imageUrl = generate3DModelSVG(
          data.prompt,
          data.modelType,
          data.style,
          data.detailLevel,
          data.textureQuality
        );
        
        const model = {
          id: Date.now(),
          prompt: data.prompt,
          imageUrl,
          type: '3d',
          settings: {
            modelType: data.modelType,
            style: data.style,
            detailLevel: data.detailLevel,
            textureQuality: data.textureQuality,
            format: data.format
          },
          createdAt: new Date().toISOString(),
          userId: user?.id
        };
        
        // Simulate a network delay
        setTimeout(() => {
          resolve(model);
        }, 1500);
      });
    },
    onSuccess: (data) => {
      // Save generated model to localStorage
      const savedCreations = localStorage.getItem('creations');
      const creations = savedCreations ? JSON.parse(savedCreations) : [];
      const updatedCreations = [...creations, data];
      localStorage.setItem('creations', JSON.stringify(updatedCreations));
      
      // Update the UI
      setGeneratedModel(data);
      
      // If the user is not premium, decrement their remaining generations
      if (user && !user.isPremium) {
        updateUser({
          generationsRemaining: user.generationsRemaining - 1
        });
      }
      
      toast({
        title: "Success",
        description: "Your 3D model has been generated!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate 3D model",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a prompt to generate a 3D model",
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
      modelType,
      detailLevel,
      textureQuality,
      style,
      format,
    });
  };
  
  // Handle download
  const handleDownload = async (imageUrl: string) => {
    try {
      await downloadFromUrl(imageUrl, `galbi-3d-model.png`);
      toast({
        title: "Downloaded",
        description: "3D model image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
  };
  
  // Use example as reference
  const useExample = (example: any) => {
    setPrompt(`Create a 3D model similar to ${example.name}`);
  };
  
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
          <h3 className="text-xl font-semibold mb-4">3D Model Configuration</h3>
          
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
              placeholder="Describe the 3D model you want to create..."
            />
          </div>
          
          {/* Model Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Type</label>
            <Select value={modelType} onValueChange={setModelType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select model type" />
              </SelectTrigger>
              <SelectContent>
                {modelTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Detail Level */}
          <div className="mb-4">
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700">Detail Level</label>
              <span className="text-sm text-gray-500">
                {detailLevel === 1 ? "Very Low" : 
                 detailLevel === 2 ? "Low" : 
                 detailLevel === 3 ? "Medium" : 
                 detailLevel === 4 ? "High" : "Very High"}
              </span>
            </div>
            <Slider
              value={[detailLevel]}
              onValueChange={(values) => setDetailLevel(values[0])}
              min={1}
              max={5}
              step={1}
              className="w-full h-2"
            />
          </div>
          
          {/* Texture Quality */}
          <div className="mb-4">
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700">Texture Quality</label>
              <span className="text-sm text-gray-500">
                {textureQuality === 1 ? "Very Low" : 
                 textureQuality === 2 ? "Low" : 
                 textureQuality === 3 ? "Medium" : 
                 textureQuality === 4 ? "High" : "Very High"}
              </span>
            </div>
            <Slider
              value={[textureQuality]}
              onValueChange={(values) => setTextureQuality(values[0])}
              min={1}
              max={5}
              step={1}
              className="w-full h-2"
            />
          </div>
          
          {/* Model Style */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <div className="grid grid-cols-3 gap-2">
              {modelStyles.map((modelStyle) => (
                <button
                  key={modelStyle.id}
                  onClick={() => setStyle(modelStyle.id)}
                  className={`py-2 border rounded-lg text-center transition-colors text-sm ${
                    style === modelStyle.id
                      ? "bg-gray-100 text-primary border-primary"
                      : "border-gray-300 hover:bg-gray-100 focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                >
                  {modelStyle.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {modelFormats.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    {format.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
                Generate 3D Model
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Preview Area */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="h-full flex flex-col">
          <h3 className="text-xl font-semibold mb-4">3D Preview</h3>
          
          {/* Generation in Progress or Empty State */}
          {generateMutation.isPending ? (
            <div className="flex-1 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 min-h-[400px]">
              <LoadingState text="Generating your 3D model..." />
            </div>
          ) : generatedModel ? (
            <div className="flex-1 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 min-h-[400px]">
              <div className="w-full h-full flex items-center justify-center relative">
                <img 
                  src={generatedModel.imageUrl} 
                  alt={generatedModel.prompt} 
                  className="max-h-[400px] object-contain rounded-lg shadow-md"
                />
                <div className="absolute bottom-4 right-4">
                  <button 
                    onClick={() => handleDownload(generatedModel.imageUrl)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100" 
                    title="Download"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-medium mb-2">Your 3D Model Will Appear Here</h4>
                <p className="text-gray-500 max-w-md mx-auto">Enter a prompt and adjust settings on the left to generate your custom 3D model.</p>
              </div>
            </div>
          )}
          
          {/* Example Models */}
          {!generatedModel && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Example 3D Models</h4>
              <div className="grid grid-cols-3 gap-3">
                {exampleModels.map((model) => (
                  <div key={model.id} className="relative group">
                    <img 
                      src={model.imageUrl}
                      alt={`Example 3D model ${model.name}`} 
                      className="w-full h-24 object-cover rounded-lg" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={() => useExample(model)}
                        className="p-1.5 bg-white rounded-full text-xs" 
                        title="Use as reference"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
