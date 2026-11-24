// 목표 학점 달성 조합 추천 (PRD: F9, F11, F12)
// 서버 없이 브라우저에서 동작합니다. index.html에서 <script src="planner.js">로 불러옵니다.
//
// 입력 형태:
// {
//   maxGPA: 4.5 | 4.3,
//   prevCredits: 60,      // 지금까지 이수한 학점 (신입생은 0)
//   prevGPA: 3.3,         // 지금까지의 누적 평점
//   targetGPA: 3.5,       // 목표 누적 평점
//   courses: [{ name, credits,
//               category: "general"|"majorBasic"|"majorCore"|"majorAdvanced",
//               minGrade?: "B+" }]   // 교양 / 전공기초 / 전공핵심 / 전공심화
// }

// 성적표: 평점에 10을 곱한 정수로 다룹니다 (A+ 4.5 → 45). 소수 오차를 막기 위해서입니다.
const GRADE_SCALES = {
    4.5: [
        ["A+", 45], ["A0", 40],
        ["B+", 35], ["B0", 30],
        ["C+", 25], ["C0", 20],
        ["D+", 15], ["D0", 10],
        ["F", 0]
    ],
    4.3: [
        ["A+", 43], ["A0", 40], ["A-", 37],
        ["B+", 33], ["B0", 30], ["B-", 27],
        ["C+", 23], ["C0", 20], ["C-", 17],
        ["D+", 13], ["D0", 10], ["D-", 7],
        ["F", 0]
    ]
};

// 과목 구분별 설정
// - difficulty: 높을수록 높은 성적의 부담이 큽니다 (교양 < 전공기초 < 전공핵심 < 전공심화)
// - importance: 낮을수록 높은 성적에 투자할 가치가 커서 부담이 작아집니다 (전공일수록 중요)
// - minGrade: 하한선을 따로 정하지 않았을 때의 기본 하한선.
//   전공은 B0 밑으로 추천하지 않아 어렵다는 이유로 버려지지 않게 합니다.
//   과목에 minGrade를 직접 주면 그 값이 우선합니다 (예: "F"로 풀기).
const CATEGORIES = {
    general:       { label: "교양",     difficulty: 1.0, importance: 1.2, minGrade: "C0" },
    majorBasic:    { label: "전공기초", difficulty: 1.3, importance: 1.0, minGrade: "B0" },
    majorCore:     { label: "전공핵심", difficulty: 1.6, importance: 0.8, minGrade: "B0" },
    majorAdvanced: { label: "전공심화", difficulty: 2.0, importance: 0.7, minGrade: "B0" }
};
const DEFAULT_CATEGORY = "general";

// 추천 개수
const MAX_COMBOS = 3;

// 입력이 올바른지 확인합니다. 잘못되면 null을 돌려줍니다.
function normalizeInput(input) {
    if (!input || !Array.isArray(input.courses) || input.courses.length === 0) {
        return null;
    }

    const maxGPA = input.maxGPA === 4.3 ? 4.3 : 4.5;
    const prevCredits = input.prevCredits || 0;
    const prevGPA = prevCredits > 0 ? input.prevGPA : 0;
    const targetGPA = input.targetGPA;

    const isGPA = v => Number.isFinite(v) && v >= 0 && v <= maxGPA;
    if (!isGPA(targetGPA) || !isGPA(prevGPA) ||
        !Number.isInteger(prevCredits) || prevCredits < 0) {
        return null;
    }

    const scale = GRADE_SCALES[maxGPA];
    const gradeNames = scale.map(([name]) => name);
    const courses = [];

    for (const c of input.courses) {
        if (!Number.isInteger(c.credits) || c.credits < 1 || c.credits > 6) {
            return null;
        }
        const category = CATEGORIES[c.category] ? c.category : DEFAULT_CATEGORY;
        const setting = CATEGORIES[category];
        const minGrade = gradeNames.includes(c.minGrade) ? c.minGrade : setting.minGrade;
        courses.push({
            name: String(c.name || "").trim() || `과목 ${courses.length + 1}`,
            credits: c.credits,
            category,
            weight: setting.difficulty * setting.importance * c.credits,
            minPoint: scale.find(([name]) => name === minGrade)[1]
        });
    }

    // 같은 과목명이 있으면 "웹프로그래밍 (2)"처럼 번호를 붙입니다.
    const seen = {};
    for (const c of courses) {
        seen[c.name] = (seen[c.name] || 0) + 1;
        if (seen[c.name] > 1) {
            c.name = `${c.name} (${seen[c.name]})`;
        }
    }

    return { maxGPA, prevCredits, prevGPA, targetGPA, courses, scale };
}

// 이번 학기에 필요한 점수 합계 Σ(평점×10 × 학점)를 정수로 계산합니다.
// 누적 평점은 반올림하지 않은 값으로 판정합니다.
function requiredScore(data, targetGPA) {
    const semCredits = data.courses.reduce((sum, c) => sum + c.credits, 0);
    const total = data.prevCredits + semCredits;
    const target100 = Math.round(targetGPA * 100);
    const prev100 = Math.round(data.prevGPA * 100);
    return Math.ceil((target100 * total - prev100 * data.prevCredits) / 10);
}

