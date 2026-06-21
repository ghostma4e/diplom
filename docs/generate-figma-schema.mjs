import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const W = 1360;
const H = 1060;
const stroke = '#000000';
const fill = '#FFFFFF';
const font = 'Arial, Helvetica, sans-serif';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function rect(x, y, w, h, lines, bold = false) {
  const fs = bold ? 13 : 11;
  const dy = lines.length === 1 ? 5 : -4;
  const tspans = lines
    .map((l, i) => `<tspan x="${x + w / 2}" dy="${i === 0 ? dy : 14}">${esc(l)}</tspan>`)
    .join('');
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
    <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="${font}" font-size="${fs}" font-weight="${bold ? '600' : '400'}" fill="#000">${tspans}</text>
  </g>`;
}

function para(x, y, w, h, lines) {
  const sl = 12;
  const pts = `${x + sl},${y} ${x + w},${y} ${x + w - sl},${y + h} ${x},${y + h}`;
  const dy = lines.length === 1 ? 5 : -4;
  const tspans = lines
    .map((l, i) => `<tspan x="${x + w / 2}" dy="${i === 0 ? dy : 14}">${esc(l)}</tspan>`)
    .join('');
  return `<g>
    <polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
    <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="${font}" font-size="10.5" fill="#000">${tspans}</text>
  </g>`;
}

function hex(x, y, w, h, lines) {
  const pts = `${x + w * 0.18},${y} ${x + w * 0.82},${y} ${x + w},${y + h / 2} ${x + w * 0.82},${y + h} ${x + w * 0.18},${y + h} ${x},${y + h / 2}`;
  const dy = lines.length === 1 ? 5 : -4;
  const tspans = lines
    .map((l, i) => `<tspan x="${x + w / 2}" dy="${i === 0 ? dy : 14}">${esc(l)}</tspan>`)
    .join('');
  return `<g>
    <polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
    <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="${font}" font-size="10.5" fill="#000">${tspans}</text>
  </g>`;
}

function cylinder(x, y, w, h, lines) {
  const ry = 9;
  const cx = x + w / 2;
  const bodyH = h - ry * 2;
  const dy = lines.length <= 2 ? 0 : -8;
  const tspans = lines
    .map((l, i) => `<tspan x="${cx}" dy="${i === 0 ? dy : 12}">${esc(l)}</tspan>`)
    .join('');
  return `<g>
    <path d="M ${x} ${y + ry} L ${x} ${y + h - ry}" fill="none" stroke="${stroke}" stroke-width="1.2"/>
    <path d="M ${x + w} ${y + ry} L ${x + w} ${y + h - ry}" fill="none" stroke="${stroke}" stroke-width="1.2"/>
    <ellipse cx="${cx}" cy="${y + ry}" rx="${w / 2}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
    <rect x="${x}" y="${y + ry}" width="${w}" height="${bodyH}" fill="${fill}" stroke="none"/>
    <ellipse cx="${cx}" cy="${y + h - ry}" rx="${w / 2}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
    <text x="${cx}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="${font}" font-size="9.5" fill="#000">${tspans}</text>
  </g>`;
}

function arrow(x1, y1, x2, y2, dashed = false) {
  const d = dashed ? 'stroke-dasharray="5 4"' : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" marker-end="url(#arr)" ${d}/>`;
}

let g = '';

// === Легенда (как на примере) ===
g += `<text x="48" y="32" font-family="${font}" font-size="13" font-weight="600">Легенда</text>`;
g += rect(48, 42, 82, 30, ['Страница']);
g += para(142, 42, 96, 30, ['Действие']);
g += hex(252, 38, 96, 38, ['Результат']);
g += cylinder(362, 36, 88, 54, ['База данных']);

// === Вход ===
g += rect(280, 100, 800, 40, ['Hackathon Panel 2026'], true);

const Y0 = 175;
const PW = 118;
const PH = 42;

