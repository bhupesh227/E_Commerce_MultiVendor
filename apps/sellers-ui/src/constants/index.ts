import { atom } from "jotai";


export const activeSidebarItem = atom<string>('/dashboard');


export const defaultColors = [
  '#000000',
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
];

export const aiEnhancements = [
    { label: 'Remove Background', effect: 'e-removedotbg' },
    { label: 'Drop Shadow', effect: 'e-dropshadow' },
    { label: 'Retouch', effect: 'e-retouch' },
    { label: 'Upscale', effect: 'e-upscale' },
    { label: 'Remove Blur', effect: 'e-removeblur' },
    { label: 'Remove Watermark', effect: 'e-removewatermark' },
];

export const REQUIRED_BASE_EFFECTS: Record<string, string[]> = {
  'e-dropshadow': ['e-removedotbg'],
  'e-retouch': ['e-removedotbg'],
  'e-upscale': ['e-removedotbg'],
  'e-removeblur': ['e-removedotbg'],
  'e-removewatermark': ['e-removedotbg'],
};