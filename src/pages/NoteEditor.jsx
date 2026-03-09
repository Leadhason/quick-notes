import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const editorRef = useRef(null);
  const [noteId, setNoteId] = useState(id || null);
  const autoSaveTimeoutRef = useRef(null);

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
            if (editorRef.current) {
              editorRef.current.innerHTML = data.content || '';
            }
          }
          if (error) console.error(error);
          setLoading(false);
        });
    }
  }, [id, user]);

  // Auto-save function that doesn't redirect
  const autoSave = useCallback(async (currentTitle, currentContent, currentNoteId) => {
    if (!currentTitle.trim() && !currentContent.trim()) return;
    if (!user) return;
    
    setSaving(true);
    const noteData = {
      user_id: user.id,
      title: currentTitle,
      content: currentContent,
      updated_at: new Date().toISOString(),
    };

    try {
      if (currentNoteId) {
        await supabase.from("notes").update(noteData).eq("id", currentNoteId);
      } else {
        const { data, error } = await supabase.from("notes").insert([noteData]).select().single();
        if (data && !error) {
          setNoteId(data.id);
          // Update URL without navigating away
          window.history.replaceState(null, '', `/note/${data.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Debounced auto-save effect
  useEffect(() => {
    if (loading) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(title, content, noteId);
    }, 1000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, noteId, loading, autoSave]);

  const handleDelete = async () => {
    if (!noteId) {
      navigate("/");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    setDeleting(true);
    try {
      await supabase.from("notes").delete().eq("id", noteId);
      navigate("/");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    } finally {
      setDeleting(false);
    }
  };

  const execCommand = (command) => {
    document.execCommand(command, false, null);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
    });
  };

  const formatButtons = [
    { command: "bold", icon: "B", title: "Bold", className: "font-bold" },
    { command: "italic", icon: "I", title: "Italic", className: "italic" },
    { command: "underline", icon: "U", title: "Underline", className: "underline" },
    { command: "strikeThrough", icon: "S", title: "Strikethrough", className: "line-through" },
    { type: "divider" },
    { command: "insertUnorderedList", icon: "list-ul", title: "Bullet List", isSvg: true },
    { command: "insertOrderedList", icon: "list-ol", title: "Numbered List", isSvg: true },
    { type: "divider" },
    { command: "justifyLeft", icon: "align-left", title: "Align Left", isSvg: true },
    { command: "justifyCenter", icon: "align-center", title: "Align Center", isSvg: true },
    { command: "justifyRight", icon: "align-right", title: "Align Right", isSvg: true },
  ];

  const renderIcon = (btn) => {
    if (!btn.isSvg) {
      return <span className={btn.className}>{btn.icon}</span>;
    }
    
    switch (btn.icon) {
      case "list-ul":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="4" cy="6" r="2" />
            <circle cx="4" cy="12" r="2" />
            <circle cx="4" cy="18" r="2" />
            <rect x="9" y="5" width="12" height="2" rx="1" />
            <rect x="9" y="11" width="12" height="2" rx="1" />
            <rect x="9" y="17" width="12" height="2" rx="1" />
          </svg>
        );
      case "list-ol":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <text x="2" y="8" fontSize="7" fontWeight="bold">1</text>
            <text x="2" y="14" fontSize="7" fontWeight="bold">2</text>
            <text x="2" y="20" fontSize="7" fontWeight="bold">3</text>
            <rect x="9" y="5" width="12" height="2" rx="1" />
            <rect x="9" y="11" width="12" height="2" rx="1" />
            <rect x="9" y="17" width="12" height="2" rx="1" />
          </svg>
        );
      case "align-left":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h15" />
          </svg>
        );
      case "align-center":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M4 18h16" />
          </svg>
        );
      case "align-right":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 12h12M6 18h15" />
          </svg>
        );
      default:
        return btn.icon;
    }
  };

  const handleEditorBlur = (e) => {
    if (!e.relatedTarget?.closest('.formatting-toolbar')) {
      setTimeout(() => setShowToolbar(false), 150);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading note...</div>;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <Button variant="ghost" onClick={() => navigate("/")} className="-ml-2 p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
          {noteId && (
            <button 
              onClick={handleDelete} 
              disabled={deleting} 
              className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-4 no-scrollbar">
        <input
          className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/50"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div
          ref={editorRef}
          contentEditable
          className="w-full min-h-[50vh] bg-transparent border-none focus:outline-none text-lg leading-relaxed"
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          onFocus={() => setShowToolbar(true)}
          onBlur={handleEditorBlur}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          data-placeholder="Start writing..."
          style={{ minHeight: '50vh' }}
          suppressContentEditableWarning={true}
        />
      </div>

      {showToolbar && (
        <div className="formatting-toolbar fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-full shadow-2xl px-6 py-2 flex items-center gap-3 z-30">
          {formatButtons.map((btn, index) => {
            const isActive = activeFormats[btn.command];
            return btn.type === "divider" ? (
              <div key={index} className="w-px h-6 bg-black/10 dark:bg-white/20 mx-2" />
            ) : (
              <button
                key={btn.command}
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCommand(btn.command);
                }}
                title={btn.title}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer text-sm active:scale-95 ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-black/10 dark:hover:bg-white/20 text-foreground"
                }`}
              >
                {renderIcon(btn)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
