/**
 * Numbers written in words, for amounts on receipts ("arrêté la présente
 * somme à…"). French follows the traditional spelling: "vingt et un",
 * "quatre-vingts", "deux cents", "deux cent mille", "deux millions".
 */
export type WordsLocale = 'fr' | 'en';

// prettier-ignore
const FR_UNITS = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
];
const FR_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/**
 * `plural` is false when the number is followed by "mille": "quatre-vingt mille"
 * and "deux cent mille" lose their final s, "quatre-vingts" and "deux cents" keep it.
 */
function frBelow100(n: number, plural: boolean): string {
  if (n < 20) return FR_UNITS[n]!;
  const tens = Math.floor(n / 10);
  const unit = n % 10;
  if (tens === 7 || tens === 9) {
    const base = tens === 7 ? 'soixante' : 'quatre-vingt';
    return tens === 7 && unit === 1 ? 'soixante et onze' : `${base}-${FR_UNITS[10 + unit]}`;
  }
  if (tens === 8) {
    if (unit === 0) return plural ? 'quatre-vingts' : 'quatre-vingt';
    return `quatre-vingt-${FR_UNITS[unit]}`;
  }
  if (unit === 0) return FR_TENS[tens]!;
  if (unit === 1) return `${FR_TENS[tens]} et un`;
  return `${FR_TENS[tens]}-${FR_UNITS[unit]}`;
}

function frBelow1000(n: number, plural: boolean): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds === 1) parts.push('cent');
  if (hundreds > 1) parts.push(`${FR_UNITS[hundreds]} cent${rest === 0 && plural ? 's' : ''}`);
  if (rest > 0 || hundreds === 0) parts.push(frBelow100(rest, plural));
  return parts.join(' ');
}

function frInteger(n: number): string {
  if (n === 0) return 'zéro';
  const parts: string[] = [];
  const scales: Array<[number, string]> = [
    [1e9, 'milliard'],
    [1e6, 'million'],
  ];
  let rest = n;
  for (const [size, name] of scales) {
    const count = Math.floor(rest / size);
    rest %= size;
    if (count > 0) parts.push(`${frBelow1000(count, true)} ${name}${count > 1 ? 's' : ''}`);
  }
  const thousands = Math.floor(rest / 1000);
  rest %= 1000;
  if (thousands === 1) parts.push('mille');
  if (thousands > 1) parts.push(`${frBelow1000(thousands, false)} mille`);
  if (rest > 0) parts.push(frBelow1000(rest, true));
  return parts.join(' ');
}

// prettier-ignore
const EN_UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const EN_TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

function enBelow1000(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds > 0) parts.push(`${EN_UNITS[hundreds]} hundred`);
  if (rest > 0 || hundreds === 0) {
    const tens = Math.floor(rest / 10);
    const unit = rest % 10;
    parts.push(
      rest < 20
        ? EN_UNITS[rest]!
        : unit === 0
          ? EN_TENS[tens]!
          : `${EN_TENS[tens]}-${EN_UNITS[unit]}`,
    );
  }
  return parts.join(' ');
}

function enInteger(n: number): string {
  if (n === 0) return 'zero';
  const parts: string[] = [];
  const scales: Array<[number, string]> = [
    [1e9, 'billion'],
    [1e6, 'million'],
    [1e3, 'thousand'],
  ];
  let rest = n;
  for (const [size, name] of scales) {
    const count = Math.floor(rest / size);
    rest %= size;
    if (count > 0) parts.push(`${enBelow1000(count)} ${name}`);
  }
  if (rest > 0) parts.push(enBelow1000(rest));
  return parts.join(' ');
}

const MAX = 999_999_999_999;

/** Integers up to 999 999 999 999; decimals are read as a second number ("virgule cinquante"). */
export function numberToWords(value: number, locale: WordsLocale): string {
  if (!Number.isFinite(value) || Math.abs(value) > MAX) {
    throw new RangeError(`Cannot write ${value} in words`);
  }
  const integer = locale === 'fr' ? frInteger : enInteger;
  const [intPart, decPart] = Math.abs(value).toFixed(2).split('.');
  let words = integer(Number(intPart));
  if (Number(decPart) > 0) {
    words += `${locale === 'fr' ? ' virgule ' : ' point '}${integer(Number(decPart))}`;
  }
  return value < 0 ? `${locale === 'fr' ? 'moins' : 'minus'} ${words}` : words;
}
