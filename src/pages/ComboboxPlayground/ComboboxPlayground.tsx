import { useState } from 'react';

import { Combobox } from '@components';
import { getCountries } from '@utils';

import styles from '@styles/Playground.module.scss';

const countries = getCountries();
const optionSets = {
  all: { label: 'Все страны', options: countries, expression: 'getCountries()' },
  short: { label: 'Пять стран', options: countries.slice(0, 5), expression: 'getCountries().slice(0, 5)' },
  empty: { label: 'Пустой список', options: [], expression: '[]' },
};

const flags = ['isDisabled', 'isLoading', 'isInvalid'] as const;

const initialSettings = {
  isDisabled: false,
  isLoading: false,
  isInvalid: false,
  limit: '',
  dataset: 'all' as keyof typeof optionSets,
};

export const ComboboxPlayground = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [demoKey, setDemoKey] = useState(0);
  const dataset = optionSets[settings.dataset];
  const limit = Number(settings.limit);
  const maxSelected = settings.limit !== '' && Number.isFinite(limit) ? limit : undefined;

  const snippet = [
    '<Combobox',
    `  options={${dataset.expression}}`,
    ...flags.map(flag => `  ${flag}={${settings[flag]}}`),
    `  maxSelected={${maxSelected}}`,
    '/>',
  ].join('\n');

  const reset = () => {
    setSettings(initialSettings);
    setDemoKey(key => key + 1);
  };

  return (
    <main className={styles.Page}>
      <h1>Combobox Playground</h1>

      <div className={styles.Workspace}>
        <section className={styles.Settings} aria-labelledby="combobox-settings">
          <h2 id="combobox-settings">Настройки</h2>

          {flags.map(flag => (
            <label key={flag} className={styles.Checkbox}>
              <input
                type="checkbox"
                checked={settings[flag]}
                onChange={event => setSettings({ ...settings, [flag]: event.target.checked })}
              />
              <code>{flag}</code>
            </label>
          ))}

          <label className={styles.Field}>
            <code>maxSelected</code>
            <input
              type="number"
              min={0}
              step={1}
              value={settings.limit}
              aria-describedby="combobox-limit-hint"
              onChange={event => setSettings({ ...settings, limit: event.target.value })}
            />
          </label>
          <p className={styles.Hint} id="combobox-limit-hint">Пустое поле снимает ограничение</p>

          <label className={styles.Field}>
            <code>options</code>
            <select
              value={settings.dataset}
              onChange={event => setSettings({ ...settings, dataset: event.target.value as keyof typeof optionSets })}
            >
              {Object.entries(optionSets).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <button className={styles.Reset} type="button" onClick={reset}>Сбросить</button>
        </section>

        <div className={styles.Results}>
          <section className={styles.Demo} aria-labelledby="combobox-demo">
            <h2 id="combobox-demo">Демонстрация</h2>
            <p className={styles.Hint}>При смене списка выбор сохраняется. Чипы видны, пока выбранные страны есть в списке</p>
            <Combobox
              key={demoKey}
              options={dataset.options}
              isDisabled={settings.isDisabled}
              isLoading={settings.isLoading}
              isInvalid={settings.isInvalid}
              maxSelected={maxSelected}
            />
          </section>

          <section className={styles.Source} aria-labelledby="combobox-source">
            <h2 id="combobox-source">Пример TSX</h2>
            <pre><code>{snippet}</code></pre>
          </section>
        </div>
      </div>
    </main>
  );
};
