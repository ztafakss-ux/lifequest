import api from '../lib/api';

export interface NowPlaying {
  playing: boolean;
  track?: string;
  artist?: string;
  albumArt?: string;
  progressMs?: number;
  durationMs?: number;
}

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
  images: Array<{ url: string }>;
}

export async function getNowPlaying(): Promise<NowPlaying> {
  const { data } = await api.get<NowPlaying>('/integrations/spotify/now-playing');
  return data;
}

export async function play(contextUri?: string): Promise<void> {
  await api.post('/integrations/spotify/play', { contextUri });
}

export async function pause(): Promise<void> {
  await api.post('/integrations/spotify/pause');
}

export async function next(): Promise<void> {
  await api.post('/integrations/spotify/next');
}

export async function previous(): Promise<void> {
  await api.post('/integrations/spotify/previous');
}

export async function seek(positionMs: number): Promise<void> {
  await api.post('/integrations/spotify/seek', { positionMs });
}

export async function setVolume(volume: number): Promise<void> {
  await api.post('/integrations/spotify/volume', { volume });
}

export async function likeCurrentTrack(): Promise<void> {
  await api.put('/integrations/spotify/like');
}

export async function getPlaylists(): Promise<SpotifyPlaylist[]> {
  const { data } = await api.get<{ playlists: SpotifyPlaylist[] }>('/integrations/spotify/playlists');
  return data.playlists;
}

export async function playPlaylist(playlistUri: string): Promise<void> {
  await api.post('/integrations/spotify/play-playlist', { playlistUri });
}

export async function getDevices(): Promise<SpotifyDevice[]> {
  const { data } = await api.get<{ devices: SpotifyDevice[] }>('/integrations/spotify/devices');
  return data.devices;
}
