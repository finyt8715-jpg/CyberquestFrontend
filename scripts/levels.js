'use strict';
const fs = require('node:fs');
const path = require('node:path');

const GAME_META = Object.freeze({
  shoot: {kind:'shield',tag:'Arcade defense',detail:'Firewall round',color:'#2f2342'},
  sorter: {kind:'vault',tag:'Data protection',detail:'Conveyor challenge',color:'#3b2f4d'},
  phish: {kind:'mail',tag:'Threat detection',detail:'Inbox challenge',color:'#332646'},
  desk: {kind:'desk',tag:'Investigation',detail:'3D case files',color:'#382d49'},
  voice: {kind:'voice',tag:'Social engineering',detail:'Caller challenge',color:'#25374d'}
});

function field(value, label, max) {
  if (typeof value !== 'string') throw new Error(label + ' is required.');
  const result = value.trim().replace(/\s+/g, ' ');
  if (!result || result.length > max || /[<>\x00-\x1f]/.test(result)) throw new Error(label + ' must be plain text, 1–' + max + ' characters.');
  return result;
}

function validateLevel(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid level.');
  const game = raw.game;
  if (!Object.hasOwn(GAME_META, game)) throw new Error('Choose an available game format.');
  if (!Array.isArray(raw.questions) || raw.questions.length < 2 || raw.questions.length > 5) throw new Error('Add 2–5 quiz questions.');
  const questions = raw.questions.map((q, index) => {
    const label = 'Question ' + (index + 1);
    if (!q || !Array.isArray(q.options) || q.options.length !== 4) throw new Error(label + ' needs four answers.');
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) throw new Error(label + ' needs a correct answer.');
    const options = q.options.map((v, i) => field(v, label + ' answer ' + (i + 1), 160));
    if (new Set(options.map(v => v.toLowerCase())).size !== 4) throw new Error(label + ' answers must be different.');
    return {prompt:field(q.prompt,label,220),options,correct:q.correct,explanation:field(q.explanation,label + ' explanation',260)};
  });
  const name = field(raw.name, 'Level name', 60);
  const blurb = field(raw.blurb, 'Description', 220);
  return {name,blurb,game,questions,meta:{...GAME_META[game],copy:blurb}};
}

function levelsPath(root) { return path.join(root, 'src', 'extra-levels.json'); }
function readLevels(root) {
  const data = JSON.parse(fs.readFileSync(levelsPath(root), 'utf8'));
  if (!Array.isArray(data) || data.length > 45) throw new Error('Invalid extra-level list.');
  return data.map(validateLevel);
}
module.exports = {GAME_META,validateLevel,levelsPath,readLevels};
