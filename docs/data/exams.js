// Static exam catalog shared by the exam, dashboard, and report pages.
const exams = [
    {
        id: "exam-01",
        examName: "CS 218 Final Exam",
        examDate: "2026-07-10",
        examTimes: ["09:00", "11:00"],
        examType: "Final",
        examCapacity: 20,
        examCount: 8,

        facultyId: "faculty-01",
        locationId: "location-01",

        faculty: {
            id: "faculty-01",
            firstName: "Karen",
            lastName: "Anderson"
        },

        location: {
            id: "location-01",
            campus: "West Campus",
            roomNumber: "Room 101"
        }
    },
    {
        id: "exam-02",
        examName: "CS 219 Final Exam",
        examDate: "2026-07-12",
        examTimes: ["10:00", "12:00"],
        examType: "Midterm",
        examCapacity: 27,
        examCount: 12,

        facultyId: "faculty-02",
        locationId: "location-02",

        faculty: {
            id: "faculty-02",
            firstName: "Albert",
            lastName: "Einstein"
        },

        location: {
            id: "location-02",
            campus: "North Campus",
            roomNumber: "Room 202"
        }
    },
    {
        id: "exam-03",
        examName: "CIT 260 Final Exam",
        examDate: "2026-07-10",
        examTimes: ["13:00", "15:00"],
        examType: "Final",
        examCapacity: 23,
        examCount: 17,

        facultyId: "faculty-03",
        locationId: "location-03",

        faculty: {
            id: "faculty-03",
            firstName: "Linus",
            lastName: "Torvalds"
        },

        location: {
            id: "location-03",
            campus: "South Campus",
            roomNumber: "Room 303"
        }
    }
];
