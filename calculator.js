const gradePoints = {
    "A+": 4.5,
    "A0": 4.0,
    "B+": 3.5,
    "B0": 3.0,
    "C+": 2.5,
    "C0": 2.0,
    "D+": 1.5,
    "D0": 1.0,
    "F": 0.0
};

function getGradePoint(grade) {
    return gradePoints[grade];
}

function calculateGPA(courses) {
    if (!Array.isArray(courses)) {
        return 0;
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
        if (!validateCourse(course)) {
            continue;
        }

        totalPoints += getGradePoint(course.grade) * course.credits;
        totalCredits += Number(course.credits);
    }

    return totalCredits === 0 ? 0 :
        Number((totalPoints / totalCredits).toFixed(2));
}

function calculateTotalCredits(courses) {
    if (!Array.isArray(courses)) {
        return 0;
    }

    let totalCredits = 0;

    for (const course of courses) {
        if (!validateCourse(course)) {
            continue;
        }

        totalCredits += Number(course.credits);
    }

    return totalCredits;
}

function validateCourse(course) {
    if (!course || typeof course !== "object") {
        return false;
    }

    const credits = Number(course.credits);

    return Number.isFinite(credits)
        && credits > 0
        && Object.prototype.hasOwnProperty.call(
            gradePoints, course.grade
        );
}