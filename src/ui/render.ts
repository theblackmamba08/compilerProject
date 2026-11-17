import type { Analysis } from '../core/analyze';
import { END, EPSILON } from '../core/types';
import type { ParseStep, Production } from '../core/types';
import type { Messages } from './i18n';

type Child = Node | string;

/** Crée un élément ; le texte passe toujours par des nœuds texte, jamais par innerHTML. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}

export const symbols = (list: readonly string[]): string => (list.length === 0 ? EPSILON : list.join(' '));
export const rule = (p: Production): string => `${p.lhs} → ${symbols(p.rhs)}`;
const code = (text: string) => el('code', { class: 'sym' }, text);
const cellKey = (nonTerminal: string, terminal: string) => `${nonTerminal}|${terminal}`;

function section(id: string, title: string, ...children: Child[]): HTMLElement {
  return el('section', { class: 'block', 'aria-labelledby': id }, el('h2', { id }, title), ...children);
}

/** Conteneur défilant accessible au clavier pour les tableaux larges. */
function scroller(label: string, table: HTMLTableElement): HTMLElement {
  return el('div', { class: 'scroller', role: 'region', 'aria-label': label, tabindex: '0' }, table);
}

export function renderReport(analysis: Analysis, t: Messages): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const { table, leftRecursive, parse } = analysis;

  if (leftRecursive.length > 0) {
    fragment.append(el('p', { class: 'notice notice--warn' }, t.leftRecursion(leftRecursive.join(', '))));
  }
  if (table.conflicts.length > 0) {
    fragment.append(
      section(
        'conflicts-title',
        t.conflictsTitle,
        el(
          'ul',
          { class: 'conflicts' },
          ...table.conflicts.map((c) =>
            el(
              'li',
              {},
              t.conflict(c.nonTerminal, c.terminal),
              ' ',
              ...c.productions.flatMap((p, i) => (i === 0 ? [code(rule(p))] : [', ', code(rule(p))])),
            ),
          ),
        ),
      ),
    );
  }

  if (parse.status !== 'notLL1') {
    fragment.append(renderDerivation(parse.derivation, t), renderTrace(parse.steps, t));
  }
  fragment.append(renderSets(analysis, t), renderTable(analysis, t));
  return fragment;
}

function renderDerivation(derivation: readonly (readonly string[])[], t: Messages): HTMLElement {
  if (derivation.length === 0) return section('derivation-title', t.derivationTitle, el('p', {}, t.derivationEmpty));
  const list = el('ol', { class: 'derivation' });
  derivation.forEach((form, i) => {
    list.append(el('li', {}, i === 0 ? '' : el('span', { class: 'derives', 'aria-hidden': 'true' }, '⇒ '), code(symbols(form))));
  });
  return section('derivation-title', t.derivationTitle, list);
}

function actionText(step: ParseStep, t: Messages): string {
  switch (step.action.kind) {
    case 'expand':
      return t.actionExpand(rule(step.action.production));
    case 'match':
      return t.actionMatch(step.action.terminal);
    case 'accept':
      return t.actionAccept;
    case 'error':
      return t.actionError;
  }
}

function renderTrace(steps: readonly ParseStep[], t: Messages): HTMLElement {
  const body = el('tbody');
  steps.forEach((step, i) => {
    const attrs: Record<string, string> = { class: `trace__row trace__row--${step.action.kind}` };
    if (step.action.kind === 'expand') {
      attrs['data-cell'] = cellKey(step.action.production.lhs, step.input[0] ?? END);
      attrs.tabindex = '0';
    }
    body.append(
      el(
        'tr',
        attrs,
        el('td', { class: 'num' }, String(i + 1)),
        el('td', {}, code(step.stack.join(' '))),
        el('td', {}, code(step.input.join(' '))),
        el('td', {}, actionText(step, t)),
      ),
    );
  });
  const head = el(
    'thead',
    {},
    el(
      'tr',
      {},
      el('th', { scope: 'col' }, t.colStep),
      el('th', { scope: 'col' }, t.colStack),
      el('th', { scope: 'col' }, t.colInput),
      el('th', { scope: 'col' }, t.colAction),
    ),
  );
  return section(
    'trace-title',
    t.traceTitle,
    el('p', { class: 'help' }, t.traceHelp),
    scroller(t.traceTitle, el('table', { class: 'grid trace' }, head, body)),
  );
}

function renderSets({ grammar, sets }: Analysis, t: Messages): HTMLElement {
  const order = (set: ReadonlySet<string> | undefined) => {
    const rank = (s: string) => (s === EPSILON || s === END ? 1 : 0);
    return [...(set ?? [])].sort((a, b) => rank(a) - rank(b) || grammar.terminals.indexOf(a) - grammar.terminals.indexOf(b));
  };
  const asSet = (list: string[]) => `{ ${list.join(', ')} }`;
  const body = el(
    'tbody',
    {},
    ...grammar.nonTerminals.map((a) =>
      el(
        'tr',
        {},
        el('th', { scope: 'row' }, code(a)),
        el('td', {}, code(asSet(order(sets.first.get(a))))),
        el('td', {}, code(asSet(order(sets.follow.get(a))))),
      ),
    ),
  );
  const head = el(
    'thead',
    {},
    el(
      'tr',
      {},
      el('th', { scope: 'col' }, t.colNonTerminal),
      el('th', { scope: 'col' }, t.colFirst),
      el('th', { scope: 'col' }, t.colFollow),
    ),
  );
  return section('sets-title', t.setsTitle, scroller(t.setsTitle, el('table', { class: 'grid sets' }, head, body)));
}

function renderTable({ grammar, table }: Analysis, t: Messages): HTMLElement {
  const head = el(
    'thead',
    {},
    el('tr', {}, el('td', {}), ...table.columns.map((c) => el('th', { scope: 'col' }, code(c)))),
  );
  const body = el('tbody');
  for (const a of grammar.nonTerminals) {
    const row = el('tr', {}, el('th', { scope: 'row' }, code(a)));
    for (const c of table.columns) {
      const productions = table.cells.get(a)?.get(c) ?? [];
      const td = el('td', { 'data-cell': cellKey(a, c) });
      if (productions.length > 1) td.classList.add('is-conflict');
      productions.forEach((p, i) => {
        if (i > 0) td.append(el('br'));
        td.append(code(rule(p)));
      });
      row.append(td);
    }
    body.append(row);
  }
  return section(
    'table-title',
    t.tableTitle,
    el('p', { class: 'help' }, t.tableHelp),
    scroller(t.tableTitle, el('table', { class: 'grid ll1' }, el('caption', { class: 'visually-hidden' }, t.tableCaption), head, body)),
  );
}
