import React from 'react';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type WorkType = 'image' | 'video';

export interface CreativeWork {
  id: string;
  type: WorkType;
  url: string;
  prompt: string;
  createdAt: number;
  aspectRatio?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface InspirationItem {
  title: string;
  content: string;
  urls?: { title: string; uri: string }[];
}