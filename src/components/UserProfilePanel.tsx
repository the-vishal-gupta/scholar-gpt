import { useState, useEffect } from 'react';
import { User, Settings, BookOpen, Search, Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { userProfileService, UserProfile, SavedSearch, ReadingList } from '@/services/userProfileService';

interface UserProfilePanelProps {
  onClose?: () => void;
}

export function UserProfilePanel({ onClose }: UserProfilePanelProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'saved' | 'lists'>('profile');

  useEffect(() => {
    const currentUser = userProfileService.getCurrentUser();
    setUser(currentUser);
    if (!currentUser) {
      setIsEditing(true);
    }
  }, []);

  const handleCreateProfile = () => {
    if (!user?.name) return;
    
    const newUser = userProfileService.createProfile(user.name, user.email);
    setUser(newUser);
    setIsEditing(false);
  };

  const handleUpdateProfile = () => {
    if (!user) return;
    
    userProfileService.updateProfile({
      name: user.name,
      email: user.email,
      researchInterests: user.researchInterests,
      favoriteVenues: user.favoriteVenues
    });
    setIsEditing(false);
  };

  const handleAddInterest = () => {
    if (!newInterest.trim() || !user) return;
    
    userProfileService.addResearchInterest(newInterest.trim());
    setUser({ ...user, researchInterests: [...user.researchInterests, newInterest.trim()] });
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    if (!user) return;
    
    userProfileService.removeResearchInterest(interest);
    setUser({ ...user, researchInterests: user.researchInterests.filter(i => i !== interest) });
  };

  const handlePreferenceChange = (key: string, value: any) => {
    if (!user) return;
    
    const newPreferences = { ...user.preferences, [key]: value };
    userProfileService.updatePreferences({ [key]: value });
    setUser({ ...user, preferences: newPreferences });
  };

  if (!user && !isEditing) {
    return (
      <div className="p-6 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Create Your Profile</h3>
        <p className="text-gray-600 mb-4">Personalize your research experience</p>
        <Button onClick={() => setIsEditing(true)}>Get Started</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">User Profile</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'preferences', label: 'Preferences', icon: Settings },
          { id: 'saved', label: 'Saved Searches', icon: Search },
          { id: 'lists', label: 'Reading Lists', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={user?.name || ''}
                onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                disabled={!isEditing}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email (optional)</label>
              <Input
                value={user?.email || ''}
                onChange={(e) => setUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                disabled={!isEditing}
                placeholder="your.email@example.com"
                type="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Research Interests</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {user?.researchInterests.map(interest => (
                <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  {isEditing && (
                    <button onClick={() => handleRemoveInterest(interest)}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add research interest"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                />
                <Button onClick={handleAddInterest} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={user?.id ? handleUpdateProfile : handleCreateProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  {user?.id ? 'Save Changes' : 'Create Profile'}
                </Button>
                {user?.id && (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'preferences' && user && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Default Search Sort</label>
              <Select
                value={user.preferences.defaultSearchSort}
                onValueChange={(value) => handlePreferenceChange('defaultSearchSort', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="citations">Citations</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="impact">Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Results Per Page</label>
              <Select
                value={user.preferences.resultsPerPage.toString()}
                onValueChange={(value) => handlePreferenceChange('resultsPerPage', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preferred Citation Format</label>
              <Select
                value={user.preferences.preferredCitationFormat}
                onValueChange={(value) => handlePreferenceChange('preferredCitationFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bibtex">BibTeX</SelectItem>
                  <SelectItem value="apa">APA</SelectItem>
                  <SelectItem value="mla">MLA</SelectItem>
                  <SelectItem value="ris">RIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Abstract by Default</p>
                <p className="text-sm text-gray-600">Automatically expand paper abstracts</p>
              </div>
              <Switch
                checked={user.preferences.showAbstractByDefault}
                onCheckedChange={(checked) => handlePreferenceChange('showAbstractByDefault', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-save Searches</p>
                <p className="text-sm text-gray-600">Automatically save your search queries</p>
              </div>
              <Switch
                checked={user.preferences.autoSaveSearches}
                onCheckedChange={(checked) => handlePreferenceChange('autoSaveSearches', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-gray-600">Get notified about new papers in your interests</p>
              </div>
              <Switch
                checked={user.preferences.enableNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('enableNotifications', checked)}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <SavedSearchesTab />
      )}

      {activeTab === 'lists' && (
        <ReadingListsTab />
      )}
    </div>
  );
}

function SavedSearchesTab() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    setSavedSearches(userProfileService.getSavedSearches());
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Searches</h3>
        <Badge variant="secondary">{savedSearches.length} saved</Badge>
      </div>

      {savedSearches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No saved searches yet</p>
          <p className="text-sm">Your saved searches will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSearches.map(search => (
            <div key={search.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{search.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{search.query}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{search.resultCount} results</span>
                    <span>Created {search.createdAt.toLocaleDateString()}</span>
                    <span>Last used {search.lastUsed.toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Run Search
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReadingListsTab() {
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    setReadingLists(userProfileService.getReadingLists());
  }, []);

  const handleCreateList = () => {
    if (!newListName.trim()) return;

    const newList = userProfileService.createReadingList(newListName, newListDescription);
    setReadingLists([...readingLists, newList]);
    setNewListName('');
    setNewListDescription('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reading Lists</h3>
        <Button onClick={() => setShowCreateForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New List
        </Button>
      </div>

      {showCreateForm && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-3">
            <Input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name"
            />
            <Textarea
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateList} size="sm">Create</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)} size="sm">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {readingLists.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No reading lists yet</p>
          <p className="text-sm">Create lists to organize your papers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readingLists.map(list => (
            <div key={list.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{list.name}</h4>
                <Badge variant="secondary">{list.papers.length}</Badge>
              </div>
              {list.description && (
                <p className="text-sm text-gray-600 mb-3">{list.description}</p>
              )}
              <div className="text-xs text-gray-500">
                Created {list.createdAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}