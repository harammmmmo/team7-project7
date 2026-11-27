
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

// 목표 학점 달성에 필요한 이번 학기 평점 계산
function calculateRequiredGPA(
    prevCredits, prevGPA, newCredits, targetGPA
) {
    if (!validateTargetGPA(targetGPA) || newCredits <= 0) {
        return null;
    }

    const totalCredits = prevCredits + newCredits;
    const targetPoints = targetGPA * totalCredits;
    const prevPoints = prevGPA * prevCredits;

    return Math.max(0, (targetPoints - prevPoints) / newCredits);
}
