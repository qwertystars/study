import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { decksAPI, flashcardsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Deck, Flashcard } from '@/types';
import { ArrowLeft, Plus, Trash2, Edit2, Save } from 'lucide-react';

export default function DeckEditor() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  const loadDeck = async () => {
    if (!deckId) return;

    try {
      const [deckData, cardsData] = await Promise.all([
        decksAPI.getById(parseInt(deckId)),
        flashcardsAPI.getByDeck(parseInt(deckId)),
      ]);
      setDeck(deckData);
      setFlashcards(cardsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load deck',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId || !newQuestion || !newAnswer) return;

    try {
      const newCard = await flashcardsAPI.create({
        question: newQuestion,
        answer: newAnswer,
        deck_id: parseInt(deckId),
      });

      setFlashcards([...flashcards, newCard]);
      setNewQuestion('');
      setNewAnswer('');
      toast({
        title: 'Success',
        description: 'Flashcard added',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add flashcard',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
  };

  const handleSaveEdit = async (cardId: number) => {
    try {
      const updatedCard = await flashcardsAPI.update(cardId, {
        question: editQuestion,
        answer: editAnswer,
      });

      setFlashcards(
        flashcards.map((card) => (card.id === cardId ? updatedCard : card))
      );
      setEditingId(null);
      toast({
        title: 'Success',
        description: 'Flashcard updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update flashcard',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (cardId: number) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;

    try {
      await flashcardsAPI.delete(cardId);
      setFlashcards(flashcards.filter((card) => card.id !== cardId));
      toast({
        title: 'Success',
        description: 'Flashcard deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete flashcard',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDeck = async () => {
    if (!deckId) return;
    if (!confirm('Are you sure you want to delete this entire deck?')) return;

    try {
      await decksAPI.delete(parseInt(deckId));
      toast({
        title: 'Success',
        description: 'Deck deleted',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete deck',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Deck not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteDeck}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Deck
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{deck.name}</h1>
          {deck.description && (
            <p className="text-gray-600 mt-2">{deck.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Add New Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Flashcard</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <textarea
                  id="question"
                  className="w-full h-24 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <textarea
                  id="answer"
                  className="w-full h-24 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter answer..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Flashcard
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Flashcards List */}
        <div className="space-y-4">
          {flashcards.map((card) => (
            <Card key={card.id}>
              <CardContent className="p-6">
                {editingId === card.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Question</Label>
                      <textarea
                        className="w-full h-20 px-3 py-2 border border-input rounded-md mt-1"
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Answer</Label>
                      <textarea
                        className="w-full h-20 px-3 py-2 border border-input rounded-md mt-1"
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(card.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Question</p>
                      <p className="text-lg font-medium">{card.question}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Answer</p>
                      <p className="text-lg">{card.answer}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(card)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(card.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
