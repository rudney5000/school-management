import { describe, expect, it } from 'vitest';
import { DocumentError, interpolate, numberToWords, parseVariables } from '../src';

const payload = {
  student: { fullName: 'Marie Kabila', birthDate: '2011-03-12', nickname: null },
  amount: 150000,
  school: { name: 'Saint-Joseph' },
};

describe('parseVariables', () => {
  it('reads the path and the formatters with their argument', () => {
    expect(
      parseVariables('Né le {{ student.birthDate | date }}, {{mention|default:— : —}}'),
    ).toEqual([
      {
        raw: '{{ student.birthDate | date }}',
        path: 'student.birthDate',
        formatters: [{ name: 'date' }],
      },
      {
        raw: '{{mention|default:— : —}}',
        path: 'mention',
        formatters: [{ name: 'default', arg: '— : —' }],
      },
    ]);
  });
});

describe('interpolate', () => {
  it('replaces paths and applies formatters in order', () => {
    expect(interpolate('{{student.fullName}}, née le {{student.birthDate|date}}', payload)).toBe(
      'Marie Kabila, née le 12/03/2011',
    );
    expect(interpolate('{{school.name|upper}}', payload)).toBe('SAINT-JOSEPH');
  });

  it('formats money with grouped thousands and a currency', () => {
    expect(interpolate('{{amount|money}}', payload)).toBe('150 000 FC');
    expect(interpolate('{{amount|money:USD}}', payload)).toBe('150 000 USD');
  });

  it('keeps at most two decimals, without trailing zeros', () => {
    expect(
      interpolate('{{a|number}} {{b|number}} {{c|number}}', { a: 74.5, b: 1234.567, c: 12 }),
    ).toBe('74,5 1 234,57 12');
  });

  it('prints null as empty, or as the default', () => {
    expect(interpolate('[{{student.nickname}}]', payload)).toBe('[]');
    expect(interpolate('{{student.nickname|date|default:—}}', payload)).toBe('—');
  });

  it('fails on a path that does not exist instead of printing a blank', () => {
    expect(() => interpolate('{{student.lastName}}', payload)).toThrow(DocumentError);
    expect(() => interpolate('{{amount|monney}}', payload)).toThrowError(
      /Unknown formatter \|monney/,
    );
  });

  it('refuses a formatter applied to the wrong kind of value', () => {
    expect(() => interpolate('{{student.fullName|money}}', payload)).toThrowError(
      /expects a number/,
    );
  });
});

describe('numberToWords', () => {
  it.each([
    [0, 'zéro'],
    [21, 'vingt et un'],
    [71, 'soixante et onze'],
    [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'],
    [99, 'quatre-vingt-dix-neuf'],
    [200, 'deux cents'],
    [201, 'deux cent un'],
    [1000, 'mille'],
    [80000, 'quatre-vingt mille'],
    [150000, 'cent cinquante mille'],
    [200000, 'deux cent mille'],
    [1_000_000, 'un million'],
    [2_500_000, 'deux millions cinq cent mille'],
    [12.5, 'douze virgule cinquante'],
  ])('writes %s in French', (n, words) => {
    expect(numberToWords(n, 'fr')).toBe(words);
  });

  it('writes English', () => {
    expect(numberToWords(150_021, 'en')).toBe('one hundred fifty thousand twenty-one');
  });
});
