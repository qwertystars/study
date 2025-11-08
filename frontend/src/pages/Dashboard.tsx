import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { decksAPI, practiceAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Deck, Flashcard } from '@/types';
import { BookOpen, Upload, LogOut, Plus } from 'lucide-react';

export default function Dashboard() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [todaysCards, setTodaysCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [decksData, cardsData] = await Promise.all([
        decksAPI.getAll(),
        practiceAPI.getTodaysReviews(),
      ]);
      setDecks(decksData);
      setTodaysCards(cardsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Flashcard App</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => navigate('/upload')}
            className="h-20 text-lg"
            variant="outline"
          >
            <Upload className="h-6 w-6 mr-2" />
            Upload & Generate Flashcards
          </Button>
          {todaysCards.length > 0 && (
            <Button
              onClick={() => navigate('/practice')}
              className="h-20 text-lg"
            >
              <BookOpen className="h-6 w-6 mr-2" />
              Review Today ({todaysCards.length} cards)
            </Button>
          )}
        </div>

        {/* Today's Review Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Reviews</CardTitle>
            <CardDescription>
              {todaysCards.length === 0
                ? 'No cards due for review today'
                : `${todaysCards.length} card${todaysCards.length > 1 ? 's' : ''} waiting for review`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Decks */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Decks</h2>
        </div>

        {decks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No decks yet</p>
              <Button onClick={() => navigate('/upload')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/deck/${deck.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{deck.name}</CardTitle>
                  {deck.description && (
                    <CardDescription>{deck.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{deck.card_count || 0} cards</span>
                    {deck.due_count ? (
                      <span className="text-primary font-medium">
                        {deck.due_count} due
                      </span>
                    ) : (
                      <span>All reviewed</span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/practice/${deck.id}`);
                      }}
                    >
                      Practice
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/deck/${deck.id}`);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
