
const courses = [];

function addCourse() {
    const name = document.getElementById("name").value;
    const credits = Number(document.getElementById("credits").value);
    const grade = document.getElementById("grade").value;

    if (!name || credits <= 0) {
        alert("과목명과 학점을 입력하세요.");
        return;
    }

    courses.push({ name, credits, grade });

    const list = document.getElementById("courseList");
    const item = document.createElement("li");
    item.textContent = `${name} / ${credits}학점 / ${grade}`;
    list.appendChild(item);
}
