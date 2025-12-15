import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/Button";
import { NoteCard } from "../components/NoteCard";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleCreate = () => {
    navigate("/note/new");
  };

  return (
    <div className="container mx-auto p-4 space-y-6 h-screen flex flex-col bg-background">
      <header className="flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quick Notes
        </h1>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="px-2 h-8 text-xs text-muted-foreground"
        >
          Sign Out
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground animate-pulse">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] p-8 border border-dashed rounded-xl bg-muted/10 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-4 text-4xl">📝</div>
            <h3 className="text-lg font-medium text-foreground">
              No notes yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first note to get started.
            </p>
            <Button onClick={handleCreate}>Create Note</Button>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleCreate}
          className="rounded-full h-14 w-14 flex items-center justify-center text-center cursor-pointer shadow-xl p-2 text-4xl font-light bg-black text-white transition-transform hover:scale-105 active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}
