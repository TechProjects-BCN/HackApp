"use client";

import { useState, useEffect } from "react";
import { getBackendUrl } from "../utils/config";



export default function Admin() {
  const [activeTab, setActiveTab] = useState("stations");
  const [users, setUsers] = useState<any[]>([]);
  const [config, setConfig] = useState({
    cutter: 4,
    hotglue: 5,
    event: "Hackathon Start",
    current_event: "Networking",
    target_epoch: 1745943020,
    youtube_id: "xX4mBbJjdYM",
    station_duration: 10,
    default_language: "en"
  });

  const [cut, setCut] = useState<any[]>([]);
  const [hot, setHot] = useState<any[]>([]);

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
      setHot(data.hot_glue_stations || []);

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
      setConfig(prev => ({
        ...prev,
        event: data.next_event || data.event, // handle legacy or new
        current_event: data.current_event || "Networking",
        target_epoch: data.target_epoch,
        youtube_id: data.youtube_id || prev.youtube_id,
        station_duration: data.station_duration || 10
      }));
    } catch (e) { console.error(e); }
  };

  const fetchDefaultLanguage = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/admin/config/language`);
      const data = await res.json();
      setConfig(prev => ({ ...prev, default_language: data.language }));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchUsers();
    fetchCountdown();
    fetchDefaultLanguage();
    const interval = setInterval(fetchStatus, 1000);
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
        station_duration: config.station_duration
      }),
      credentials: "include"
    });
    alert("Event details updated! (Stations remained active)");
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

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans relative">
      {/* Edit/Create Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-bold text-white">{editingUser.isNew ? "Create New Group" : "Edit Group"}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Group Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Group Number</label>
                <input
                  type="number"
                  value={editForm.number}
                  onChange={e => setEditForm({ ...editForm, number: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Username (Login ID)</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                  placeholder="e.g. admin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Members (comma separated)</label>
                <textarea
                  value={editForm.members}
                  onChange={e => setEditForm({ ...editForm, members: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                  rows={3}
                  placeholder="John, Jane, Bob..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Password (Optional)</label>
                <input
                  type="text"
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
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
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 btn-secondary py-2">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === "stations" && (
          <div className="space-y-8 max-w-4xl">
            {/* Config Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Settings - Safe to update */}
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-xl font-bold text-white">Event Settings</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Current Event</label>
                    <input
                      type="text"
                      value={config.current_event}
                      onChange={(e) => setConfig({ ...config, current_event: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Next Event (Countdown)</label>
                    <input
                      type="text"
                      value={config.event}
                      onChange={(e) => setConfig({ ...config, event: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Target Time (for Next Event)</label>
                    <input
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
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">YouTube Video ID</label>
                    <input
                      type="text"
                      value={config.youtube_id}
                      onChange={(e) => setConfig({ ...config, youtube_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                      placeholder="e.g. xX4mBbJjdYM"
                    />
                  </div>
                  <button onClick={updateEventConfig} className="btn-primary w-full py-2 text-sm">Update Event Details</button>
                </div>
              </div>

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
                      <div className="flex gap-2 mt-3 w-full">
                        <button
                          onClick={() => toggleStation("cutter", index)}
                          className={`flex-1 py-1 px-2 rounded text-xs font-bold transition-colors ${s === 2
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
                            }`}
                        >
                          {s === 2 ? "ENABLE" : "DISABLE"}
                        </button>
                        <button
                          onClick={() => clearStation("cutter", index)}
                          className="flex-1 bg-red-500/20 text-red-400 py-1 px-2 rounded text-xs font-bold hover:bg-red-500/30 transition-colors"
                        >
                          Force Clear
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
                      <div className="flex gap-2 mt-3 w-full">
                        <button
                          onClick={() => toggleStation("hotglue", index)}
                          className={`flex-1 py-1 px-2 rounded text-xs font-bold transition-colors ${s === 2
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
                            }`}
                        >
                          {s === 2 ? "ENABLE" : "DISABLE"}
                        </button>
                        <button
                          onClick={() => clearStation("hotglue", index)}
                          className="flex-1 bg-red-500/20 text-red-400 py-1 px-2 rounded text-xs font-bold hover:bg-red-500/30 transition-colors"
                        >
                          Force Clear
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
        )}

        {activeTab === "system" && (
          <div className="space-y-8 max-w-4xl">
            <h2 className="text-xl font-bold text-white">System Configuration</h2>

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
        )}
      </div >
    </div >
  );
}
