import { IPerformer } from './performer';

export interface IVideo {
  _id: string;
  title: string;
  performerId: string;
  isSaleVideo?: boolean;
  price?: number;
  status?: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  participantIds?: string[];
  participants?: any[];
  video?: { url?: string, thumbnails?: string[], duration?: number };
  stats?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  performer?: { username: string, name?: string, avatarPath?: string, _id: string, avatar?: string };
  userReaction?: {
    liked?: boolean;
    favourited?: boolean;
    watchedLater?: boolean;
  }
}

export interface IVideoResponse {
  _id: string;
  title: string;
  performerId: string;
  isSaleVideo?: boolean;
  price?: number;
  status?: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  participantIds?: string[];
  participants?: any[];
  video?: { url?: string, thumbnails?: string[], duration?: number };
  stats?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  performer?: IPerformer;
  userReaction?: {
    liked?: boolean;
    favourited?: boolean;
    watchedLater?: boolean;
  },
  isBought?: boolean;
  isSubscribed?: boolean;
  thumbnails?: any;
}

export interface IVideoCreate {
  title: string;
  performerId?: string;
  isSaleVideo?: boolean;
  isSchedule?: boolean;
  scheduledAt?: any;
  tags?: string[];
  price?: number;
  participantIds?: string[];
  status: string;
  description?: string;
}

export interface IVideoUpdate {
  _id: string;
  performerId?: string;
  title?: string;
  isSaleVideo?: boolean;
  price?: number;
  tags?: string[];
  participantIds?: string[];
  isSchedule?: boolean;
  scheduledAt?: any;
  status?: string;
  description?: string;
  thumbnail?: string;
  video?: { url?: string };
}
