export const students = [
  { id: 1, name: "Ama Owusu", grade: "Grade 9A", gpa: 3.8, status: "Active", attendance: 96, fees: "Paid", avatar: "AO", dob: "2010-03-15", parent: "Kwame Owusu", phone: "+233 24 123 4567", joined: "2022-09-01" },
  { id: 2, name: "Kofi Mensah", grade: "Grade 10B", gpa: 3.5, status: "Active", attendance: 89, fees: "Pending", avatar: "KM", dob: "2009-07-22", parent: "Abena Mensah", phone: "+233 20 987 6543", joined: "2021-09-01" },
  { id: 3, name: "Akosua Boateng", grade: "Grade 8C", gpa: 3.9, status: "Active", attendance: 98, fees: "Paid", avatar: "AB", dob: "2011-01-10", parent: "Yaw Boateng", phone: "+233 27 456 7890", joined: "2023-09-01" },
  { id: 4, name: "Kweku Asante", grade: "Grade 11A", gpa: 3.2, status: "Active", attendance: 82, fees: "Overdue", avatar: "KA", dob: "2008-11-05", parent: "Esi Asante", phone: "+233 26 321 0987", joined: "2020-09-01" },
  { id: 5, name: "Abena Darko", grade: "Grade 9B", gpa: 3.7, status: "Active", attendance: 94, fees: "Paid", avatar: "AD", dob: "2010-06-18", parent: "Kojo Darko", phone: "+233 24 654 3210", joined: "2022-09-01" },
  { id: 6, name: "Yaw Frimpong", grade: "Grade 10A", gpa: 3.4, status: "Inactive", attendance: 71, fees: "Pending", avatar: "YF", dob: "2009-09-30", parent: "Adwoa Frimpong", phone: "+233 20 111 2222", joined: "2021-09-01" },
  { id: 7, name: "Efua Quaye", grade: "Grade 8A", gpa: 4.0, status: "Active", attendance: 100, fees: "Paid", avatar: "EQ", dob: "2011-04-25", parent: "Nana Quaye", phone: "+233 27 333 4444", joined: "2023-09-01" },
  { id: 8, name: "Nana Adjei", grade: "Grade 11B", gpa: 3.1, status: "Active", attendance: 85, fees: "Paid", avatar: "NA", dob: "2008-12-12", parent: "Ama Adjei", phone: "+233 26 555 6666", joined: "2020-09-01" },
  { id: 9, name: "Kojo Amponsah", grade: "Grade 9C", gpa: 3.6, status: "Active", attendance: 91, fees: "Pending", avatar: "KA", dob: "2010-08-07", parent: "Kwesi Amponsah", phone: "+233 24 777 8888", joined: "2022-09-01" },
  { id: 10, name: "Adwoa Sarpong", grade: "Grade 10C", gpa: 3.3, status: "Active", attendance: 88, fees: "Paid", avatar: "AS", dob: "2009-02-14", parent: "Akua Sarpong", phone: "+233 20 999 0000", joined: "2021-09-01" },
  { id: 11, name: "Kwame Tetteh", grade: "Grade 8B", gpa: 3.8, status: "Active", attendance: 95, fees: "Paid", avatar: "KT", dob: "2011-05-20", parent: "Esi Tetteh", phone: "+233 27 111 3333", joined: "2023-09-01" },
  { id: 12, name: "Esi Bonsu", grade: "Grade 11C", gpa: 2.9, status: "Active", attendance: 78, fees: "Overdue", avatar: "EB", dob: "2008-10-01", parent: "Kofi Bonsu", phone: "+233 26 444 5555", joined: "2020-09-01" },
];

