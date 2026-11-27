
const grades = {
    "A+": 4.5,
    "A0": 4.0,
    "B+": 3.5,
    "B0": 3.0,
    "C+": 2.5,
    "C0": 2.0,
    "D+": 1.5,
    "D0": 1.0,
    "F": 0
};

function calculateGPA(courses) {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
        totalPoints += grades[course.grade] * course.credits;
        totalCredits += course.credits;
    }

    return totalCredits === 0 ? 0 :
        Number((totalPoints / totalCredits).toFixed(2));
}

const testCourses = [
    { name: "물리학", credits: 3, grade: "A+" },
    { name: "화학", credits: 3, grade: "A0" },
    { name: "미적분학", credits: 2, grade: "B+" }
];

console.log(calculateGPA(testCourses));
