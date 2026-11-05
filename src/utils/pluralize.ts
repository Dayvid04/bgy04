export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${new Intl.PluralRules('en').select(count) === 'one' ? singular : plural}`;
}