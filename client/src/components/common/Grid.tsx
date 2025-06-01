// src/components/common/Grid.tsx
import { forwardRef } from 'react';

type GridProps = {
  item?: boolean;
  container?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  spacing?: number;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  className?: string;
  children?: React.ReactNode;
};

const getGridClasses = (props: GridProps): string => {
  const classes: string[] = [];

  // Container classes
  if (props.container) {
    classes.push('grid');
    if (props.spacing) {
      classes.push(`gap-${props.spacing * 4}`);
    }
    if (props.direction) {
      switch (props.direction) {
        case 'row':
          classes.push('grid-flow-row');
          break;
        case 'row-reverse':
          classes.push('grid-flow-row-reverse');
          break;
        case 'column':
          classes.push('grid-flow-col');
          break;
        case 'column-reverse':
          classes.push('grid-flow-col-reverse');
          break;
      }
    }
    if (props.justifyContent) {
      switch (props.justifyContent) {
        case 'flex-start':
          classes.push('justify-start');
          break;
        case 'center':
          classes.push('justify-center');
          break;
        case 'flex-end':
          classes.push('justify-end');
          break;
        case 'space-between':
          classes.push('justify-between');
          break;
        case 'space-around':
          classes.push('justify-around');
          break;
        case 'space-evenly':
          classes.push('justify-evenly');
          break;
      }
    }
    if (props.alignItems) {
      switch (props.alignItems) {
        case 'flex-start':
          classes.push('items-start');
          break;
        case 'center':
          classes.push('items-center');
          break;
        case 'flex-end':
          classes.push('items-end');
          break;
        case 'stretch':
          classes.push('items-stretch');
          break;
        case 'baseline':
          classes.push('items-baseline');
          break;
      }
    }
  }

  // Item classes
  if (props.item) {
    if (props.xs) {
      const size = typeof props.xs === 'number' ? props.xs : 12;
      classes.push(`col-span-${size}`);
    }
    if (props.sm) {
      const size = typeof props.sm === 'number' ? props.sm : 12;
      classes.push(`sm:col-span-${size}`);
    }
    if (props.md) {
      const size = typeof props.md === 'number' ? props.md : 12;
      classes.push(`md:col-span-${size}`);
    }
    if (props.lg) {
      const size = typeof props.lg === 'number' ? props.lg : 12;
      classes.push(`lg:col-span-${size}`);
    }
    if (props.xl) {
      const size = typeof props.xl === 'number' ? props.xl : 12;
      classes.push(`xl:col-span-${size}`);
    }
  }

  // Add custom classes
  if (props.className) {
    classes.push(props.className);
  }

  return classes.join(' ');
};

const Grid = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const { children, ...rest } = props;
  const classes = getGridClasses(props);

  return (
    <div ref={ref} className={classes} {...rest}>
      {children}
    </div>
  );
});

export { Grid };
export default Grid;
