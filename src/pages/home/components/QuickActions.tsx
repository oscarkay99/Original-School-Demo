import { useNavigate } from "react-router-dom";

const actions = [
  {
    label: "Enroll Student",
    sub: "Add new learner",
    icon: "ri-user-add-line",
    path: "/students",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  },
  {
    label: "Mark Attendance",
    sub: "Today's register",
    icon: "ri-calendar-check-line",
    path: "/attendance",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  },
  {
    label: "Record Payment",
    sub: "Log fee collection",
    icon: "ri-money-dollar-circle-line",
    path: "/finance",
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
  },
  {
    label: "Issue Certificate",
    sub: "Award achievement",
    icon: "ri-medal-line",
    path: "/id-cards",
    gradient: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
  },
];

export default function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Common tasks at your fingertips</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="flex flex-col items-start gap-3 p-4 rounded-xl cursor-pointer text-white overflow-hidden relative group transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: a.gradient }}
          >
            <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-white/10 -translate-y-4 translate-x-4"></div>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <i className={`${a.icon} text-base`}></i>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight whitespace-nowrap">{a.label}</p>
              <p className="text-white/60 text-[10px] mt-0.5">{a.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
