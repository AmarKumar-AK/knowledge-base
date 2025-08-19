/**
 * Style map for custom color styles in the editor
 * This includes both text colors and background colors
 */

// Interface for color options
export interface ColorOption {
  style: string;
  label: string;
  color: string;
}

// Define text color styles
const textColors = {
  'text-red': { color: '#e53935' },          // Red
  'text-blue': { color: '#1976d2' },         // Blue
  'text-green': { color: '#43a047' },        // Green
  'text-orange': { color: '#fb8c00' },       // Orange
  'text-purple': { color: '#8e24aa' },       // Purple
  'text-teal': { color: '#00897b' },         // Teal
  'text-pink': { color: '#d81b60' },         // Pink
  'text-gray': { color: '#757575' },         // Gray
  'text-black': { color: '#000000' },        // Black
};

// Define background color styles
const bgColors = {
  'bg-red': { backgroundColor: '#ffcdd2' },      // Light Red
  'bg-blue': { backgroundColor: '#bbdefb' },     // Light Blue
  'bg-green': { backgroundColor: '#c8e6c9' },    // Light Green
  'bg-yellow': { backgroundColor: '#fff9c4' },   // Light Yellow
  'bg-orange': { backgroundColor: '#ffe0b2' },   // Light Orange
  'bg-purple': { backgroundColor: '#e1bee7' },   // Light Purple
  'bg-teal': { backgroundColor: '#b2dfdb' },     // Light Teal
  'bg-pink': { backgroundColor: '#f8bbd0' },     // Light Pink
  'bg-gray': { backgroundColor: '#eeeeee' },     // Light Gray
};

// Combine both color maps
const colorStyleMap = {
  ...textColors,
  ...bgColors,
};

export default colorStyleMap;

// Export text and background colors separately for easy access
export const textColorOptions: ColorOption[] = Object.keys(textColors).map(key => ({
  style: key,
  label: key.replace('text-', '').charAt(0).toUpperCase() + key.replace('text-', '').slice(1),
  color: textColors[key as keyof typeof textColors].color
}));

export const bgColorOptions: ColorOption[] = Object.keys(bgColors).map(key => ({
  style: key,
  label: key.replace('bg-', '').charAt(0).toUpperCase() + key.replace('bg-', '').slice(1),
  color: bgColors[key as keyof typeof bgColors].backgroundColor
}));
