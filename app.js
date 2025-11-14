const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;
let forcedTarget = null;
let lastPercentClick = 0;
let lastVolumeUpClick = 0;

function format(n) {
  if (n === "Error") return n;
  if (!isFinite(Number(n))) return "Error";
  const [int, dec] = String(n).split(".");
  const f = Number(int).toLocaleString(undefined);
  return dec ? `${f}.${dec}` : f;
}

function setCurrent(val) {
  current = val;
  resultEl.textContent = format(current);
  expressionEl.textContent =
    previous !== null && operator
      ? `${format(previous)} ${operator} ${current !== "" ? current : ""}`.trim()
      : "";
}

function inputDigit(d) {
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  if (current === "0") current = d;
  else current += d;
  setCurrent(current);
}

function inputDot() {
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  if (!current.includes(".")) {
    current += current === "" ? "0." : ".";
    setCurrent(current);
  }
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  setCurrent(current);
}

function invertSign() {
  if (current === "0") return;
  current = String(-Number(current));
  setCurrent(current);
}

function percent() {
  current = String(Number(current) / 100);
  setCurrent(current);
}

function setOperator(op) {
  if (operator && previous !== null && current !== "") evaluate();
  previous = Number(current);
  operator = op;
  current = "";
  setCurrent(current);
}

function evaluate() {
  if (operator === null || current === "") return;
  const a = previous;
  const b = Number(current);
  let r = 0;
  if (operator === "+") r = a + b;
  else if (operator === "−") r = a - b;
  else if (operator === "×") r = a * b;
  else if (operator === "÷") r = b === 0 ? "Error" : a / b;
  previous = null;
  operator = null;
  current = String(r);
  setCurrent(current);
  justEvaluated = true;
}

navigator.serviceWorker.register('/sw.js')
  .then(registration => {
    console.log('SW scope:', registration.scope);
  });

document.querySelectorAll("[data-num]").forEach(b =>
  b.addEventListener("click", () => inputDigit(b.getAttribute("data-num")))
);
document.querySelectorAll("[data-op]").forEach(b =>
  b.addEventListener("click", () => setOperator(b.getAttribute("data-op")))
);
document.querySelectorAll("[data-dot]").forEach(b =>
  b.addEventListener("click", () => inputDot())
);
document.querySelectorAll("[data-action]").forEach(b =>
  b.addEventListener("click", () => {
    const a = b.getAttribute("data-action");
    if (a === "clear") clearAll();
    else if (a === "invert") invertSign();
    else if (a === "equals") evaluate();
  })
);

const percentBtn = document.querySelector('[data-action="percent"]');
if (percentBtn) {
  percentBtn.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastPercentClick < 400) {
      const input = window.prompt('What number do you want to force ?');
      if (input !== null && input.trim() !== '') {
        const num = Number(String(input).replace(',', '.'));
        if (!isNaN(num) && isFinite(num)) forcedTarget = num;
      }
      lastPercentClick = 0;
      return;
    }
    lastPercentClick = now;
    percent();
  });
}

const topButtons = document.querySelectorAll('.top-btn');
const volumeUpEmu = topButtons && topButtons[1];
if (volumeUpEmu) {
  volumeUpEmu.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastVolumeUpClick < 400) {
      if (operator === '−' && previous !== null && forcedTarget !== null) {
        const needed = previous - forcedTarget;
        current = String(needed);
        setCurrent(current);
      }
      lastVolumeUpClick = 0;
      return;
    }
    lastVolumeUpClick = now;
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === '+') {
    const now = Date.now();
    if (now - lastVolumeUpClick < 400) {
      if (operator === '−' && previous !== null && forcedTarget !== null) {
        const needed = previous - forcedTarget;
        current = String(needed);
        setCurrent(current);
      }
      lastVolumeUpClick = 0;
    } else {
      lastVolumeUpClick = now;
    }
  }
});


setCurrent(current);
