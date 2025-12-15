import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id && user) {
      supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setTitle(data.title);
            setContent(data.content);
          }
          if (error) console.error(error);
          setLoading(false);
        });
    }
  }, [id, user]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return; // Don't save empty
    setSaving(true);
    const noteData = {
      user_id: user.id,
      title,
      content,
      updated_at: new Date().toISOString(),
    };

    try {
      if (id) {
        await supabase.from("notes").update(noteData).eq("id", id);
      } else {
        await supabase.from("notes").insert([noteData]);
      }
      navigate("/");
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading note...</div>;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <Button variant="ghost" onClick={() => navigate("/")} className="-ml-2">
          &larr; Back
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-4">
        <input
          className="w-full text-4xl font-bold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/50"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          className="w-full h-full min-h-[50vh] resize-none bg-transparent border-none focus:outline-none text-lg leading-relaxed placeholder:text-muted-foreground/50"
          placeholder="Start writing..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
}
