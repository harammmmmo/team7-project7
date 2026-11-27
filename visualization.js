// 평균 학점 막대그래프 표시
function visualizeGPA(gpa) {
    const bar = document.getElementById("gpa-bar");
    const value = document.getElementById("gpa-value");

    if (!bar || !value) return;

    const score = Number(gpa);

    if (!Number.isFinite(score)) return;

    const percentage = Math.max(0, Math.min(100, score / 4.5 * 100));

    bar.style.width = percentage + "%";
    value.textContent = score.toFixed(2);

    if (score >= 4.0) {
        bar.style.backgroundColor = "#22c55e";
    } else if (score >= 3.0) {
        bar.style.backgroundColor = "#2563eb";
    } else {
        bar.style.backgroundColor = "#f59e0b";
    }
}