export interface ServiceItem {
  id: string;
  titleHe: string;
  descriptionHe: string;
  icon: ServiceIconId;
}

export type ServiceIconId = 'song' | 'video-existing-song' | 'video-new-song' | 'photos' | 'ai-visual';
