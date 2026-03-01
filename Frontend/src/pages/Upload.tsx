import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Image, X, Video, Loader2, Sparkles, Folder } from 'lucide-react';
import axios from 'axios';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/mockData';
import { getApiBase } from '@/lib/api';
import { cn } from '@/lib/utils';

const Upload = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const videoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Vault restricted',
        description: 'Please forge an account to upload creations.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleFileSelection(file);
    } else {
      toast({
        title: 'Invalid format',
        description: 'Please drop a valid video file.',
        variant: 'destructive',
      });
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: 'Payload too large',
        description: 'Please select a creation under 100MB.',
        variant: 'destructive',
      });
      return;
    }
    setVideoFile(file);
    // Read video duration from browser metadata
    setVideoDuration(0);
    const tempUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      setVideoDuration(Math.round(tempVideo.duration));
      URL.revokeObjectURL(tempUrl);
    };
    tempVideo.src = tempUrl;
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast({ title: 'Creation required', description: 'Please select a video file to forge.', variant: 'destructive' });
      return;
    }
    if (!title || !category) {
      toast({ title: 'Missing parameters', description: 'Please forge a title and select a category.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const apiBase = getApiBase();
      const storedUser = localStorage.getItem('streamtube_user');
      const token = storedUser ? JSON.parse(storedUser).token : null;
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const videoSigRes = await axios.get(`${apiBase}/api/videos/signature?folder=videos`, { headers: authHeaders });
      const { signature: vSig, timestamp: vTs, cloudName, apiKey: vKey } = videoSigRes.data;

      let tSig, tTs, tKey;
      if (thumbnailFile) {
        const thumbSigRes = await axios.get(`${apiBase}/api/videos/signature?folder=thumbnails`, { headers: authHeaders });
        tSig = thumbSigRes.data.signature;
        tTs = thumbSigRes.data.timestamp;
        tKey = thumbSigRes.data.apiKey;
      }

      const videoFormData = new FormData();
      videoFormData.append('file', videoFile);
      videoFormData.append('api_key', vKey);
      videoFormData.append('timestamp', vTs.toString());
      videoFormData.append('signature', vSig);
      videoFormData.append('folder', 'videos');

      const cloudinaryVideoUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
      const videoUploadRes = await axios.post(cloudinaryVideoUrl, videoFormData, {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      const videoUrl = videoUploadRes.data.secure_url;

      let thumbnailUrl = '';
      if (thumbnailFile && tSig) {
        const thumbFormData = new FormData();
        thumbFormData.append('file', thumbnailFile);
        thumbFormData.append('api_key', tKey);
        thumbFormData.append('timestamp', tTs.toString());
        thumbFormData.append('signature', tSig);
        thumbFormData.append('folder', 'thumbnails');

        const cloudinaryThumbUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const thumbUploadRes = await axios.post(cloudinaryThumbUrl, thumbFormData);
        thumbnailUrl = thumbUploadRes.data.secure_url;
      }

      await axios.post(
        `${apiBase}/api/videos/create`,
        { title, description, category, videoUrl, thumbnailUrl: thumbnailUrl || undefined, duration: videoDuration },
        { headers: authHeaders }
      );

      toast({
        title: 'Creation forged!',
        description: 'Your amber is now glowing in the vault.',
      });

      setTimeout(() => navigate('/'), 800);
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = 'The forge failed. Please try again.';
      if (error.response?.status === 401) errorMessage = 'Authentication required. Please log in.';
      else if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.message) errorMessage = error.message;

      toast({ title: 'Forge failed', description: errorMessage, variant: 'destructive' });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:py-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.15), hsl(43 85% 60% / 0.1))', border: '1px solid hsl(18 90% 48% / 0.3)', boxShadow: 'var(--shadow-glow-ember)' }}>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Forge Creation</h1>
            <p className="text-sm font-medium text-muted-foreground">Upload and ignite a new video in the vault.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Video upload zone */}
          <div
            className={cn(
              "stat-card p-2 sm:p-4 rounded-2xl border-2 border-dashed transition-all duration-300 relative overflow-hidden",
              isDragActive ? "border-primary bg-primary/5 shadow-[0_0_30px_hsl(18_90%_48%/0.2)]" : "border-border/60 hover:border-primary/50 hover:bg-card/80"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {videoFile ? (
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4 border border-border">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.2), hsl(0 0% 0% 0))', border: '1px solid hsl(18 90% 48% / 0.3)' }}>
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground line-clamp-1">{videoFile.name}</p>
                    <p className="text-xs font-semibold text-primary/80 uppercase tracking-widest mt-1">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • READY
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setVideoFile(null)} className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-5 text-center p-8 sm:p-14"
                onClick={() => videoInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary border border-border shadow-inner group-hover:scale-110 transition-transform">
                  <UploadIcon className="h-8 w-8 text-primary shadow-primary/50" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    Drag and drop your amber here
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    Or click to browse files. Ensure your creation is under 100MB to fit in the forge.
                  </p>
                </div>
                <Button
                  type="button"
                  className="mt-4 bg-secondary text-foreground hover:bg-accent border border-border"
                  onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}
                >
                  <Folder className="mr-2 h-4 w-4" /> Browse Files
                </Button>
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <div className="stat-card p-6 space-y-6">
                <h3 className="font-bold text-foreground uppercase tracking-widest text-xs border-b border-border pb-3 text-muted-foreground">Properties</h3>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Creation Title</Label>
                  <div className="ember-input relative rounded-xl transition-all duration-300">
                    <Input
                      id="title"
                      placeholder="Spark of genius..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={100}
                      className="h-12 rounded-xl border-border bg-input text-foreground font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex justify-end"><p className="text-[10px] font-bold text-muted-foreground/60">{title.length}/100</p></div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lore & Description</Label>
                  <div className="ember-input relative rounded-xl transition-all duration-300">
                    <Textarea
                      id="description"
                      placeholder="Tell the realm about this creation..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      maxLength={5000}
                      className="resize-none rounded-xl border-border bg-input text-foreground font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 pt-3"
                    />
                  </div>
                  <div className="flex justify-end"><p className="text-[10px] font-bold text-muted-foreground/60">{description.length}/5000</p></div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 border-border bg-input text-foreground font-medium rounded-xl hover:border-primary/50 transition-colors focus:ring-1 focus:ring-primary/50">
                      <SelectValue placeholder="Classify this amber" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card shadow-2xl">
                      {categories.filter(c => c !== 'All').map(cat => (
                        <SelectItem key={cat} value={cat} className="font-medium hover:bg-accent rounded-md cursor-pointer my-0.5">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="lg:col-span-2 space-y-2">
              <div className="stat-card p-6 h-full flex flex-col">
                <h3 className="font-bold text-foreground uppercase tracking-widest text-xs border-b border-border pb-3 text-muted-foreground mb-4">Thumbnail Cover</h3>

                <div className="flex-1 min-h-[160px] relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-border/80 bg-input/50 hover:bg-input hover:border-primary/40 transition-colors">
                  {thumbnailPreview ? (
                    <div className="relative h-full w-full group">
                      <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Button type="button" variant="destructive" size="icon" onClick={removeThumbnail} className="h-12 w-12 rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 text-center p-4">
                      <div className="p-3 rounded-full bg-secondary text-muted-foreground">
                        <Image className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Upload cover</p>
                        <p className="text-xs font-medium mt-1 text-muted-foreground/70">1280x720 recommended</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Upload progress & Submit */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border">
            <div className="w-full sm:flex-1">
              {isUploading && (
                <div className="w-full">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse w-24">Forging...</span>
                    <span className="text-sm font-bold text-foreground">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary border border-border">
                    <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 shadow-[0_0_10px_hsl(18_90%_48%)]" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full sm:w-auto items-center justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !videoFile}
                className="btn-primary-glow font-bold text-[hsl(20_8%_5%)] px-8 h-11 disabled:opacity-50"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[hsl(20_8%_5%)]" />
                    Forging
                  </>
                ) : (
                  'Ignite Creation'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Upload;