// Col 1 — Главная (cx=95)
g += rect(95 - PW / 2, Y0, PW, PH, ['Страница', 'Главная'], true);
g += arrow(95, Y0 + PH, 95, Y0 + PH + 16);
g += para(95 - 62, Y0 + PH + 16, 124, 36, ['Просмотр', 'статистики']);
g += arrow(95, Y0 + PH + 52, 95, Y0 + PH + 68);
g += hex(95 - 59, Y0 + PH + 68, 118, 44, ['Общая', 'статистика']);
g += arrow(95, Y0 + PH + 112, 95, Y0 + PH + 128);
g += para(95 - 62, Y0 + PH + 128, 124, 36, ['Просмотр', 'рейтинга']);
g += arrow(95, Y0 + PH + 164, 95, Y0 + PH + 180);
g += hex(95 - 59, Y0 + PH + 180, 118, 44, ['Таблица', 'лидеров']);

// Col 2 — Мероприятия (cx=275)
const y2 = Y0;
g += rect(275 - PW / 2, y2, PW, PH, ['Страница', 'Мероприятия'], true);
g += arrow(275, y2 + PH, 275, y2 + PH + 16);
g += hex(275 - 59, y2 + PH + 16, 118, 44, ['Список', 'мероприятий']);
const y2a = y2 + PH + 76;
g += arrow(275, y2a, 275, y2a + 16);
g += para(275 - 68, y2a + 16, 136, 36, ['Принять', 'участие']);
g += arrow(275, y2a + 52, 275, y2a + 68);
g += hex(275 - 59, y2a + 68, 118, 44, ['Участие в', 'мероприятии']);
const y2b = y2a + 128;
g += arrow(275, y2b, 275, y2b + 16);
g += para(275 - 78, y2b + 16, 156, 36, ['Создать / удалить', 'мероприятие (орг.)']);
g += arrow(275, y2b + 52, 330, y2 + PH + 38, true);
const y2c = y2b + 68;
g += arrow(275, y2c, 275, y2c + 16);
g += para(275 - 82, y2c + 16, 164, 36, ['Оценить проект', '(дизайн, техника, задачи)']);
g += arrow(275, y2c + 52, 275, y2c + 68);
g += hex(275 - 59, y2c + 68, 118, 44, ['Оценка', 'жюри']);

// Col 3 — Команда (cx=475) parallel create/join
g += rect(475 - PW / 2, Y0, PW, PH, ['Страница', 'Команда'], true);
g += arrow(475, Y0 + PH, 475, Y0 + PH + 16);
g += para(420, Y0 + PH + 16, 108, 36, ['Создать', 'команду']);
g += para(522, Y0 + PH + 16, 108, 36, ['Ввести', 'инвайт-код']);
g += arrow(474, Y0 + PH + 52, 475, Y0 + PH + 68);
g += arrow(528, Y0 + PH + 52, 475, Y0 + PH + 68);
g += hex(475 - 59, Y0 + PH + 68, 118, 44, ['Моя', 'команда']);
const y3 = Y0 + PH + 128;
g += arrow(475, y3, 475, y3 + 16);
g += para(420, y3 + 16, 108, 36, ['Обновить', 'очки (лидер)']);
g += para(522, y3 + 16, 108, 36, ['Распустить', 'команду']);

// Col 4 — Проекты (cx=695)
g += rect(695 - PW / 2, Y0, PW, PH, ['Страница', 'Проекты'], true);
g += arrow(695, Y0 + PH, 695, Y0 + PH + 16);
g += hex(695 - 59, Y0 + PH + 16, 118, 44, ['Галерея', 'проектов']);
const y4f = Y0 + PH + 76;
g += arrow(695, y4f, 695, y4f + 16);
g += para(695 - 72, y4f + 16, 144, 36, ['Выбор фильтра', 'по технологиям']);
g += arrow(695, y4f + 52, 760, Y0 + PH + 38, true);
const y4a = y4f + 68;
g += arrow(695, y4a, 695, y4a + 16);
g += para(695 - 72, y4a + 16, 144, 36, ['Добавить проект', '(стек, GitHub)']);
g += arrow(695, y4a + 52, 695, y4a + 68);
g += rect(695 - PW / 2, y4a + 68, PW, PH, ['Опубликованный', 'проект']);
const y4b = y4a + 68 + PH + 16;
g += arrow(695, y4b, 695, y4b + 16);
g += para(695 - 68, y4b + 16, 136, 36, ['Привязать к', 'мероприятию']);
g += arrow(695, y4b + 52, 695, y4b + 68);
g += hex(695 - 59, y4b + 68, 118, 44, ['Проект привязан', 'к треку']);

