import { useState, useMemo } from "react";
import AppLayout from "@/components/feature/AppLayout";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import { supabase } from "@/lib/supabase";

function getGrade(score: number) {
  if (score >= 90) return { letter: "A+", color: "text-teal-600 bg-teal-50" };
  if (score >= 80) return { letter: "A",  color: "text-teal-600 bg-teal-50" };
  if (score >= 70) return { letter: "B",  color: "text-slate-600 bg-slate-100" };
  if (score >= 60) return { letter: "C",  color: "text-amber-600 bg-amber-50" };
  return              { letter: "D",  color: "text-rose-600 bg-rose-50" };
}

const TERMS = ["Term 1", "Term 2", "Term 3"];

export default function GradesPage() {
  const {
    students,
    teachers,
    gradesRows,
    gradeSubjects,
    currentUserRole,
    currentUserEmail,
  } = useSchoolData();

  const isTeacher = currentUserRole === "Teacher";

  // Find the teacher profile that matches the logged-in user
  const myTeacherProfile = useMemo(
    () => teachers.find((t) => t.email?.toLowerCase() === currentUserEmail?.toLowerCase()),
    [teachers, currentUserEmail]
  );

  const mySubject   = myTeacherProfile?.subject ?? "";
  const myClasses   = myTeacherProfile?.classes  ?? [];

  // ── Admin state ──
  const allSubjects = gradeSubjects.length
    ? gradeSubjects
    : ["Mathematics", "English", "Science", "Social Studies", "ICT", "French"];

  const [selectedGrade,   setSelectedGrade]   = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [search,          setSearch]          = useState("");

  // ── Teacher state ──
  const [selectedClass, setSelectedClass] = useState<string>(myClasses[0] ?? "");
  const [selectedTerm,  setSelectedTerm]  = useState(TERMS[0]);
  const [editedScores,  setEditedScores]  = useState<Record<string, number>>({});
  const [saving,        setSaving]        = useState(false);
  const [savedAt,       setSavedAt]       = useState<string | null>(null);
  const [saveError,     setSaveError]     = useState<string | null>(null);

  // ── Admin helpers ──
  const gradesData = useMemo(() =>
    students.map((student) => {
      const scores = allSubjects.reduce((acc, subject) => {
        const match = gradesRows.find((r) => r.student === student.name && r.subject === subject);
        acc[subject] = Number(match?.score ?? Math.round(student.gpa * 25));
        return acc;
      }, {} as Record<string, number>);
      return { ...student, scores };
    }),
    [students, allSubjects, gradesRows]
  );

  const adminFiltered = gradesData.filter((s) => {
    const matchGrade  = selectedGrade === "All" || s.grade.startsWith(selectedGrade);
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchGrade && matchSearch;
  });

  // ── Teacher helpers ──
  const classStudents = useMemo(
    () => students.filter((s) => s.grade === selectedClass),
    [students, selectedClass]
  );

  // Seed editedScores from saved grades whenever class/term/subject changes
  const seededScores = useMemo(() => {
    const seed: Record<string, number> = {};
    classStudents.forEach((s) => {
      const saved = gradesRows.find(
        (r) => r.student === s.name && r.subject === mySubject && r.class_name === selectedClass
      );
      seed[s.id] = saved?.score != null ? Number(saved.score) : 0;
    });
    return seed;
  }, [classStudents, gradesRows, mySubject, selectedClass]);

  function getScore(studentId: string) {
    return editedScores[studentId] ?? seededScores[studentId] ?? 0;
  }

  function setScore(studentId: string, val: string) {
    const n = Math.min(100, Math.max(0, Number(val) || 0));
    setEditedScores((prev) => ({ ...prev, [studentId]: n }));
  }

  const isDirty = Object.keys(editedScores).length > 0;

  const handleSave = async () => {
    if (!mySubject || !selectedClass) return;
    setSaving(true);
    setSaveError(null);

    const records = classStudents.map((s) => ({
      student:    s.name,
      class_name: selectedClass,
      subject:    mySubject,
      score:      getScore(s.id),
      term:       selectedTerm,
      year:       new Date().getFullYear().toString(),
    }));

    const { error } = await supabase.from("grades").upsert(records, {
      onConflict: "student,subject,class_name,term,year",
      ignoreDuplicates: false,
    });

    if (error) {
      setSaveError(error.message);
    } else {
      setEditedScores({});
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }
    setSaving(false);
  };

  const classAvg = classStudents.length
    ? Math.round(classStudents.reduce((sum, s) => sum + getScore(s.id), 0) / classStudents.length)
    : 0;

  // ────────────────────────────────────────────────────────────
  // TEACHER VIEW
  // ────────────────────────────────────────────────────────────
  if (isTeacher) {
    if (!myTeacherProfile) {
      return (
        <AppLayout title="Grades" subtitle="Enter scores for your classes">
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-400">
            Your teacher profile couldn't be found. Please contact an administrator.
          </div>
        </AppLayout>
      );
    }

    return (
      <AppLayout title="Grades" subtitle={`Enter scores — ${mySubject}`}>
        {/* Teacher identity banner */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl px-5 py-4 mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {myTeacherProfile.avatar}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{myTeacherProfile.name}</p>
              <p className="text-white/70 text-xs">{mySubject} Teacher · {myClasses.join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {savedAt && !isDirty && (
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <i className="ri-checkbox-circle-line"></i> Saved at {savedAt}
              </span>
            )}
            {isDirty && (
              <span className="flex items-center gap-1 text-amber-200 text-xs animate-pulse">
                <i className="ri-edit-line"></i> Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-white text-teal-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-teal-50 disabled:opacity-50 cursor-pointer transition-all"
            >
              {saving ? <><span className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></span> Saving…</> : <><i className="ri-save-line"></i> Save Grades</>}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
            <i className="ri-error-warning-line flex-shrink-0"></i>{saveError}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Class tabs */}
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100">
            {myClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => { setSelectedClass(cls); setEditedScores({}); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedClass === cls ? "bg-teal-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                {cls}
              </button>
            ))}
          </div>
          {/* Term selector */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none cursor-pointer"
          >
            {TERMS.map((t) => <option key={t}>{t}</option>)}
          </select>
          {/* Stats */}
          <div className="ml-auto flex items-center gap-4 text-xs text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-2">
            <span><span className="font-bold text-slate-700">{classStudents.length}</span> students</span>
            <span className="w-px h-3 bg-slate-200"></span>
            <span>Class avg: <span className={`font-bold ${classAvg >= 70 ? "text-teal-600" : classAvg >= 50 ? "text-amber-600" : "text-rose-600"}`}>{classAvg}%</span></span>
          </div>
        </div>

        {/* Grade entry table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{selectedClass} · {mySubject} · {selectedTerm}</p>
            <p className="text-xs text-slate-400">Click a score to edit</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Score / 100</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {classStudents.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">No students in {selectedClass}.</td></tr>
              ) : classStudents.map((s, idx) => {
                const score = getScore(s.id);
                const g     = getGrade(score);
                const dirty = editedScores[s.id] !== undefined;
                return (
                  <tr key={s.id} className={`hover:bg-slate-50 transition-all ${dirty ? "bg-amber-50/40" : ""}`}>
                    <td className="px-5 py-3 text-xs text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                          <span className="text-slate-600 text-xs font-bold">{s.avatar}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        {dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={score === 0 && editedScores[s.id] === undefined ? "" : score}
                        onChange={(e) => setScore(s.id, e.target.value)}
                        placeholder="—"
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${g.color}`}>{g.letter}</span>
                    </td>
                    <td className="px-4 py-3 w-36">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${score >= 80 ? "bg-teal-400" : score >= 60 ? "bg-amber-400" : "bg-rose-400"}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {classStudents.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm"
              >
                {saving ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Saving…</> : <><i className="ri-save-line"></i> Save {Object.keys(editedScores).length || ""} Changes</>}
              </button>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // ────────────────────────────────────────────────────────────
  // ADMIN VIEW
  // ────────────────────────────────────────────────────────────
  const adminGrades = ["All", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];

  return (
    <AppLayout title="Grades" subtitle="Academic scores and grade management">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "A Grade Students",  value: students.filter((s) => s.gpa >= 3.5).length, icon: "ri-medal-line" },
          { label: "School Avg Score",  value: "82%",                                        icon: "ri-bar-chart-2-line" },
          { label: "Subjects Tracked",  value: allSubjects.length,                           icon: "ri-book-open-line" },
          { label: "Needs Attention",   value: students.filter((s) => s.gpa < 3.0).length,  icon: "ri-error-warning-line" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
              <i className={`${m.icon} text-slate-500 text-base`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{m.value}</p>
              <p className="text-xs text-slate-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="pl-9 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-teal-300 transition-all w-52"
          />
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100">
          {adminGrades.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedGrade === g ? "bg-teal-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none cursor-pointer"
        >
          <option value="All">All Subjects</option>
          {allSubjects.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 whitespace-nowrap">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Class</th>
                {(selectedSubject === "All" ? allSubjects : [selectedSubject]).map((sub) => (
                  <th key={sub} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{sub}</th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">GPA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {adminFiltered.map((s, idx) => {
                const displaySubs = selectedSubject === "All" ? allSubjects : [selectedSubject];
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-5 py-3 sticky left-0 bg-white group-hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                          <span className="text-slate-600 text-xs font-bold">{s.avatar}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{s.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{s.grade}</td>
                    {displaySubs.map((sub) => {
                      const score = s.scores[sub];
                      const g = getGrade(score);
                      return (
                        <td key={sub} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">{score}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${g.color}`}>{g.letter}</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3"><span className="text-sm font-bold text-teal-600">{s.gpa}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-semibold text-slate-500">#{idx + 1}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
