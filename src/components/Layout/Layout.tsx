import type { HTMLAttributes, CSSProperties } from 'react';

import classNames from 'classnames';

import styles from './Layout.module.scss';

export type LayoutProps = HTMLAttributes<HTMLDivElement> & {
  columns?: number;
  minItemWidth?: string;
  gap?: number;
};

export type LayoutItemProps = HTMLAttributes<HTMLDivElement> & {
  span?: number;
  rowSpan?: number;
};

type GridStyle = CSSProperties & {
  '--layout-columns'?: number;
  '--layout-min-item-width'?: string;
  '--layout-gap'?: string;
  '--layout-span'?: number;
  '--layout-row-span'?: number;
};

const LayoutGrid = ({
  columns,
  minItemWidth,
  gap = 16,
  className,
  style,
  ...props
}: LayoutProps) => {
  const gridStyle: GridStyle = {
    ...style,
    '--layout-gap': `${gap}px`,
  };

  let modeClassName: string | undefined;

  if (columns !== undefined) {
    modeClassName = styles.Fixed;

    gridStyle['--layout-columns'] = columns;
  } else if (minItemWidth !== undefined) {
    modeClassName = styles.Automatic;

    gridStyle['--layout-min-item-width'] = minItemWidth;
  }

  const gridClassNames = classNames([
    styles.Layout,
    modeClassName,
    className,
  ]);

  return (
    <div
      {...props}
      className={gridClassNames}
      style={gridStyle}
    />
  );
};

const LayoutItem = ({
  span = 1,
  rowSpan = 1,
  className,
  style,
  ...props
}: LayoutItemProps) => {
  const itemStyle: GridStyle = {
    ...style,
    '--layout-span': span,
    '--layout-row-span': rowSpan,
  };

  const itemClassName = classNames([styles.Item, className]);

  return (
    <div
      {...props}
      className={itemClassName}
      style={itemStyle}
    />
  );
};

export const Layout = Object.assign(LayoutGrid, {
  Item: LayoutItem,
});