// Col 5 — Профиль (cx=905)
g += rect(905 - PW / 2, Y0, PW, PH, ['Страница', 'Профиль'], true);
g += arrow(905, Y0 + PH, 855, Y0 + PH + 26);
g += arrow(905, Y0 + PH, 955, Y0 + PH + 26);
g += para(795, Y0 + PH + 16, 120, 36, ['Регистрация /', 'авторизация']);
g += para(970, Y0 + PH + 16, 108, 36, ['Без', 'регистрации']);
g += arrow(855, Y0 + PH + 52, 855, Y0 + PH + 68);
g += para(795, Y0 + PH + 68, 120, 36, ['Ввод логина', 'и пароля']);
g += arrow(855, Y0 + PH + 104, 905, Y0 + PH + 120);
g += hex(905 - 59, Y0 + PH + 120, 118, 44, ['Профиль', 'пользователя']);
const y5 = Y0 + PH + 180;
g += arrow(905, y5, 905, y5 + 16);
g += para(905 - 68, y5 + 16, 136, 36, ['Выбор аватара', '(файл / иконка)']);
g += arrow(905, y5 + 52, 905, y5 + 68);
g += hex(905 - 59, y5 + 68, 118, 44, ['Статистика', '(ивенты, проекты)']);
g += arrow(1024, Y0 + PH + 34, 680, 118, true);
g += `<text x="1030" y="118" font-family="${font}" font-size="9" fill="#333">режим зрителя</text>`;

// Col 6 — Мини-игры (cx=1105)
g += rect(1105 - PW / 2, Y0, PW, PH, ['Страница', 'Мини-игры'], true);
g += arrow(1105, Y0 + PH, 1105, Y0 + PH + 16);
g += para(1105 - 82, Y0 + PH + 16, 164, 36, ['Играть', '(Змейка / Память / Реакция)']);
g += arrow(1105, Y0 + PH + 52, 1105, Y0 + PH + 68);
g += hex(1105 - 59, Y0 + PH + 68, 118, 44, ['Лучший', 'результат']);
g += arrow(1105, Y0 + PH + 112, 1105, Y0 + PH + 128);
g += cylinder(1105 - 64, Y0 + PH + 128, 128, 68, ['localStorage', '(рекорды игр)']);

// Entry arrows
[95, 275, 475, 695, 905, 1105].forEach((cx) => {
  g += arrow(cx, 140, cx, Y0);
});

// Cross link participation -> add project
g += arrow(334, y2a + 90, 650, y4a + 18, true);
g += `<text x="470" y="${y2a + 82}" font-family="${font}" font-size="9" fill="#333">нужно участие</text>`;

// DB
const dbY = 860;
g += cylinder(300, dbY, 210, 86, ['Данные аккаунтов и мероприятий', 'users · events · participations']);
g += cylinder(620, dbY, 230, 86, ['Команды, проекты, оценки жюри', 'teams · projects · ratings']);

g += arrow(95, Y0 + PH + 224, 405, dbY);
g += arrow(275, y2a + 90, 405, dbY);
g += arrow(275, y2c + 90, 735, dbY);
g += arrow(475, Y0 + PH + 112, 735, dbY);
g += arrow(695, y4b + 90, 735, dbY);
g += arrow(905, y5 + 90, 405, dbY);

g += `<text x="${W / 2}" y="${H - 20}" text-anchor="middle" font-family="${font}" font-size="13" font-weight="600">Функциональная схема — Hackathon Panel (КВПТК)</text>`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="${stroke}"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  ${g}
</svg>`;

writeFileSync(join(__dirname, 'hackathon-panel-functional-figma.svg'), svg);
console.log('OK: hackathon-panel-functional-figma.svg');
