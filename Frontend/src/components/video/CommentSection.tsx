import React, { useState } from 'react';
import { ThumbsUp, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Comment, formatDate } from '@/lib/mockData';

interface CommentSectionProps {
  comments: Comment[];
  videoId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments: initialComments, videoId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const comment: Comment = {
      id: 'c-' + Date.now(),
      videoId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      content: newComment.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="mt-8">
      <h3 className="mb-6 text-lg font-bold text-foreground">
        {comments.length} Comments
      </h3>

      {/* Add comment */}
      {isAuthenticated ? (
        <div className="mb-8 flex gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 shrink-0 avatar-ring">
            <AvatarFallback
              className="text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(43 85% 60%) 100%)',
                color: 'hsl(20 8% 5%)',
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-sm"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setNewComment('')}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="font-semibold text-[hsl(20_8%_5%)] bg-primary hover:bg-primary/90 btn-primary-glow"
                style={{
                  background: 'linear-gradient(135deg, hsl(18 90% 48%), hsl(38 85% 50%))'
                }}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-xl border border-border bg-card/50 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-3 text-sm">
            Join the conversation! Sign in to leave a comment.
          </p>
          <Button asChild size="sm" className="rounded-full px-6 btn-primary-glow" style={{ background: 'linear-gradient(135deg, hsl(18 90% 48%), hsl(38 85% 50%))', color: 'hsl(20 8% 5%)' }}>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 sm:gap-4 animate-fade-in group/comment">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback
                className="text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, hsl(43 40% 25%), hsl(20 6% 16%))',
                  color: 'hsl(35 30% 92%)',
                  border: '1px solid hsl(20 6% 25%)'
                }}
              >
                {comment.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-foreground">
                  {comment.username}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
              <div className="mt-2 flex items-center gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 sm:px-3 gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-full"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-xs font-semibold">{comment.likes > 0 ? comment.likes : ''}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full"
                >
                  Reply
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover/comment:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
