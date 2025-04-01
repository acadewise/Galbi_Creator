import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate 2D art using DALL-E 3
export async function generate2DArt(prompt: string, style: string, n: number = 1): Promise<{ url: string }[]> {
  try {
    // Enhance the prompt with style context
    const enhancedPrompt = `${prompt} in ${style} style`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n,
      size: "1024x1024",
      quality: "standard",
    });

    // Return array of image URLs
    return response.data.map(image => ({ url: image.url || '' }));
  } catch (error: any) {
    console.error("Error generating 2D art:", error.message);
    throw new Error(`Failed to generate 2D art: ${error.message}`);
  }
}

// Generate a 3D model representation using DALL-E 3
// In a production environment, this would connect to a proper 3D generation API
// For this implementation, we'll generate a 2D representation of a 3D model
export async function generate3DModel(prompt: string, modelType: string): Promise<{ url: string }> {
  try {
    // Enhance the prompt to make it more 3D-oriented
    const enhancedPrompt = `A professional 3D render of ${prompt}. Create a detailed ${modelType} 3D model with realistic textures and lighting, showing different angles`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data[0].url) {
      throw new Error("Failed to generate 3D model image");
    }

    return { url: response.data[0].url };
  } catch (error: any) {
    console.error("Error generating 3D model:", error.message);
    throw new Error(`Failed to generate 3D model: ${error.message}`);
  }
}