export const teachers = [
  { id: 1, name: "Mr. Samuel Agyei", subject: "Mathematics", classes: ["Grade 9A", "Grade 10B", "Grade 11A"], status: "Active", experience: "8 years", email: "s.agyei@edumanage.edu", phone: "+233 24 100 2000", avatar: "SA", rating: 4.8, students: 87 },
  { id: 2, name: "Mrs. Grace Asiedu", subject: "English Language", classes: ["Grade 8A", "Grade 8B", "Grade 9B"], status: "Active", experience: "12 years", email: "g.asiedu@edumanage.edu", phone: "+233 20 300 4000", avatar: "GA", rating: 4.9, students: 92 },
  { id: 3, name: "Mr. Daniel Osei", subject: "Science", classes: ["Grade 10A", "Grade 10C", "Grade 11B"], status: "Active", experience: "6 years", email: "d.osei@edumanage.edu", phone: "+233 27 500 6000", avatar: "DO", rating: 4.6, students: 78 },
  { id: 4, name: "Ms. Patricia Adu", subject: "Social Studies", classes: ["Grade 8C", "Grade 9C", "Grade 11C"], status: "Active", experience: "10 years", email: "p.adu@edumanage.edu", phone: "+233 26 700 8000", avatar: "PA", rating: 4.7, students: 83 },
  { id: 5, name: "Mr. Emmanuel Boadu", subject: "ICT", classes: ["Grade 9A", "Grade 10A", "Grade 11A"], status: "On Leave", experience: "5 years", email: "e.boadu@edumanage.edu", phone: "+233 24 900 1000", avatar: "EB", rating: 4.5, students: 65 },
  { id: 6, name: "Mrs. Comfort Nyarko", subject: "French", classes: ["Grade 8A", "Grade 9B", "Grade 10B"], status: "Active", experience: "15 years", email: "c.nyarko@edumanage.edu", phone: "+233 20 200 3000", avatar: "CN", rating: 4.9, students: 71 },
];

export const attendanceData = [
  { date: "2026-04-21", present: 10, absent: 2, late: 1, total: 12 },
  { date: "2026-04-20", present: 11, absent: 1, late: 0, total: 12 },
  { date: "2026-04-19", present: 9, absent: 3, late: 2, total: 12 },
  { date: "2026-04-18", present: 12, absent: 0, late: 0, total: 12 },
  { date: "2026-04-17", present: 10, absent: 2, late: 1, total: 12 },
  { date: "2026-04-16", present: 8, absent: 4, late: 2, total: 12 },
  { date: "2026-04-15", present: 11, absent: 1, late: 1, total: 12 },
];

export const events = [
  { id: 1, title: "End of Term Examination", date: "2026-05-15", time: "08:00 AM", type: "Academic", status: "Upcoming", location: "All Classrooms", attendees: 120 },
  { id: 2, title: "Annual Sports Day", date: "2026-05-22", time: "09:00 AM", type: "Sports", status: "Upcoming", location: "School Grounds", attendees: 250 },
  { id: 3, title: "Parent-Teacher Conference", date: "2026-04-28", time: "02:00 PM", type: "Meeting", status: "Upcoming", location: "Assembly Hall", attendees: 80 },
  { id: 4, title: "Science Fair 2026", date: "2026-04-30", time: "10:00 AM", type: "Academic", status: "Upcoming", location: "Science Block", attendees: 150 },
  { id: 5, title: "Cultural Day Celebration", date: "2026-04-10", time: "09:00 AM", type: "Cultural", status: "Completed", location: "School Grounds", attendees: 300 },
  { id: 6, title: "Mathematics Olympiad", date: "2026-04-05", time: "08:30 AM", type: "Academic", status: "Completed", location: "Main Hall", attendees: 45 },
];

export const financeData = {
  totalRevenue: 34200,
  collected: 18000,
  outstanding: 16200,
  expenses: 12500,
  monthlyData: [
    { month: "Jan", revenue: 8500, expenses: 3200 },
    { month: "Feb", revenue: 7200, expenses: 2800 },
    { month: "Mar", revenue: 9100, expenses: 3500 },
    { month: "Apr", revenue: 9400, expenses: 3000 },
  ],
  feeBreakdown: [
    { category: "Tuition Fees", amount: 24000, collected: 14000, percentage: 58 },
    { category: "Sports Levy", amount: 3600, collected: 1800, percentage: 50 },
    { category: "Library Fee", amount: 1800, collected: 1200, percentage: 67 },
    { category: "ICT Fee", amount: 2400, collected: 1000, percentage: 42 },
    { category: "Exam Fee", amount: 2400, collected: 0, percentage: 0 },
  ],
  recentTransactions: [
    { id: 1, student: "Ama Owusu", amount: 2000, type: "Tuition", date: "2026-04-20", status: "Completed" },
    { id: 2, student: "Akosua Boateng", amount: 2000, type: "Tuition", date: "2026-04-19", status: "Completed" },
    { id: 3, student: "Abena Darko", amount: 1500, type: "Tuition", date: "2026-04-18", status: "Completed" },
    { id: 4, student: "Kweku Asante", amount: 2000, type: "Tuition", date: "2026-04-17", status: "Pending" },
    { id: 5, student: "Efua Quaye", amount: 2000, type: "Tuition", date: "2026-04-16", status: "Completed" },
  ],
};