// 과목 1개의 부담 = 난이도 × 중요도 × 평점² × 학점
// 평점이 제곱이라 한 과목만 크게 올리기보다 고르게 나누는 조합의 부담이 적습니다.
function burden(course, point) {
    const p = point / 10;
    return course.weight * p * p;
}

// 부담이 적은 순으로 정렬할 때 쓰는 비교 함수. 부담이 같으면 점수가 낮은 쪽(군더더기가 적은 쪽)이 먼저입니다.
function byBurden(a, b) {
    if (Math.abs(a.cost - b.cost) > 1e-9) return a.cost - b.cost;
    return a.score - b.score;
}

// 필요 점수 이상인 조합 중 부담이 가장 적은 조합을 최대 MAX_COMBOS개 찾습니다 (DP).
// 점수마다 부담이 적은 조합 MAX_COMBOS개만 남기므로, 전체 상위 MAX_COMBOS개가 정확히 나옵니다.
function findCombos(data, need) {
    let best = new Map([[0, [{ score: 0, cost: 0, picks: [] }]]]);

    for (const course of data.courses) {
        const next = new Map();
        const options = data.scale.filter(([, point]) => point >= course.minPoint);

        for (const states of best.values()) {
            for (const state of states) {
                for (const [grade, point] of options) {
                    const candidate = {
                        score: state.score + point * course.credits,
                        cost: state.cost + burden(course, point),
                        picks: [...state.picks, grade]
                    };
                    const list = next.get(candidate.score) || [];
                    list.push(candidate);
                    list.sort(byBurden);
                    if (list.length > MAX_COMBOS) list.pop();
                    next.set(candidate.score, list);
                }
            }
        }
        best = next;
    }

    const results = [];
    for (const [score, states] of best) {
        if (score >= need) results.push(...states);
    }
    return results.sort(byBurden).slice(0, MAX_COMBOS);
}

// 추천 설명 한 줄
function makeReason(data, courses) {
    const pointOf = g => data.scale.find(([name]) => name === g)[1];
    const highest = courses.reduce((a, b) => (pointOf(b.grade) > pointOf(a.grade) ? b : a));
    const lowest = courses.reduce((a, b) => (pointOf(b.grade) < pointOf(a.grade) ? b : a));

    if (highest.grade === lowest.grade) {
        return `모든 과목에서 ${highest.grade}를 받으면 됩니다.`;
    }
    const tops = courses.filter(c => c.grade === highest.grade).map(c => c.name);
    const lows = courses.filter(c => c.grade === lowest.grade).map(c => c.name);
    return `${tops.join(", ")}에서 ${highest.grade}를 받으면, ${lows.join(", ")}은(는) ${lowest.grade}까지 받아도 됩니다.`;
}

function toResult(data, found, rank, note) {
    const semCredits = data.courses.reduce((sum, c) => sum + c.credits, 0);
    const total = data.prevCredits + semCredits;
    const courses = data.courses.map((c, i) => ({
        name: c.name,
        credits: c.credits,
        category: c.category,
        grade: found.picks[i]
    }));

    return {
        rank,
        reason: note || makeReason(data, courses),
        semesterGPA: Number((found.score / 10 / semCredits).toFixed(2)),
        cumulativeGPA: Number(((data.prevGPA * data.prevCredits + found.score / 10) / total).toFixed(2)),
        courses
    };
}

// 목표 누적 평점을 달성하는 조합을 부담이 적은 순으로 최대 3개 돌려줍니다.
// 입력이 잘못됐거나 달성이 불가능하면 빈 배열입니다 (안내 문구는 calculator.js 결과로 표시).
function recommendCombos(input) {
    const data = normalizeInput(input);
    if (!data) return [];

    let need = requiredScore(data, data.targetGPA);
    let note = null;

    // 이미 목표를 넘은 경우(전 과목 F여도 달성): 지금 누적 평점을 지키는 조합을 추천합니다.
    if (need <= 0) {
        need = Math.max(0, requiredScore(data, data.prevGPA));
        note = `이미 목표를 달성했습니다. 지금 누적 평점 ${data.prevGPA.toFixed(2)}을(를) 지키는 조합입니다.`;
    }

    return findCombos(data, need).map((found, i) => toResult(data, found, i + 1, note));
}

// 과목별 최소 필요 성적 (F12).
// 나머지 과목이 모두 최고 성적일 때 이 과목에서 받아도 되는 가장 낮은 성적입니다.
// 이 과목이 최고 성적이어도 부족하면 grade는 null입니다.
function minimumGrades(input) {
    const data = normalizeInput(input);
    if (!data) return [];

    const need = requiredScore(data, data.targetGPA);
    const topPoint = data.scale[0][1];
    const top = data.courses.reduce((sum, c) => sum + topPoint * c.credits, 0);

    return data.courses.map(course => {
        const others = top - topPoint * course.credits;
        const lowest = [...data.scale].reverse()
            .find(([, point]) => others + point * course.credits >= need);
        return { name: course.name, credits: course.credits, grade: lowest ? lowest[0] : null };
    });
}

// Node 테스트용 (브라우저에서는 무시됩니다)
if (typeof module !== "undefined") {
    module.exports = { recommendCombos, minimumGrades, GRADE_SCALES, CATEGORIES };
}
