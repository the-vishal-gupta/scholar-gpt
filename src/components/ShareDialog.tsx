import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Globe, 
  Lock,
  Mail
} from 'lucide-react';
import { shareConversation } from '@/services/collaborationService';
import type { Conversation } from '@/types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation?: Conversation;
}

export function ShareDialog({ open, onOpenChange, conversation }: ShareDialogProps) {
  const [shareLink, setShareLink] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [collaborators, setCollaborators] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = () => {
    if (!conversation) return;
    
    const link = shareConversation(conversation);
    setShareLink(link);
    
    toast({
      title: 'Conversation shared!',
      description: 'Share link has been generated successfully.'
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Link copied!',
      description: 'Share link has been copied to clipboard.'
    });
  };

  const sendInvites = () => {
    const emails = collaborators.split(',').map(e => e.trim()).filter(Boolean);
    
    toast({
      title: 'Invitations sent!',
      description: `Sent collaboration invites to ${emails.length} researcher${emails.length !== 1 ? 's' : ''}.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Research
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Privacy Settings */}
          <div>
            <label className="text-sm font-medium mb-2 block">Privacy</label>
            <div className="flex gap-2">
              <Button
                variant={!isPublic ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsPublic(false)}
                className="flex-1"
              >
                <Lock className="w-4 h-4 mr-2" />
                Private
              </Button>
              <Button
                variant={isPublic ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsPublic(true)}
                className="flex-1"
              >
                <Globe className="w-4 h-4 mr-2" />
                Public
              </Button>
            </div>
          </div>

          {/* Collaborators */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Users className="w-4 h-4" />
              Invite Collaborators
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email addresses (comma separated)"
                value={collaborators}
                onChange={(e) => setCollaborators(e.target.value)}
                className="flex-1"
              />
              <Button 
                size="sm" 
                onClick={sendInvites}
                disabled={!collaborators.trim()}
              >
                <Mail className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Share Link</label>
              {!shareLink && (
                <Button size="sm" onClick={handleShare}>
                  Generate Link
                </Button>
              )}
            </div>
            
            {shareLink && (
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button size="sm" onClick={copyLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">Permissions</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>View conversations</span>
                <Badge variant="secondary" className="text-xs">All</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Add comments</span>
                <Badge variant="secondary" className="text-xs">Collaborators</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Export data</span>
                <Badge variant="secondary" className="text-xs">Collaborators</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}