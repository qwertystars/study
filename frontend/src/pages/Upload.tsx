import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, FileText, ArrowLeft } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [numCards, setNumCards] = useState(10);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'text' | 'youtube'>('file');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!deckName) {
        setDeckName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deckName) {
      toast({
        title: 'Error',
        description: 'Please enter a deck name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('deck_name', deckName);
      formData.append('deck_description', deckDescription);
      formData.append('num_cards', numCards.toString());

      if (uploadMode === 'file' && file) {
        formData.append('file', file);
      } else if (uploadMode === 'text' && text) {
        formData.append('text', text);
      } else if (uploadMode === 'youtube' && youtubeUrl) {
        formData.append('youtube_url', youtubeUrl);
      } else {
        toast({
          title: 'Error',
          description: 'Please provide content to generate flashcards',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const deck = await uploadAPI.processFile(formData);

      toast({
        title: 'Success',
        description: `Created deck with ${deck.card_count} flashcards!`,
      });

      navigate(`/deck/${deck.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to process upload',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Study Materials</CardTitle>
            <CardDescription>
              Upload files, paste text, or provide a YouTube link to generate flashcards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Mode Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    uploadMode === 'file'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('text')}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    uploadMode === 'text'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('youtube')}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    uploadMode === 'youtube'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  YouTube
                </button>
              </div>

              {/* Upload Content */}
              <div className="space-y-4">
                {uploadMode === 'file' && (
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File (PDF, PPTX, TXT)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.pptx,.ppt,.txt,.md"
                      onChange={handleFileChange}
                    />
                    {file && (
                      <p className="text-sm text-gray-600">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                )}

                {uploadMode === 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="text">Paste Your Notes</Label>
                    <textarea
                      id="text"
                      className="w-full h-64 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Paste your study notes here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                )}

                {uploadMode === 'youtube' && (
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube URL</Label>
                    <Input
                      id="youtube"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Deck Details */}
              <div className="space-y-4 border-t pt-6">
                <div className="space-y-2">
                  <Label htmlFor="deckName">Deck Name *</Label>
                  <Input
                    id="deckName"
                    placeholder="e.g., Biology Chapter 1"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deckDescription">Description (optional)</Label>
                  <Input
                    id="deckDescription"
                    placeholder="Brief description of this deck"
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numCards">Number of Flashcards</Label>
                  <Input
                    id="numCards"
                    type="number"
                    min="1"
                    max="50"
                    value={numCards}
                    onChange={(e) => setNumCards(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
