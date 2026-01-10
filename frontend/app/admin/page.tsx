"use client";

import { useState, useEffect } from "react";
import { getBackendUrl } from "../utils/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";



export default function Admin() {
  const [activeTab, setActiveTab] = useState("stations");
  const [users, setUsers] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
    event: "Loading...",
    current_event: "Loading...",
    target_epoch: 0,
    cutter: 0,
    hotglue: 0,
    youtube_id: "",
    default_language: "en",
    station_duration: 10,
    app_title: "Hack26",
    app_subtitle: "MIT • CIC • UPC"
  });

  const [cut, setCut] = useState<any[]>([]);
  const [hot, setHot] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Alerts State
  const [alerts, setAlerts] = useState<any[]>([]);
  const [newAlertMsg, setNewAlertMsg] = useState("");
  const [newAlertType, setNewAlertType] = useState("onetime");
  const [newAlertSeverity, setNewAlertSeverity] = useState("info");

  // Links State
  const [links, setLinks] = useState<any[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/admin/users`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (e) { console.error(e); }
  };

  // Fetch Station Status & Config
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/queue`);
      const data = await res.json();
      setCut(data.cutter_stations || []);
      setHot(data.hotglue_stations || []);

      // Only update config state if we haven't modified it locally yet (optional, but good for init)
      // For now, let's separate server status 'cut/hot' from editable 'config' state
      // We might want to fetch the current config values too if we had a getter, 
      // but we can infer station counts from data.arrays
    } catch (e) { console.error(e); }
  };

  const fetchCountdown = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/countdown`);
      const data = await res.json();
      setConfig((prev: any) => ({
        ...prev,
        event: data.next_event || data.event, // handle legacy or new
        current_event: data.current_event || "Networking",
        target_epoch: data.target_epoch,
        youtube_id: data.youtube_id || prev.youtube_id,
        station_duration: data.station_duration || 10,
        app_title: data.app_title || prev.app_title || "Hack26",
        app_subtitle: data.app_subtitle || prev.app_subtitle || "MIT • CIC • UPC"
      }));
    } catch (e) { console.error(e); }
  };

  const fetchDefaultLanguage = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/admin/config/language`);
    } catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/admin/stats`, { credentials: "include" });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) { console.error(e); }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/alerts`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) { console.error(e); }
  };

  const createAlert = async () => {
    if (!newAlertMsg) return;
    try {
      const res = await fetch(`${getBackendUrl()}/admin/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newAlertMsg, type: newAlertType, severity: newAlertSeverity }),
        credentials: "include"
      });
      if (res.ok) {
        setNewAlertMsg("");
        fetchAlerts();
        alert("Alert Sent!");
      }
    } catch (e) { console.error(e); }
  };

  const deactivateAlert = async (id: number) => {
    try {
      const res = await fetch(`${getBackendUrl()}/admin/alerts/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include"
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (e) { console.error(e); }
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/links`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (e) { console.error(e); }
  };

  const createLink = async () => {
    if (!newLinkTitle || !newLinkUrl) return;
    try {
      const res = await fetch(`${getBackendUrl()}/admin/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newLinkTitle, url: newLinkUrl }),
        credentials: "include"
      });
      if (res.ok) {
        setNewLinkTitle("");
        setNewLinkUrl("");
        fetchLinks();
      }
    } catch (e) { console.error(e); }
  };

  const deleteLink = async (id: number) => {
    try {
      const res = await fetch(`${getBackendUrl()}/admin/links/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include"
      });
      if (res.ok) {
        fetchLinks();
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchUsers();
    fetchCountdown();
    fetchDefaultLanguage();
    fetchStats();
    fetchAlerts();
    fetchLinks();
    const interval = setInterval(() => {
      fetchStatus();
      fetchStats();
      fetchAlerts();
    }, 4000);
    return () => clearInterval(interval);
  }, []);




  const updateEventConfig = async () => {
    await fetch(`${getBackendUrl()}/admin/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        next_event: config.event,
        current_event: config.current_event,
        target_epoch: config.target_epoch,
        youtube_id: config.youtube_id,
        station_duration: config.station_duration,
        app_title: config.app_title,
        app_subtitle: config.app_subtitle
      }),
      credentials: "include"
    });
    alert("Event details and app appearance updated!");
  };

  const updateStationConfig = async () => {
    if (!confirm("WARNING: Changing station counts will RESET ALL ACTIVE STATIONS. Continue?")) return;
    await fetch(`${getBackendUrl()}/admin/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cutter_stations: config.cutter,
        hot_glue_stations: config.hotglue
      }),
      credentials: "include"
    });
    alert("Station counts updated and reset!");
    window.location.reload();
  };

  const updateDefaultLanguage = async (newLang: string) => {
    await fetch(`${getBackendUrl()}/admin/config/language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: newLang }),
      credentials: "include"
    });
    setConfig({ ...config, default_language: newLang });
    alert(`Default language updated to ${newLang.toUpperCase()}`);
  }

  const toggleStation = async (type: string, index: number) => {
    await fetch(`${getBackendUrl()}/admin/station/toggle_disable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, index }),
      credentials: "include"
    });
    fetchStatus();
  };



  const addTime = async (type: string, id: number) => {
    try {
      await fetch(`${getBackendUrl()}/admin/station/addtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotType: type, stationId: id, minutes: 1 }),
        credentials: "include"
      });
      fetchStatus();
    } catch (e) { console.error(e); }
  };

  const clearStation = async (type: string, index: number) => {
    if (!confirm("Force clear this station?")) return;
    await fetch(`${getBackendUrl()}/admin/station/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, index }),
      credentials: "include"
    });
    fetchStatus();
  };

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", number: "", password: "", members: "", username: "", isAdmin: false });

  const startEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name, number: user.number, password: "", members: user.members || "", username: user.username || "", isAdmin: user.isAdmin || false });
  };

  const startCreate = () => {
    setEditingUser({ isNew: true });
    setEditForm({ name: "", number: "", password: "", members: "", username: "", isAdmin: false });
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    await fetch(`${getBackendUrl()}/admin/users/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: user.groupId }),
      credentials: "include"
    });
    fetchUsers();
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editingUser.isNew) {
      // Create
      await fetch(`${getBackendUrl()}/admin/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          number: parseInt(editForm.number),
          password: editForm.password,
          members: editForm.members,
          username: editForm.username,
          isAdmin: editForm.isAdmin
        }),
        credentials: "include"
      });
    } else {
      // Update
      await fetch(`${getBackendUrl()}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: editingUser.groupId,
          name: editForm.name,
          number: parseInt(editForm.number),
          password: editForm.password || undefined,
          members: editForm.members,
          username: editForm.username,
          isAdmin: editForm.isAdmin
        }),
        credentials: "include"
      });
    }

    setEditingUser(null);
    fetchUsers();
  };

  const resetStats = async () => {
    if (!confirm("CRITICAL WARNING: This will delete ALL session history and statistics. Are you sure?")) return;
    try {
      const res = await fetch(`${getBackendUrl()}/admin/stats/reset`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        alert("Statistics have been reset.");
        fetchStats();
      } else {
        alert("Failed to reset statistics.");
      }
    } catch (e) {
      console.error(e);
      alert("Error resetting statistics.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans relative">
      {/* Edit/Create Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-bold text-white">{editingUser.isNew ? "Create New Group" : "Edit Group"}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Group Name</label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Group Number</label>
                <Input
                  type="number"
                  value={editForm.number}
                  onChange={e => setEditForm({ ...editForm, number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Username (Login ID)</label>
                <Input
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="e.g. admin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Members (comma separated)</label>
                <Textarea
                  value={editForm.members}
                  onChange={e => setEditForm({ ...editForm, members: e.target.value })}
                  rows={3}
                  placeholder="John, Jane, Bob..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Password (Optional)</label>
                <Input
                  type="text"
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder={editingUser.isNew ? "Enter password" : "Leave empty to keep current"}
                />
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={editForm.isAdmin}
                  onChange={e => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isAdmin" className="text-sm text-slate-200 font-medium cursor-pointer">
                  Grant Admin Privileges
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setEditingUser(null)} variant="secondary" className="flex-1 py-2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 py-2">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div >
      )
      }

      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex flex-col gap-2">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-6">
          Admin Panel
        </h1>

        <a href="/" className="w-full text-left px-4 py-3 rounded-xl transition-colors hover:bg-white/5 text-slate-400 mb-2 flex items-center gap-2">
          <span>←</span> Back to Home
        </a>

        <button
          onClick={() => setActiveTab("stations")}
          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === "stations" ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5 text-slate-400"}`}
        >
          Stations & Config
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === "users" ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5 text-slate-400"}`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === "system" ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5 text-slate-400"}`}
        >
          System Settings
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`p-4 rounded-xl font-bold transition-all text-left ${activeTab === "stats"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          Statistics
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`p-4 rounded-xl font-bold transition-all text-left ${activeTab === "alerts"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          Alerts
        </button>

        <button
          onClick={() => setActiveTab("links")}
          className={`p-4 rounded-xl font-bold transition-all text-left ${activeTab === "links"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          Resources
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === "stations" && (
          <div className="space-y-8 max-w-4xl">
            {/* Config Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Settings - Safe to update */}
              {/* Event Settings - Safe to update */}
              <Card className="space-y-4 p-6">
                <h2 className="text-xl font-bold text-white">Event Settings</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Current Event</label>
                    <Input
                      type="text"
                      value={config.current_event}
                      onChange={(e) => setConfig({ ...config, current_event: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Next Event (Countdown)</label>
                    <Input
                      type="text"
                      value={config.event}
                      onChange={(e) => setConfig({ ...config, event: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Target Time (for Next Event)</label>
                    <Input
                      type="datetime-local"
                      value={(() => {
                        const date = new Date(config.target_epoch * 1000);
                        const offset = date.getTimezoneOffset() * 60000;
                        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
                      })()}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setConfig({ ...config, target_epoch: Math.floor(date.getTime() / 1000) });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">YouTube Video ID</label>
                    <Input
                      type="text"
                      value={config.youtube_id}
                      onChange={(e) => setConfig({ ...config, youtube_id: e.target.value })}
                      placeholder="e.g. xX4mBbJjdYM"
                    />
                  </div>
                  <Button onClick={updateEventConfig} className="w-full py-2 text-sm">Update Event Details</Button>
                </div>
              </Card>

              {/* Station Settings - DANGER */}
              <div className="glass-card p-6 space-y-4 border border-red-500/20">
                <h2 className="text-xl font-bold text-red-400">Station Settings</h2>
                <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded">
                  WARNING: Changing station counts will RESET all active stations!
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Box Cutter Stations</label>
                    <input
                      type="number"
                      value={config.cutter}
                      onChange={(e) => setConfig({ ...config, cutter: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Hot Glue Stations</label>
                    <input
                      type="number"
                      value={config.hotglue}
                      onChange={(e) => setConfig({ ...config, hotglue: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                    />
                  </div>
                  <button onClick={updateStationConfig} className="w-full py-2 px-6 text-sm font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                    Update Station Counts
                  </button>
                </div>
              </div>

              {/* Queue Settings */}
              <div className="glass-card p-6 space-y-4 md:col-span-2">
                <h2 className="text-xl font-bold text-white">Queue Settings</h2>
                <div className="md:w-1/2 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Station Duration (Minutes)</label>
                    <p className="text-xs text-slate-500">How long each group gets at a station. Applies to new sessions.</p>
                    <input
                      type="number"
                      value={config.station_duration}
                      onChange={(e) => setConfig({ ...config, station_duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                      min="1"
                    />
                  </div>
                  <button onClick={updateEventConfig} className="btn-primary w-full py-2 text-sm">Update Queue Settings</button>
                </div>
              </div>
            </div>

            {/* Stations Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-300 border-b border-white/10 pb-2">Cutting Stations</h3>
                <div className="grid gap-3">
                  {cut && cut.length > 0 ? cut.map((s, index) => (
                    <div key={index} className="glass-card p-4 flex flex-col items-center justify-between">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-sm mb-1">Station #{index + 1}</span>
                        <div className={`text-2xl font-bold ${s === 0 ? "text-green-400" :
                          s === 2 ? "text-slate-500" : "text-red-400"
                          }`}>
                          {s === 0 ? "AVAILABLE" : s === 2 ? "DISABLED" : "OCCUPIED"}
                        </div>
                        {typeof s === 'object' && <div className="text-xs text-white mt-1">{s.name}</div>}
                      </div>

                      <div className="mt-3 w-full space-y-2">
                        {typeof s === 'object' && s.name !== "Free" && s.name !== "Disabled" && s.name !== "Reserved" ? (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => addTime("cutter", index + 1)}
                              className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 p-2 rounded flex-1 text-xs font-bold transition-colors"
                              title="Add 1 Minute"
                            >
                              +1m
                            </button>
                            <button
                              onClick={() => { if (confirm("Force clear this station?")) clearStation("cutter", index); }}
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/40 p-2 rounded flex-1 text-xs font-bold transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => clearStation("cutter", index)}
                            className="w-full bg-red-500/20 text-red-400 py-1 px-2 rounded text-xs font-bold hover:bg-red-500/30 transition-colors"
                          >
                            Force Clear
                          </button>
                        )}
                        <button
                          onClick={() => toggleStation("cutter", index)}
                          className={`w-full py-2 px-2 rounded text-xs font-bold transition-colors ${s === 2
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
                            }`}
                        >
                          {s === 2 ? "ENABLE STATION" : "DISABLE STATION"}
                        </button>
                      </div>
                    </div>
                  )) : <div className="text-slate-500">Loading...</div>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-300 border-b border-white/10 pb-2">Hot Glue Stations</h3>
                <div className="grid gap-3">
                  {hot && hot.length > 0 ? hot.map((s, index) => (
                    <div key={index} className="glass-card p-4 flex flex-col items-center justify-between">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-sm mb-1">Station #{index + 1}</span>
                        <div className={`text-2xl font-bold ${s === 0 ? "text-green-400" :
                          s === 2 ? "text-slate-500" : "text-red-400"
                          }`}>
                          {s === 0 ? "AVAILABLE" : s === 2 ? "DISABLED" : "OCCUPIED"}
                        </div>
                        {typeof s === 'object' && <div className="text-xs text-white mt-1">{s.name}</div>}
                      </div>

                      <div className="mt-3 w-full space-y-2">
                        {typeof s === 'object' && s.name !== "Free" && s.name !== "Disabled" && s.name !== "Reserved" ? (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => addTime("hotglue", index + 1)}
                              className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 p-2 rounded flex-1 text-xs font-bold transition-colors"
                              title="Add 1 Minute"
                            >
                              +1m
                            </button>
                            <button
                              onClick={() => { if (confirm("Force clear this station?")) clearStation("hotglue", index); }}
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/40 p-2 rounded flex-1 text-xs font-bold transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => clearStation("hotglue", index)}
                            className="w-full bg-red-500/20 text-red-400 py-1 px-2 rounded text-xs font-bold hover:bg-red-500/30 transition-colors"
                          >
                            Force Clear
                          </button>
                        )}
                        <button
                          onClick={() => toggleStation("hotglue", index)}
                          className={`w-full py-2 px-2 rounded text-xs font-bold transition-colors ${s === 2
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
                            }`}
                        >
                          {s === 2 ? "ENABLE STATION" : "DISABLE STATION"}
                        </button>
                      </div>
                    </div>
                  )) : <div className="text-slate-500">Loading...</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <button onClick={startCreate} className="btn-primary py-2 px-4 text-sm">
                + Create New Group
              </button>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Group Name</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Group #</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user.groupId} className="hover:bg-white/5">
                      <td className="p-4 font-mono text-slate-500">{user.groupId}</td>
                      <td className="p-4 font-bold text-white">{user.name}</td>
                      <td className="p-4 text-slate-300">{user.username}</td>
                      <td className="p-4">
                        {user.isAdmin ? (
                          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/20">
                            ADMIN
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">User</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">{user.number}</td>
                      <td className="p-4 flex gap-3">
                        <button onClick={() => startEdit(user)} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteUser(user)} className="text-red-400 hover:text-red-300 text-sm font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
        }

        {
          activeTab === "system" && (
            <div className="space-y-8 max-w-4xl">
              <h2 className="text-xl font-bold text-white">System Configuration</h2>

              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">App Appearance</h3>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">App Title (e.g. Hack26)</label>
                  <input
                    type="text"
                    value={config.app_title || ""}
                    onChange={(e) => setConfig({ ...config, app_title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">App Subtitle (e.g. MIT • CIC • UPC)</label>
                  <input
                    type="text"
                    value={config.app_subtitle || ""}
                    onChange={(e) => setConfig({ ...config, app_subtitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                  />
                </div>

                <button onClick={updateEventConfig} className="btn-primary w-full py-2 text-sm">Update Appearance</button>
              </div>

              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Default Language</h3>
                <p className="text-sm text-slate-400">
                  This language will be used for new users who haven't selected a preference yet.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['en', 'es', 'ca', 'it', 'ko', 'zh', 'ja'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => updateDefaultLanguage(lang)}
                      className={`py-3 px-4 rounded-xl border font-bold transition-all ${config.default_language === lang
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        }
        {
          activeTab === "stats" && stats && (
            <div className="space-y-8 max-w-4xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">System Statistics</h2>
                <button
                  onClick={resetStats}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Reset Statistics
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 space-y-1">
                  <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Total Groups</div>
                  <div className="text-3xl font-bold text-white">{stats.total_groups || 0}</div>
                </div>
                <div className="glass-card p-4 space-y-1">
                  <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Total Sessions</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {(stats.total_sessions_cutter || 0) + (stats.total_sessions_hotglue || 0)}
                  </div>
                </div>
                <div className="glass-card p-4 space-y-1">
                  <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Assistance Provided</div>
                  <div className="text-3xl font-bold text-purple-400">{stats.assistance_total_helped || 0}</div>
                  <div className="text-xs text-slate-400">Avg Time: {(stats.assistance_avg_time || 0).toFixed(0)}s</div>
                </div>
                <div className="glass-card p-4 space-y-1">
                  <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Pending Assistance</div>
                  <div className="text-3xl font-bold text-red-400">{stats.assistance_queue_length || 0}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-300 border-b border-white/10 pb-2">Cutter Station</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current Queue</span>
                      <span className="text-xl font-mono text-white">{stats.cutter_queue_length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Occupied Stations</span>
                      <span className="text-xl font-mono text-white">{stats.cutter_stations_occupied || 0} / 4</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Avg. Duration</span>
                      <span className="text-xl font-mono text-blue-400">{((stats.cutter_avg_time || 0) / 60).toFixed(1)} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Completed</span>
                      <span className="text-xl font-mono text-green-400">{stats.total_sessions_cutter || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-300 border-b border-white/10 pb-2">Hot Glue Station</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current Queue</span>
                      <span className="text-xl font-mono text-white">{stats.hotglue_queue_length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Occupied Stations</span>
                      <span className="text-xl font-mono text-white">{stats.hotglue_stations_occupied || 0} / 5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Avg. Duration</span>
                      <span className="text-xl font-mono text-blue-400">{((stats.hotglue_avg_time || 0) / 60).toFixed(1)} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Completed</span>
                      <span className="text-xl font-mono text-green-400">{stats.total_sessions_hotglue || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Graph */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Usage History (Last 24h)</h3>
                <div className="h-80 flex items-end gap-2 border-b border-white/10 pb-2 overflow-x-auto pt-10">
                  {(() => {
                    const history = stats.usage_history || {};
                    const hours = Array.from({ length: 24 }, (_, i) => i);
                    const maxVal = Math.max(1, ...Object.values(history).map((h: any) => (h.cutter || 0) + (h.hotglue || 0)));

                    return hours.map(h => {
                      const data = history[h] || { cutter: 0, hotglue: 0 };
                      const cutterCount = data.cutter || 0;
                      const hotglueCount = data.hotglue || 0;
                      const total = cutterCount + hotglueCount;

                      // Calc percentages carefully to avoid NaN
                      // Use PIXEL height (max 200px) inside h-80 (320px) container leaves ~120px for tooltip
                      const heightPx = maxVal > 0 ? Math.max(4, (total / maxVal) * 200) : 4;
                      const cutterPct = total > 0 ? (cutterCount / total) * 100 : 0;
                      const hotgluePct = total > 0 ? (hotglueCount / total) * 100 : 0;

                      return (
                        <div key={h} className="flex-1 min-w-[30px] flex flex-col items-center gap-1 group relative">
                          <div className="w-full bg-white/10 rounded-t overflow-hidden flex flex-col-reverse relative hover:bg-white/20 transition-colors" style={{ height: `${heightPx}px` }}>
                            <div className="w-full bg-blue-500" style={{ height: `${cutterPct}%` }}></div>
                            <div className="w-full bg-orange-500" style={{ height: `${hotgluePct}%` }}></div>
                          </div>
                          <span className="text-[10px] text-slate-500">{h}:00</span>

                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-black/90 p-2 rounded text-xs whitespace-nowrap hidden group-hover:block z-10 border border-white/10">
                            <div className="text-blue-400">Cutter: {cutterCount}</div>
                            <div className="text-orange-400">Hot Glue: {hotglueCount}</div>
                            <div className="text-white font-bold border-t border-white/10 mt-1 pt-1">Total: {total}</div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>


              {/* Group Leaderboard */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Top Active Groups</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-white/5">
                      <tr>
                        <th className="px-4 py-2 rounded-l-lg">Rank</th>
                        <th className="px-4 py-2">Group Name</th>
                        <th className="px-4 py-2 text-center text-blue-400">Cutter</th>
                        <th className="px-4 py-2 text-center text-orange-400">Hot Glue</th>
                        <th className="px-4 py-2 text-center rounded-r-lg">Total Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats.leaderboard || []).map((group: any, idx: number) => (
                        <tr key={group.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2 font-bold text-slate-500">#{idx + 1}</td>
                          <td className="px-4 py-2 font-medium text-white">{group.name}</td>
                          <td className="px-4 py-2 text-center text-blue-300">{group.cutter}</td>
                          <td className="px-4 py-2 text-center text-orange-300">{group.hotglue}</td>
                          <td className="px-4 py-2 text-center font-bold text-white">{group.total}</td>
                        </tr>
                      ))}
                      {(stats.leaderboard || []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            No sessions recorded yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        }

        {
          activeTab === "alerts" && (
            <div className="space-y-8 max-w-4xl">
              <h2 className="text-xl font-bold text-white">Manage Global Alerts</h2>

              {/* Create Alert */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-300 border-b border-white/10 pb-2">Send New Alert</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                    <textarea
                      value={newAlertMsg}
                      onChange={(e) => setNewAlertMsg(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                      placeholder="Enter announcement message..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Severity / Style</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setNewAlertSeverity("info")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors border ${newAlertSeverity === "info" ? "bg-blue-500/20 border-blue-500 text-blue-400" : "border-white/10 text-slate-400 hover:bg-white/5"}`}
                      >
                        Info (Blue)
                      </button>
                      <button
                        onClick={() => setNewAlertSeverity("warning")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors border ${newAlertSeverity === "warning" ? "bg-orange-500/20 border-orange-500 text-orange-400" : "border-white/10 text-slate-400 hover:bg-white/5"}`}
                      >
                        Warning (Yellow)
                      </button>
                      <button
                        onClick={() => setNewAlertSeverity("announcement")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors border ${newAlertSeverity === "announcement" ? "bg-purple-500/20 border-purple-500 text-purple-400" : "border-white/10 text-slate-400 hover:bg-white/5"}`}
                      >
                        Announcement (Purple)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Alert Type</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setNewAlertType("onetime")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors border ${newAlertType === "onetime" ? "bg-blue-500/20 border-blue-500 text-blue-400" : "border-white/10 text-slate-400 hover:bg-white/5"}`}
                      >
                        One-time (Dismissible)
                      </button>
                      <button
                        onClick={() => setNewAlertType("persistent")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors border ${newAlertType === "persistent" ? "bg-red-500/20 border-red-500 text-red-400" : "border-white/10 text-slate-400 hover:bg-white/5"}`}
                      >
                        Persistent (Always Show)
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {newAlertType === "onetime"
                        ? "Users will see this once and can dismiss it permanently."
                        : "Users will see this every time they open the app until you deactivate it."}
                    </p>
                  </div>

                  <button
                    onClick={createAlert}
                    disabled={!newAlertMsg}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Alert
                  </button>
                </div>
              </div>

              {/* Active Alerts List */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-300 border-b border-white/10 pb-2">Active Alerts</h3>

                {alerts.length === 0 ? (
                  <div className="text-slate-500 text-center py-8">No active alerts</div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert: any) => (
                      <div key={alert.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${alert.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' :
                              alert.severity === 'announcement' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' :
                                'bg-blue-500/10 border-blue-500/50 text-blue-400'
                              }`}>
                              {alert.severity || 'info'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${alert.type === 'persistent' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                              {alert.type}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(alert.created_at * 1000).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-white text-md">{alert.message}</p>
                        </div>

                        <button
                          onClick={() => deactivateAlert(alert.id)}
                          className="text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                          title="Deactivate Alert"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        }

        {
          activeTab === "links" && (
            <div className="space-y-8 max-w-4xl">
              <h2 className="text-xl font-bold text-white">Manage Resources / Links</h2>

              {/* Create Link */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-300 border-b border-white/10 pb-2">Add New Resource</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Project Documentation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">URL</label>
                    <input
                      type="text"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. https://example.com/docs"
                    />
                  </div>

                  <button
                    onClick={createLink}
                    disabled={!newLinkTitle || !newLinkUrl}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Link
                  </button>
                </div>
              </div>

              {/* Active Links List */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-300 border-b border-white/10 pb-2">Active Resources</h3>

                {links.length === 0 ? (
                  <div className="text-slate-500 text-center py-8">No resources added</div>
                ) : (
                  <div className="space-y-3">
                    {links.map((link: any) => (
                      <div key={link.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center gap-4">
                        <div className="overflow-hidden">
                          <h4 className="text-white font-bold text-base truncate">{link.title}</h4>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline truncate block">
                            {link.url}
                          </a>
                        </div>

                        <button
                          onClick={() => deleteLink(link.id)}
                          className="text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors flex-shrink-0"
                          title="Delete Link"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
}
