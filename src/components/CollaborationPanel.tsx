import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Plus, 
  Globe, 
  Lock, 
  Clock, 
  FileText,
  User,
  Share2
} from 'lucide-react';
import { getSharedCollections, getRecentActivity, createCollection } from '@/services/collaborationService';
import type { SharedCollection, CollaborationActivity } from '@/types';

export function CollaborationPanel() {
  const [collections] = useState<SharedCollection[]>(getSharedCollections());
  const [activity] = useState<CollaborationActivity[]>(getRecentActivity());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', isPublic: false });

  const handleCreateCollection = () => {
    if (newCollection.name.trim()) {
      createCollection(newCollection.name, newCollection.description, newCollection.isPublic);
      setNewCollection({ name: '', description: '', isPublic: false });
      setShowCreateForm(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Shared Collections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Shared Collections
          </h3>
          <Button 
            size="sm" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        {/* Create Collection Form */}
        {showCreateForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <Input
              placeholder="Collection name"
              value={newCollection.name}
              onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newCollection.description}
              onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newCollection.isPublic}
                  onChange={(e) => setNewCollection({ ...newCollection, isPublic: e.target.checked })}
                />
                Make public
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateCollection} className="flex-1">
                Create Collection
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Collections List */}
        <div className="space-y-3">
          {collections.map(collection => (
            <div key={collection.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{collection.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {collection.isPublic ? (
                    <Globe className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                  <Button size="sm" variant="ghost">
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>by {collection.createdBy}</span>
                <div className="flex items-center gap-3">
                  <span>{collection.papers.length} papers</span>
                  <span>{collection.collaborators.length} collaborators</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {collection.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Recent Activity
        </h3>
        
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {activity.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {item.type === 'paper_added' && <FileText className="w-4 h-4 text-blue-600" />}
                  {item.type === 'author_added' && <User className="w-4 h-4 text-blue-600" />}
                  {item.type === 'collection_shared' && <Share2 className="w-4 h-4 text-blue-600" />}
                  {item.type === 'comment_added' && <Users className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{item.user}</span> {item.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}