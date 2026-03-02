import type { SharedCollection, CollaborationActivity } from '@/types';

export function getSharedCollections(): SharedCollection[] {
  return [];
}

export function getRecentActivity(): CollaborationActivity[] {
  return [];
}

export function createCollection(name: string, description: string, isPublic: boolean): SharedCollection {
  return {
    id: Date.now().toString(),
    name,
    description,
    papers: [],
    createdBy: 'Current User',
    collaborators: [],
    isPublic,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function shareConversation(conversation: any): string {
  return `shared-${Date.now()}`;
}