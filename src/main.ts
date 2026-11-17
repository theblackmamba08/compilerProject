import './style.css';
import { analyze } from './core/analyze';
import { parseGrammar } from './core/grammar';
import { END } from './core/types';
import { EXAMPLES } from './ui/examples';
import { initialLang, messages, rememberLang } from './ui/i18n';
import type { Lang } from './ui/i18n';
import { el, renderReport, symbols } from './ui/render';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const form = $<HTMLFormElement>('form');
const grammarInput = $<HTMLTextAreaElement>('grammar');
const wordInput = $<HTMLInputElement>('word');
const exampleSelect = $<HTMLSelectElement>('example');
const startSelect = $<HTMLSelectElement>('start');
const grammarErrors = $<HTMLUListElement>('grammar-errors');
const verdict = $<HTMLParagraphElement>('verdict');
const report = $<HTMLDivElement>('report');
const langSwitch = $<HTMLButtonElement>('lang-switch');

let lang: Lang = initialLang();

function applyStaticTexts(): void {
  const t = messages[lang];
  document.documentElement.lang = lang;
  document.title = t.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.description);
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n as keyof typeof t;
    const value = t[key];
    if (typeof value === 'string') node.textContent = value;
  });
  const other: Lang = lang === 'fr' ? 'en' : 'fr';
  langSwitch.textContent = t.switchLang;
  langSwitch.lang = other;
  langSwitch.setAttribute('aria-label', t.switchLangLabel);

  const selected = exampleSelect.value;
  exampleSelect.replaceChildren(
    el('option', { value: '' }, t.exampleNone),
    ...EXAMPLES.map((ex) => el('option', { value: ex.id }, t.examples[ex.id])),
  );
  exampleSelect.value = selected;
}

function refreshStartOptions(): void {
  const read = parseGrammar(grammarInput.value);
  const previous = startSelect.value;
  if (!read.ok) {
    startSelect.disabled = true;
    return;
  }
  const options = read.grammar.nonTerminals;
  startSelect.disabled = false;
  startSelect.replaceChildren(...options.map((a) => el('option', { value: a }, a)));
  startSelect.value = options.includes(previous) ? previous : read.grammar.start;
}

function update(): void {
  const t = messages[lang];
  refreshStartOptions();
  const result = analyze(grammarInput.value, wordInput.value, startSelect.disabled ? undefined : startSelect.value);
  grammarErrors.replaceChildren();
  report.replaceChildren();
  verdict.className = 'verdict';

  if (!result.ok) {
    grammarInput.setAttribute('aria-invalid', 'true');
    grammarErrors.append(...result.errors.map((e) => el('li', {}, t.grammarErrors[e.code](e))));
    verdict.classList.add('verdict--error');
    verdict.textContent = t.verdictGrammarError;
    return;
  }
  grammarInput.removeAttribute('aria-invalid');

  const { parse, word } = result;
  const [open, close] = lang === 'fr' ? ['«\u00a0', '\u00a0»'] : ['“', '”'];
  const shown = word.length === 0 ? t.emptyWord : `${open}${symbols(word)}${close}`;
  if (parse.status === 'accepted') {
    verdict.classList.add('verdict--ok');
    verdict.textContent = t.verdictAccepted(shown);
  } else if (parse.status === 'notLL1') {
    verdict.classList.add('verdict--warn');
    verdict.textContent = t.verdictNotLL1;
  } else {
    verdict.classList.add('verdict--error');
    verdict.textContent = t.verdictRejected(shown);
    if (parse.error) {
      const name = (s: string) => (s === END ? t.endOfWord : s);
      const expected = parse.error.expected.length > 0 ? parse.error.expected.map(name).join(t.or) : t.nothing;
      const detail =
        parse.error.found === END
          ? t.errorEarlyEnd(expected)
          : t.errorAt(parse.error.position, parse.error.found, expected);
      verdict.append(el('span', { class: 'verdict__detail' }, detail));
    }
  }
  report.append(renderReport(result, t));
}

let timer: number | undefined;
const scheduleUpdate = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(update, 200);
};

function loadExample(id: string): void {
  const example = EXAMPLES.find((ex) => ex.id === id);
  if (!example) return;
  grammarInput.value = example.grammar;
  wordInput.value = example.word;
  startSelect.replaceChildren();
  update();
}

// Survol ou focus d'une ligne de la trace : on éclaire la case de la table utilisée.
function highlightCell(key: string | undefined): void {
  report.querySelectorAll('.is-active').forEach((node) => node.classList.remove('is-active'));
  if (!key) return;
  report.querySelectorAll(`.ll1 td[data-cell="${CSS.escape(key)}"]`).forEach((node) => node.classList.add('is-active'));
}
const rowKey = (target: EventTarget | null) =>
  target instanceof Element ? target.closest<HTMLElement>('tr[data-cell]')?.dataset.cell : undefined;
report.addEventListener('mouseover', (event) => highlightCell(rowKey(event.target)));
report.addEventListener('focusin', (event) => highlightCell(rowKey(event.target)));
report.addEventListener('mouseleave', () => highlightCell(undefined));

form.addEventListener('submit', (event) => event.preventDefault());
grammarInput.addEventListener('input', () => {
  exampleSelect.value = '';
  scheduleUpdate();
});
wordInput.addEventListener('input', scheduleUpdate);
startSelect.addEventListener('change', update);
exampleSelect.addEventListener('change', () => loadExample(exampleSelect.value));

document.querySelectorAll<HTMLButtonElement>('[data-insert]').forEach((button) => {
  button.addEventListener('click', () => {
    const text = button.dataset.insert ?? '';
    const { selectionStart, selectionEnd, value } = grammarInput;
    grammarInput.value = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
    grammarInput.focus();
    grammarInput.setSelectionRange(selectionStart + text.length, selectionStart + text.length);
    grammarInput.dispatchEvent(new Event('input'));
  });
});

langSwitch.addEventListener('click', () => {
  lang = lang === 'fr' ? 'en' : 'fr';
  rememberLang(lang);
  applyStaticTexts();
  update();
});

applyStaticTexts();
exampleSelect.value = 'expressions';
loadExample('expressions');
