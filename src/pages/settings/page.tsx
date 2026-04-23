import { useState } from "react";
import AppLayout from "@/components/feature/AppLayout";

const settingsSections = [
  { id: "school", label: "School Profile", icon: "ri-building-line" },
  { id: "academic", label: "Academic Year", icon: "ri-calendar-line" },
  { id: "notifications", label: "Notifications", icon: "ri-notification-3-line" },
  { id: "security", label: "Security", icon: "ri-shield-keyhole-line" },
  { id: "appearance", label: "Appearance", icon: "ri-palette-line" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("school");
  const [schoolName, setSchoolName] = useState("EduManage Pro Academy");
  const [motto, setMotto] = useState("Excellence in Education");
  const [email, setEmail] = useState("admin@edumanage.edu");
  const [phone, setPhone] = useState("+233 30 000 0000");
  const [address, setAddress] = useState("123 Education Avenue, Accra, Ghana");
  const [saved, setSaved] = useState(false);

  const [notifs, setNotifs] = useState({
    feeAlerts: true,
    attendanceAlerts: true,
    eventReminders: true,
    inventoryAlerts: true,
    reportReady: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppLayout title="Settings" subtitle="Configure your school management system">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 h-fit">
          {settingsSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer mb-1 ${
                activeSection === s.id
                  ? "bg-gradient-to-r from-slate-800 to-slate-700 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <i className={`${s.icon} text-base ${activeSection === s.id ? "text-white" : "text-slate-400"}`}></i>
              <span className="text-sm font-medium whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === "school" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-800">School Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Update your school information</p>
                </div>
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl overflow-hidden border-2 border-slate-100">
                  <img src="https://public.readdy.ai/ai/img_res/6d13ccf5-6ba9-4236-9071-542996229d05.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "School Name", value: schoolName, setter: setSchoolName },
                  { label: "School Motto", value: motto, setter: setMotto },
                  { label: "Email Address", value: email, setter: setEmail },
                  { label: "Phone Number", value: phone, setter: setPhone },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.label}</label>
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => f.setter(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50 focus:bg-white"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">School Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-save-line"></i>
                  Save Changes
                </button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <i className="ri-checkbox-circle-fill text-emerald-500"></i>
                    Saved successfully!
                  </span>
                )}
              </div>
            </div>
          )}

          {activeSection === "academic" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-1">Academic Year Settings</h3>
              <p className="text-xs text-slate-400 mb-6">Configure academic year and term structure</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Current Academic Year", value: "2025/26" },
                  { label: "Current Term", value: "Term 2" },
                  { label: "Term Start Date", value: "2026-01-13", type: "date" },
                  { label: "Term End Date", value: "2026-04-30", type: "date" },
                  { label: "Next Academic Year", value: "2026/27" },
                  { label: "Number of Terms", value: "3" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.label}</label>
                    <input
                      type={f.type || "text"}
                      defaultValue={f.value}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50 focus:bg-white"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap">
                <i className="ri-save-line"></i>Save Changes
              </button>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-1">Notification Preferences</h3>
              <p className="text-xs text-slate-400 mb-6">Choose what alerts you want to receive</p>
              <div className="space-y-4">
                {(Object.keys(notifs) as (keyof typeof notifs)[]).map((key) => {
                  const labels: Record<string, { label: string; desc: string }> = {
                    feeAlerts: { label: "Fee Payment Alerts", desc: "Get notified when fees are paid or overdue" },
                    attendanceAlerts: { label: "Attendance Alerts", desc: "Daily attendance summary and absence alerts" },
                    eventReminders: { label: "Event Reminders", desc: "Reminders for upcoming school events" },
                    inventoryAlerts: { label: "Inventory Alerts", desc: "Low stock and critical inventory warnings" },
                    reportReady: { label: "Report Ready", desc: "Notification when reports are generated" },
                  };
                  const info = labels[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{info.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{info.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ${notifs[key] ? "bg-teal-500" : "bg-slate-200"}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${notifs[key] ? "left-5" : "left-0.5"}`}></span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-1">Security Settings</h3>
              <p className="text-xs text-slate-400 mb-6">Manage password and access security</p>
              <div className="space-y-4">
                {[
                  { label: "Current Password", placeholder: "Enter current password" },
                  { label: "New Password", placeholder: "Enter new password" },
                  { label: "Confirm New Password", placeholder: "Confirm new password" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.label}</label>
                    <input type="password" placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-300 transition-all bg-slate-50 focus:bg-white" />
                  </div>
                ))}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                  <i className="ri-shield-keyhole-line text-amber-500 text-lg flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Two-Factor Authentication</p>
                    <p className="text-xs text-amber-600 mt-0.5">Add an extra layer of security to your account</p>
                    <button className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer">Enable 2FA &rarr;</button>
                  </div>
                </div>
              </div>
              <button onClick={handleSave} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap">
                <i className="ri-save-line"></i>Update Password
              </button>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-1">Appearance</h3>
              <p className="text-xs text-slate-400 mb-6">Customize the look and feel</p>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-3">Accent Color</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      { name: "Emerald", from: "#10b981", to: "#14b8a6" },
                      { name: "Violet", from: "#8b5cf6", to: "#a855f7" },
                      { name: "Rose", from: "#f43f5e", to: "#ec4899" },
                      { name: "Amber", from: "#f59e0b", to: "#f97316" },
                      { name: "Cyan", from: "#06b6d4", to: "#0ea5e9" },
                    ].map((c) => (
                      <button
                        key={c.name}
                        className="w-10 h-10 rounded-xl cursor-pointer hover:scale-110 transition-all border-2 border-white shadow-md"
                        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                        title={c.name}
                      ></button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-3">Sidebar Style</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Dark Navy (Current)", "Midnight Black"].map((style) => (
                      <button
                        key={style}
                        className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${style.includes("Current") ? "border-teal-300 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
