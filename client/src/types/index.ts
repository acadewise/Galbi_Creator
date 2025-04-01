export interface Creation {
  id: number;
  type: "2d" | "3d";
  prompt: string;
  imageUrl: string;
  settings: Record<string, any>;
  createdAt: Date;
}

export interface Art2DGenerationRequest {
  prompt: string;
  style: string;
  aspectRatio: string;
  colorScheme: string;
  complexity: number;
  numImages: number;
}

export interface Model3DGenerationRequest {
  prompt: string;
  modelType: string;
  detailLevel: number;
  textureQuality: number;
  style: string;
  format: string;
}

export type ArtStyle = {
  id: string;
  name: string;
}

export type ModelType = {
  id: string;
  name: string;
}

export type AspectRatio = {
  id: string;
  name: string;
  value: string;
}

export type ColorScheme = {
  id: string;
  name: string;
  color: string;
}

export type ModelStyle = {
  id: string;
  name: string;
}

export type ModelFormat = {
  id: string;
  name: string;
  description: string;
}

export type FAQ = {
  question: string;
  answer: string;
}
