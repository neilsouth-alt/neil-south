
export interface GroundingLink {
  uri: string;
  title: string;
}

export interface TeamStats {
  name: string;
  win: number;
  draw: number;
  loss: number;
  form: string[]; // e.g., ['W', 'D', 'L', 'W', 'W']
}

export interface PredictionState {
  match: string;
  prediction: string;
  isAnalyzing: boolean;
  links: GroundingLink[];
  stats?: TeamStats[];
  error?: string;
}
