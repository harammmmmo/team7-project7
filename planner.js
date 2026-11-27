
// 4.5 만점 기준 성적별 평점
const GRADE_POINTS = {
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

// 목표 학점 유효성 검사
function validateTargetGPA(targetGPA) {
    if (String(targetGPA ?? "").trim() === "") {
        return false;
    }

    const target = Number(targetGPA);

    return Number.isFinite(target)
        && target >= 0
        && target <= 4.5;
}

// 목표 평점에 맞는 성적 추천
function recommendGrades(courses, requiredGPA) {
    if (!isAchievable(requiredGPA)) {
        return null;
    }

    const grades = Object.keys(GRADE_POINTS);
    const result = courses.map(c => ({
        ...c, grade: "A+"
    }));

    const totalCredits = courses.reduce(
        (sum, c) => sum + Number(c.credits), 0
    );

    let points = totalCredits * 4.5;

    for (let i = 1; i < grades.length; i++) {
        for (const c of result) {
            const loss = (GRADE_POINTS[c.grade]
                - GRADE_POINTS[grades[i]]) * c.credits;

            if (points - loss >= requiredGPA * totalCredits) {
                c.grade = grades[i];
                points -= loss;
            }
        }
    }

    return result;
}

// 목표 평점 달성 가능 여부 확인
function isAchievable(requiredGPA) {
    return Number.isFinite(requiredGPA)
        && requiredGPA >= 0
        && requiredGPA <= 4.5;
}

// 목표 성적 추천 결과 출력
function showRecommendation() {
    const target = document.getElementById("targetGPA").value;

    if (!validateTargetGPA(target) || courses.length === 0) {
        alert("과목과 목표 평점을 입력하세요.");
        return;
    }

    const result = recommendGrades(courses, Number(target));

    document.getElementById("recommendResult").textContent =
        result.map(c => c.name + ": " + c.grade).join(" / ");
}