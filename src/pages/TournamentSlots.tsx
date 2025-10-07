import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/core/LoadingSpinner';
import { SlotCard } from '@/components/tournaments/SlotCard';
import { JoinForm } from '@/components/tournaments/JoinForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Terminal, Users, Grid, List, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useParams } from 'react-router-dom';

const TournamentSlots = () => {
  const { user, userRole } = useAuth();
  const { id: match_id } = useParams<{ id: string }>();
  const [slots, setSlots] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'slot' | 'name'>('slot');

  
  useEffect(() => {
    const fetchTournamentAndSlots = async () => {
      if (!match_id) return;
      try {
        // Fetch tournament details
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select('total_slots, name, entry_fee, status')
          .eq('id', match_id)
          .single();

        if (tournamentError) throw tournamentError;
        setTournament(tournamentData);

        // Fetch registered players (actual tournament participants)
        const { data: slotsData, error: slotsError } = await supabase
          .from('tournament_registrations')
          .select('*')
          .eq('tournament_id', match_id)
          .order('slot_number', { ascending: true });

        if (slotsError) throw slotsError;
        setSlots(slotsData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentAndSlots();

    const channel = supabase
      .channel(`tournament_registrations:${match_id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_registrations', filter: `tournament_id=eq.${match_id}` }, (payload) => {
                    fetchTournamentAndSlots(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match_id]);

  const totalSlots = tournament?.total_slots || 0;
  const existingSlots = slots.map(s => s.slot_number);
  const playerSlot = slots.find(s => s.user_id === user?.id);
  const isPlayerInTournament = !!playerSlot;

  const isAdmin = userRole === 'admin' || userRole === 'boss';

  // Filter and sort slots
  const filteredAndSortedSlots = slots
    .filter(slot => {
      if (!searchQuery) return true;
      return slot.in_game_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             slot.friend_in_game_name?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'slot') {
        return a.slot_number - b.slot_number;
      } else {
        return a.in_game_name.localeCompare(b.in_game_name);
      }
    });

  // Parse team members helper
  const getTeamMembers = (slot: any) => {
    if (!slot.friend_in_game_name) return "Solo player";
    
    try {
      const parsed = JSON.parse(slot.friend_in_game_name);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).join(", ") || "No team members listed";
      }
    } catch (e) {
      return slot.friend_in_game_name;
    }
    
    return slot.friend_in_game_name;
  };

  return (
    <MainLayout>
      <PageHeader 
        title={tournament?.name || "Tournament Slots"} 
        subtitle={`${slots.length}/${totalSlots} slots filled`}
        showBack={true}
      />
      <div className="container mx-auto p-4">
        
        {/* Mobile-optimized header with stats */}
        <Card className='p-3 sm:p-4 mb-4 bg-card/60 backdrop-blur-sm'>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-orbitron font-bold">Joined Teams</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{filteredAndSortedSlots.length} players shown</span>
                {searchQuery && <span>• Filtered</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-primary">{slots.length} / {totalSlots}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Slots Filled</div>
            </div>
          </div>
        </Card>

        {/* Mobile-optimized controls */}
        <Card className="p-3 sm:p-4 mb-4 bg-card/60 backdrop-blur-sm">
          <div className="flex flex-col gap-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players or teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Controls row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={sortBy} onValueChange={(value: 'slot' | 'name') => setSortBy(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slot">Sort by Slot Number</SelectItem>
                  <SelectItem value="name">Sort by Player Name</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View mode toggle - mobile only */}
              <div className="flex sm:hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {loading && 
          <div className='flex justify-center my-8'>
            <LoadingSpinner />
          </div>
        }
        
        {error && (
          <Alert variant="destructive" className='mb-6'>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Mobile-optimized player display */}
        {!loading && filteredAndSortedSlots.length > 0 && (
          <>
            {/* Grid view (default) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
                {filteredAndSortedSlots.map(slot => (
                  <SlotCard 
                    key={slot.id} 
                    slot={slot} 
                    isPlayerSlot={slot.user_id === user?.id} 
                  />
                ))}
              </div>
            )}

            {/* List view (mobile) */}
            {viewMode === 'list' && (
              <div className="space-y-2 mb-8">
                {filteredAndSortedSlots.map(slot => (
                  <Card 
                    key={slot.id} 
                    className={`p-3 bg-card/60 backdrop-blur-sm transition-all duration-300 ${
                      slot.user_id === user?.id 
                        ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/50" 
                        : "border-border/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1 text-xs font-semibold bg-secondary/20 text-secondary px-2 py-1 rounded">
                            #{slot.slot_number}
                          </div>
                          <span className="font-bold text-sm font-orbitron truncate">{slot.in_game_name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {getTeamMembers(slot)}
                        </div>
                      </div>
                      {slot.user_id === user?.id && (
                        <div className="text-xs text-primary font-semibold">YOU</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Desktop admin table (hidden on mobile) */}
        {isAdmin && (
          <Card className="p-4 mb-8 overflow-x-auto hidden lg:block">
            <h3 className="text-lg font-semibold mb-4">Admin View</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 px-3">Slot Number</th>
                  <th className="py-2 px-3">Player IGN</th>
                  <th className="py-2 px-3">Team Members</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSlots.map(slot => (
                  <tr key={`admin-${slot.id}`} className={`border-t border-border/20 ${slot.user_id === user?.id ? 'bg-primary/10 ring-1 ring-primary/40' : ''}`}>
                    <td className="py-2 px-3 font-semibold">{slot.slot_number}</td>
                    <td className="py-2 px-3">{slot.in_game_name}</td>
                    <td className="py-2 px-3">{getTeamMembers(slot)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {slots.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No players have joined this tournament yet.</p>
            </div>
          </Card>
        )}

      </div>
    </MainLayout>
  );
};

export default TournamentSlots;