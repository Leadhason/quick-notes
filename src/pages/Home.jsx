import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/Button";
import { NoteCard } from "../components/NoteCard";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
          >
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg py-1 z-20">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className="w-full px-4 py-2 text-sm text-left text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full px-4 py-2 text-sm text-left text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
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

      {notes.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleCreate}
            className="rounded-full h-12 w-12 flex items-center justify-center cursor-pointer shadow-xl bg-black text-white transition-transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
