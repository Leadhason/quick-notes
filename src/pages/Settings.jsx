import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleUpdateEmail = async () => {
    if (!email || email === user?.email) return;
    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setMessage({ type: "success", text: "Email update initiated. Check your inbox to confirm." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: "success", text: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <Button variant="ghost" onClick={() => navigate("/")} className="-ml-2">
          &larr; Back
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-8">
        {/* Status Message */}
        {message.text && (
          <div className={`p-3 text-sm rounded-md font-medium ${
            message.type === "error" 
              ? "text-destructive bg-destructive/10" 
              : "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
          }`}>
            {message.text}
          </div>
        )}

        {/* Account Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
          
          <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              onClick={handleUpdateEmail} 
              disabled={saving || email === user?.email}
              className="w-full"
            >
              {saving ? "Updating..." : "Update Email"}
            </Button>
          </div>

          <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
            <Input
              id="newPassword"
              type="password"
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button 
              onClick={handleUpdatePassword} 
              disabled={saving || !newPassword}
              className="w-full"
            >
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
          
          <div className="p-4 bg-card rounded-lg border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground">Choose your preferred appearance</p>
              </div>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    theme === "light"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    theme === "dark"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="space-y-4 pb-8">
          <h2 className="text-lg font-semibold text-foreground">About</h2>
          
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="text-foreground font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
