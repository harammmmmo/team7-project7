
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
// 현재 성적을 유지하면서 목표 평점에 맞게 성적 향상
function recommendGrades(courses, requiredGPA) {
    if (!isAchievable(requiredGPA) || courses.length === 0) {
        return null;
    }

    const grades = Object.keys(GRADE_POINTS).reverse();
    const result = courses.map(c => ({ ...c }));

    const totalCredits = result.reduce(
        (sum, c) => sum + Number(c.credits), 0
    );

    let points = result.reduce(
        (sum, c) => sum + GRADE_POINTS[c.grade] * c.credits, 0
    );

    while (points < requiredGPA * totalCredits) {
        for (const c of result) {
            const i = grades.indexOf(c.grade);

            if (i < grades.length - 1) {
                points += (GRADE_POINTS[grades[i + 1]]
                    - GRADE_POINTS[c.grade]) * c.credits;

                c.grade = grades[i + 1];
            }

            if (points >= requiredGPA * totalCredits) {
                break;
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