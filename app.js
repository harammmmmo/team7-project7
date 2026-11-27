
const courses = [];

function addCourse() {
    const name = document.getElementById("name").value;
    const credits = Number(document.getElementById("credits").value);
    const grade = document.getElementById("grade").value;

    if (!name || credits <= 0) {
        alert("과목명과 학점을 입력하세요.");
        return;
    }

 const course = { name, credits, grade };
courses.push(course);
updateGPA();
    const list = document.getElementById("courseList");
    const item = document.createElement("li");
   

    item.textContent = `${name} / ${credits}학점 / ${grade} `;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "삭제";

    deleteButton.onclick = function() {
        courses.splice(courses.indexOf(course), 1);
        item.remove();
        updateGPA();
    };

    item.appendChild(deleteButton);
    list.appendChild(item);
    document.getElementById("name").value = "";
document.getElementById("credits").value = "";
}

function updateGPA() {
    const result = calculateGPA(courses);
    document.getElementById("gpa").textContent =
        result.toFixed(2);

    const totalCredits = calculateTotalCredits(courses);
    document.getElementById("totalCredits").textContent =
        totalCredits;

    visualizeGPA(result);
}
