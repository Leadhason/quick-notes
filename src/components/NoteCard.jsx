import React from "react";
import { useNavigate } from "react-router-dom";

export const NoteCard = ({ note }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/note/${note.id}`)}
      className="p-4 rounded-md bg-card border border-black text-card-foreground shadow-sm hover:border-primary transition-all cursor-pointer space-y-2 group"
    >
      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
        {note.title || "Untitled"}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-3">
        {note.content || "No content"}
      </p>
      <div className="text-xs text-muted-foreground/60 pt-2">
        {new Date(note.updated_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};