export const inventoryItems = [
  { id: 1, name: "Textbooks - Mathematics", category: "Books", quantity: 45, minStock: 20, status: "In Stock", lastUpdated: "2026-04-10", value: 2250 },
  { id: 2, name: "Textbooks - English", category: "Books", quantity: 38, minStock: 20, status: "In Stock", lastUpdated: "2026-04-10", value: 1900 },
  { id: 3, name: "Scientific Calculators", category: "Equipment", quantity: 12, minStock: 15, status: "Low Stock", lastUpdated: "2026-04-15", value: 1440 },
  { id: 4, name: "Projectors", category: "Electronics", quantity: 4, minStock: 3, status: "In Stock", lastUpdated: "2026-03-20", value: 8000 },
  { id: 5, name: "Whiteboard Markers", category: "Stationery", quantity: 5, minStock: 10, status: "Low Stock", lastUpdated: "2026-04-20", value: 75 },
  { id: 6, name: "Printer Paper (Reams)", category: "Stationery", quantity: 30, minStock: 15, status: "In Stock", lastUpdated: "2026-04-18", value: 450 },
  { id: 7, name: "Lab Microscopes", category: "Equipment", quantity: 8, minStock: 8, status: "In Stock", lastUpdated: "2026-03-15", value: 12000 },
  { id: 8, name: "Chairs - Student", category: "Furniture", quantity: 180, minStock: 150, status: "In Stock", lastUpdated: "2026-01-10", value: 18000 },
  { id: 9, name: "Desks - Student", category: "Furniture", quantity: 90, minStock: 80, status: "In Stock", lastUpdated: "2026-01-10", value: 13500 },
  { id: 10, name: "First Aid Kits", category: "Health", quantity: 2, minStock: 5, status: "Critical", lastUpdated: "2026-04-01", value: 300 },
];

export const users = [
  { id: 1, name: "Oscar Nyavor", role: "Admin", email: "oscar@edumanage.edu", status: "Active", lastLogin: "2026-04-23", avatar: "ON" },
  { id: 2, name: "Samuel Agyei", role: "Teacher", email: "s.agyei@edumanage.edu", status: "Active", lastLogin: "2026-04-22", avatar: "SA" },
  { id: 3, name: "Grace Asiedu", role: "Teacher", email: "g.asiedu@edumanage.edu", status: "Active", lastLogin: "2026-04-23", avatar: "GA" },
  { id: 4, name: "Daniel Osei", role: "Teacher", email: "d.osei@edumanage.edu", status: "Active", lastLogin: "2026-04-21", avatar: "DO" },
  { id: 5, name: "Patricia Adu", role: "Teacher", email: "p.adu@edumanage.edu", status: "Active", lastLogin: "2026-04-20", avatar: "PA" },
  { id: 6, name: "Kwame Boateng", role: "Accountant", email: "k.boateng@edumanage.edu", status: "Active", lastLogin: "2026-04-22", avatar: "KB" },
  { id: 7, name: "Ama Serwaa", role: "Secretary", email: "a.serwaa@edumanage.edu", status: "Active", lastLogin: "2026-04-23", avatar: "AS" },
  { id: 8, name: "Emmanuel Boadu", role: "Teacher", email: "e.boadu@edumanage.edu", status: "Inactive", lastLogin: "2026-04-10", avatar: "EB" },
];

export const activityFeed = [
  { id: 1, user: "Ama Owusu", action: "submitted assignment", subject: "Mathematics Quiz 3", time: "2 min ago", type: "academic", avatar: "AO" },
  { id: 2, user: "Mr. Samuel Agyei", action: "marked attendance for", subject: "Grade 9A", time: "15 min ago", type: "attendance", avatar: "SA" },
  { id: 3, user: "Kofi Mensah", action: "fee payment received", subject: "GH₵2,000 Tuition", time: "1 hr ago", type: "finance", avatar: "KM" },
  { id: 4, user: "Mrs. Grace Asiedu", action: "posted new announcement", subject: "English Essay Due Friday", time: "2 hrs ago", type: "announcement", avatar: "GA" },
  { id: 5, user: "Akosua Boateng", action: "achieved top score in", subject: "Science Test", time: "3 hrs ago", type: "academic", avatar: "AB" },
  { id: 6, user: "Admin", action: "added new event", subject: "Science Fair 2026", time: "5 hrs ago", type: "event", avatar: "ON" },
  { id: 7, user: "Kweku Asante", action: "was marked absent from", subject: "Grade 11A", time: "6 hrs ago", type: "attendance", avatar: "KA" },
];
