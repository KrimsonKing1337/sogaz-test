import { useState } from 'react';

import { Layout } from '@components';

import styles from '@styles/Playground.module.scss';

const modes = {
  default: 'Обычный',
  automatic: 'Автоматический',
  fixed: 'Фиксированные колонки',
};

const unitSpan = { span: 1, rowSpan: 1 };

const initialSettings = {
  mode: 'fixed' as keyof typeof modes,
  columns: 3,
  minItemWidth: 160,
  gap: 12,
  width: 720,
  count: 5,
  selected: 0,
  showGrid: true,
  spans: { 0: { span: 2, rowSpan: 2 } } as Partial<Record<number, typeof unitSpan>>,
};

type RangeFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const RangeField = ({ label, value, min, max, step = 1, unit, disabled, onChange }: RangeFieldProps) => (
  <label className={styles.Range}>
    <span>{label}</span>
    <span aria-hidden="true">{value}{unit}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-valuetext={unit ? `${value}${unit}` : undefined}
      disabled={disabled}
      onChange={event => onChange(event.target.valueAsNumber)}
    />
  </label>
);

export const LayoutPlayground = () => {
  const [settings, setSettings] = useState(initialSettings);
  const { mode, width, gap, count, selected, showGrid, spans } = settings;
  const columns = mode === 'fixed' ? settings.columns : undefined;
  const minItemWidth = mode === 'automatic' ? `${settings.minItemWidth}px` : undefined;
  const isFixed = columns !== undefined;
  const items = Array.from({ length: count }, (_, index) => {
    const name = index === 0 ? 'Основной блок' : `Элемент ${index + 1}`;
    const { span, rowSpan } = isFixed ? (spans[index] ?? unitSpan) : unitSpan;

    return { name, span: Math.min(span, settings.columns), rowSpan };
  });

  const selectedItem = items[selected];
  const savedSpan = spans[selected] ?? unitSpan;
  const setSelectedSpan = (properties: Partial<typeof unitSpan>) => {
    setSettings({
      ...settings,
      spans: { ...spans, [selected]: { ...savedSpan, ...properties } },
    });
  };

  const modeAttribute = [
    columns === undefined ? '' : ` columns={${columns}}`,
    minItemWidth === undefined ? '' : ` minItemWidth="${minItemWidth}"`,
  ].join('');
  const snippet = [
    `<div style={{ inlineSize: ${width}, maxInlineSize: '100%' }}>`,
    `  <Layout${modeAttribute} gap={${gap}}>`,
    ...items.map(({ name, span, rowSpan }) => {
      const horizontal = span > 1 ? ` span={${span}}` : '';
      const vertical = rowSpan > 1 ? ` rowSpan={${rowSpan}}` : '';

      return `    <Layout.Item${horizontal}${vertical}>${name}</Layout.Item>`;
    }),
    '  </Layout>',
    '</div>',
  ].join('\n');

  return (
    <main className={styles.Page}>
      <h1>Layout Playground</h1>

      <div className={styles.Workspace}>
        <section className={styles.Settings} aria-labelledby="layout-settings">
          <h2 id="layout-settings">Настройки</h2>

          <label className={styles.Field}>
            Режим
            <select
              value={mode}
              onChange={event => setSettings({ ...settings, mode: event.target.value as keyof typeof modes })}
            >
              {Object.entries(modes).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <RangeField
            label="columns"
            value={settings.columns}
            min={1}
            max={6}
            disabled={!isFixed}
            onChange={value => setSettings({ ...settings, columns: value })}
          />
          <RangeField
            label="minItemWidth"
            value={settings.minItemWidth}
            min={80}
            max={320}
            step={8}
            unit=" px"
            disabled={minItemWidth === undefined}
            onChange={value => setSettings({ ...settings, minItemWidth: value })}
          />
          <RangeField
            label="gap"
            value={gap}
            min={0}
            max={24}
            unit=" px"
            onChange={value => setSettings({ ...settings, gap: value })}
          />
          <RangeField
            label="Макс. ширина контейнера"
            value={width}
            min={240}
            max={960}
            step={10}
            unit=" px"
            onChange={value => setSettings({ ...settings, width: value })}
          />
          <RangeField
            label="Количество элементов"
            value={count}
            min={1}
            max={10}
            onChange={value => setSettings({ ...settings, count: value, selected: Math.min(selected, value - 1) })}
          />

          <label className={styles.Field}>
            Выбранный элемент
            <select
              value={selected}
              onChange={event => setSettings({ ...settings, selected: Number(event.target.value) })}
            >
              {items.map(({ name }, index) => <option key={name} value={index}>{name}</option>)}
            </select>
          </label>

          <RangeField
            label="span"
            value={selectedItem.span}
            min={1}
            max={settings.columns}
            disabled={!isFixed}
            onChange={span => setSelectedSpan({ span })}
          />
          <RangeField
            label="rowSpan"
            value={selectedItem.rowSpan}
            min={1}
            max={4}
            disabled={!isFixed}
            onChange={rowSpan => setSelectedSpan({ rowSpan })}
          />

          <label className={styles.Checkbox}>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={event => setSettings({ ...settings, showGrid: event.target.checked })}
            />
            Показать сетку
          </label>

          <button className={styles.Reset} type="button" onClick={() => setSettings(initialSettings)}>Сбросить</button>
        </section>

        <div className={styles.Results}>
          <section className={styles.Demo} aria-labelledby="layout-demo">
            <h2 id="layout-demo">Демонстрация</h2>
            {showGrid && <p className={styles.Hint}>
              {isFixed ? 'Пунктир отмечает колонки. Размеры указаны в колонках × строках.' : 'Контуры показывают границы элементов.'}
            </p>}

            <div className={styles.Stage} style={{ inlineSize: width }}>
              {showGrid && isFixed && (
                <div className={styles.Guides} aria-hidden="true" style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  columnGap: gap,
                }}>
                  {Array.from({ length: columns }, (_, index) => <span key={index} />)}
                </div>
              )}

              <Layout className={styles.Grid} columns={columns} minItemWidth={minItemWidth} gap={gap}>
                {items.map(({ name, span, rowSpan }, index) => (
                  <Layout.Item
                    key={name}
                    className={styles.Tile}
                    data-selected={index === selected}
                    data-outline={showGrid}
                    span={span}
                    rowSpan={rowSpan}
                  >
                    <strong>{name}</strong>
                    {showGrid && <span>{span} × {rowSpan}</span>}
                  </Layout.Item>
                ))}
              </Layout>
            </div>
          </section>

          <section className={styles.Source} aria-labelledby="layout-source">
            <h2 id="layout-source">Пример TSX</h2>
            <pre><code>{snippet}</code></pre>
          </section>
        </div>
      </div>
    </main>
  );
};
