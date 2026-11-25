import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,

  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import classNames from 'classnames';

import CloseIcon from '@assets/icons/i-close.svg';
import ArrowDownIcon from '@assets/icons/i-arrow-down.svg';
import CheckIcon from '@assets/icons/i-check.svg';
import LoadingIcon from '@assets/icons/i-loading.svg';

import styles from './Combobox.module.scss';

type ComboboxOption = {
  id: string;
  value: string;
  label: string;
};

export type ComboboxProps = {
  isLoading?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  maxSelected?: number;
  options: ComboboxOption[];
};

const normalizeSearch = (value: string) => {
  return value.trim().toLowerCase().replaceAll('ё', 'е');
};

export const Combobox = ({
  isLoading = false,
  isDisabled = false,
  isInvalid = false,
  maxSelected,
  options,
}: ComboboxProps) => {
  const [isOpenRequested, setIsOpenRequested] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [activeOptionValue, setActiveOptionValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const chipsAndInputRef = useRef<HTMLDivElement>(null);
  const listBoxRef = useRef<HTMLUListElement>(null);
  const chipButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  const inputId = useId();
  const labelId = useId();
  const listBoxId = useId();
  const errorId = useId();

  const isUnavailable = isLoading || isDisabled;
  const isOpened = isOpenRequested && !isUnavailable;

  let selectionLimit = Infinity;

  if (maxSelected !== undefined) {
    selectionLimit = Math.max(0, Math.floor(maxSelected));
  }

  const isAtSelectionLimit = selectedValues.length >= selectionLimit;

  const selectedSet = useMemo(() => {
    return new Set(selectedValues);
  }, [selectedValues]);

  const optionsByValue = useMemo(() => {
    const entries = options.map(optionCur => {
      return [optionCur.value, optionCur] as const;
    });

    return new Map(entries);
  }, [options]);

  const localOptions = useMemo(() => {
    const query = normalizeSearch(inputValue);

    if (!query) {
      return options;
    }

    return options.filter(optionCur => {
      const label = normalizeSearch(optionCur.label);

      return label.includes(query);
    });
  }, [options, inputValue]);

  let activeOptionIndex = -1;
  let activeOption: ComboboxOption | undefined;

  if (isOpened && localOptions.length > 0) {
    activeOptionIndex = localOptions.findIndex(optionCur => {
      return optionCur.value === activeOptionValue;
    });

    if (activeOptionIndex < 0) {
      activeOptionIndex = 0;
    }

    activeOption = localOptions[activeOptionIndex];
  }

  const currentActiveValue = activeOption?.value ?? '';

  let activeOptionId: string | undefined;

  if (activeOption) {
    activeOptionId = `${listBoxId}-${activeOption.id}`;
  }

  const scrollRailIntoView = (target: HTMLElement | null, smooth = false) => {
    const container = chipsAndInputRef.current;

    if (!container || !target) {
      return;
    }

    if (container.scrollWidth <= container.clientWidth) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const left = containerRect.left + container.clientLeft;
    const right = left + container.clientWidth;

    let nextScrollLeft = container.scrollLeft;

    if (targetRect.left < left) {
      nextScrollLeft += targetRect.left - left;
    } else if (targetRect.right > right) {
      nextScrollLeft += targetRect.right - right;
    }

    if (nextScrollLeft === container.scrollLeft) {
      return;
    }

    const allowSmoothScroll = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

    if (smooth && allowSmoothScroll) {
      container.scrollTo({
        left: nextScrollLeft,
        behavior: 'smooth',
      });

      return;
    }

    container.scrollLeft = nextScrollLeft;
  };

  const scrollActiveOptionIntoView = () => {
    const listBox = listBoxRef.current;

    if (!listBox || !activeOptionId) {
      return;
    }

    const option = document.getElementById(activeOptionId);

    if (!option) {
      return;
    }

    const listRect = listBox.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();

    const top = listRect.top + listBox.clientTop;
    const bottom = top + listBox.clientHeight;

    if (optionRect.top < top) {
      listBox.scrollTop += optionRect.top - top;

      return;
    }

    if (optionRect.bottom > bottom) {
      listBox.scrollTop += optionRect.bottom - bottom;
    }
  };

  useEffect(() => {
    if (isUnavailable) {
      setIsOpenRequested(false);
    }
  }, [isUnavailable]);

  useEffect(() => {
    setActiveOptionValue(currentActiveValue);
  }, [currentActiveValue]);

  useLayoutEffect(() => {
    scrollActiveOptionIntoView();
  }, [activeOptionId, localOptions]);

  useLayoutEffect(() => {
    const focused = document.activeElement;

    if (focused === inputRef.current) {
      scrollRailIntoView(inputRef.current);

      return;
    }

    if (!(focused instanceof HTMLButtonElement)) {
      return;
    }

    if (!chipsAndInputRef.current?.contains(focused)) {
      return;
    }

    scrollRailIntoView(focused.parentElement);
  }, [selectedValues]);

  const focusInput = (smooth = false) => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    if (document.activeElement !== input) {
      input.focus({ preventScroll: true });

      return;
    }

    scrollRailIntoView(input, smooth);
  };

  const focusChip = (value: string) => {
    const button = chipButtonRefs.current.get(value);

    button?.focus({ preventScroll: true });
  };

  const toggleSelectedValue = (value: string) => {
    setSelectedValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(cur => cur !== value);
      }

      if (prev.length >= selectionLimit) {
        return prev;
      }

      return [...prev, value];
    });
  };

  const handleOptionSelect = (value: string) => {
    if (!isOpened) {
      return;
    }

    if (isAtSelectionLimit && !selectedSet.has(value)) {
      return;
    }

    toggleSelectedValue(value);

    setInputValue('');
    setIsOpenRequested(true);

    focusInput();
  };

  const handleRemoveChip = (value: string, keepChipFocus = false) => {
    const currentIndex = selectedValues.indexOf(value);

    const nextValue = selectedValues[currentIndex + 1];
    const previousValue = selectedValues[currentIndex - 1];

    if (keepChipFocus && nextValue) {
      focusChip(nextValue);
    } else if (keepChipFocus && previousValue) {
      focusChip(previousValue);
    } else {
      focusInput();
    }

    setSelectedValues(prev => {
      return prev.filter(cur => cur !== value);
    });
  };

  const handleClearButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setSelectedValues([]);
    setInputValue('');
    setActiveOptionValue('');
    setIsOpenRequested(true);

    focusInput();
  };

  const handleArrowButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const shouldOpen = !isOpened;

    focusInput();
    setIsOpenRequested(shouldOpen);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsOpenRequested(true);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const isComposing = e.nativeEvent.isComposing;
    const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

    if (isUnavailable || isComposing || hasModifier) {
      return;
    }

    if (e.key === 'Escape') {
      if (isOpened) {
        e.preventDefault();

        setIsOpenRequested(false);
      }

      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      if (!isOpened) {
        setIsOpenRequested(true);

        return;
      }

      if (activeOption) {
        handleOptionSelect(activeOption.value);
      }

      return;
    }

    if (e.key === 'Backspace' && inputValue.length === 0) {
      if (selectedValues.length > 0) {
        e.preventDefault();

        setSelectedValues((prev) => {
          return prev.slice(0, -1);
        });
      }

      return;
    }

    if (e.key === 'ArrowLeft' && inputValue.length === 0) {
      if (e.shiftKey || selectedValues.length === 0) {
        return;
      }

      e.preventDefault();

      focusChip(selectedValues[selectedValues.length - 1]);

      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();

      if (localOptions.length === 0) {
        return;
      }

      if (!isOpened) {
        setIsOpenRequested(true);

        return;
      }

      const nextIndex = activeOptionIndex + 1;

      if (nextIndex >= localOptions.length) {
        return;
      }

      setActiveOptionValue(localOptions[nextIndex].value);

      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      if (localOptions.length === 0) {
        return;
      }

      const previousIndex = activeOptionIndex - 1;

      if (previousIndex < 0) {
        return;
      }

      setActiveOptionValue(localOptions[previousIndex].value);
    }
  };

  const handleChipKeyDown = (e: KeyboardEvent<HTMLButtonElement>, value: string) => {
    const isComposing = e.nativeEvent.isComposing;
    const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

    if (isUnavailable || isComposing || hasModifier) {
      return;
    }

    const currentIndex = selectedValues.indexOf(value);

    if (e.key === 'Escape') {
      e.preventDefault();

      focusInput();

      setIsOpenRequested(false);
      setActiveOptionValue('');

      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();

      focusInput();
      setIsOpenRequested(true);

      if (localOptions.length > 0) {
        setActiveOptionValue(localOptions[0].value);
      }

      return;
    }

    if (e.key === 'ArrowLeft') {
      if (e.shiftKey) {
        return;
      }

      e.preventDefault();

      if (currentIndex > 0) {
        focusChip(selectedValues[currentIndex - 1]);
      }

      return;
    }

    if (e.key === 'ArrowRight') {
      if (e.shiftKey) {
        return;
      }

      e.preventDefault();

      const nextIndex = currentIndex + 1;

      if (nextIndex < selectedValues.length) {
        focusChip(selectedValues[nextIndex]);
      } else {
        focusInput();
      }

      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();

      handleRemoveChip(value, true);

      return;
    }

    if (e.key.length === 1 && e.key !== ' ') {
      e.preventDefault();

      handleInputChange(e.key);
      focusInput();
    }
  };

  const handleComboboxBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }

    setIsOpenRequested(false);
    setActiveOptionValue('');
  };

  const handleControlClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isUnavailable) {
      return;
    }

    if ((e.target as Element).closest('button')) {
      return;
    }

    focusInput();
    setIsOpenRequested(true);
  };

  const handleChipClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (isUnavailable) {
      return;
    }

    focusInput(e.detail > 0);
    setIsOpenRequested(true);
  };

  const handleChipLabelMouseDown = (e: MouseEvent<HTMLSpanElement>) => {
    if (e.button !== 0) {
      return;
    }

    if (document.activeElement === inputRef.current) {
      e.preventDefault();
    }
  };

  const handleChipRemoveClick = (e: MouseEvent<HTMLButtonElement>, value: string) => {
    e.stopPropagation();

    const keepChipFocus = e.detail === 0;

    handleRemoveChip(value, keepChipFocus);
  };

  const handleChipFocus = (e: FocusEvent<HTMLButtonElement>) => {
    scrollRailIntoView(e.currentTarget.parentElement);
  };

  const handleInputFocus = () => {
    setIsOpenRequested(true);
    scrollRailIntoView(inputRef.current);
  };

  const handleListBoxFocus = (e: FocusEvent<HTMLUListElement>) => {
    if (e.target === e.currentTarget) {
      focusInput();
    }
  };

  const handleOptionMouseDown = (e: MouseEvent<HTMLLIElement>) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  const hasValue = selectedValues.length > 0 || inputValue.length > 0;
  const hasListBox = isOpened && localOptions.length > 0;
  const showError = isInvalid && !isLoading;

  const arrowButtonClassNames = classNames({
    [styles.Button]: true,
    [styles.isOpened]: isOpened,
  });

  const labelClassNames = classNames({
    [styles.Label]: true,
    [styles.hasValue]: hasValue,
  });

  let emptyMessage = '';

  if (isOpened && !hasListBox) {
    emptyMessage = 'Ничего не найдено';

    if (options.length === 0) {
      emptyMessage = 'Нет вариантов';
    }
  }

  let limitMessage = '';

  if (!isUnavailable && isAtSelectionLimit) {
    limitMessage = `Достигнут лимит выбора: ${selectionLimit}`;
  }

  let errorDescriptionId: string | undefined;

  if (showError) {
    errorDescriptionId = errorId;
  }

  const arrowButtonLabel = isOpened ? 'Закрыть список' : 'Раскрыть список';

  const renderChip = (value: string) => {
    const option = optionsByValue.get(value);

    if (!option) {
      return null;
    }

    const refCallback = (value: string, node: HTMLButtonElement | null) => {
      if (node) {
        chipButtonRefs.current.set(value, node);
      } else {
        chipButtonRefs.current.delete(value);
      }
    };

    const ariaLabel = `Удалить ${option.label}`;

    return (
      <div
        key={option.id}
        className={styles.Chip}
        onClick={handleChipClick}
      >
        <span className={styles.ChipLabel} onMouseDown={handleChipLabelMouseDown}>
          {option.label}
        </span>

        <button
          ref={(node) => refCallback(value, node)}
          type="button"
          className={styles.ChipRemove}
          aria-label={ariaLabel}
          disabled={isUnavailable}
          onClick={e => handleChipRemoveClick(e, value)}
          onKeyDown={e => handleChipKeyDown(e, value)}
          onFocus={handleChipFocus}
        >
          <CloseIcon aria-hidden="true" />
        </button>
      </div>
    );
  };

  const renderOption = (option: ComboboxOption) => {
    const isSelected = selectedSet.has(option.value);
    const isActive = option.value === activeOption?.value;
    const isOptionDisabled = isAtSelectionLimit && !isSelected;
    const ariaDisabled = isOptionDisabled || undefined;
    const id = `${listBoxId}-${option.id}`;

    const optionClassNames = classNames({
      [styles.Option]: true,
      [styles.isActive]: isActive,
    });

    return (
      <li
        key={option.id}
        id={id}
        className={optionClassNames}
        role="option"
        aria-selected={isSelected}
        aria-disabled={ariaDisabled}
        onMouseDown={handleOptionMouseDown}
        onClick={() => handleOptionSelect(option.value)}
      >
        <span className={styles.Check} aria-hidden="true">
          {isSelected && (
            <CheckIcon />
          )}
        </span>

        <span>
          {option.label}
        </span>
      </li>
    );
  };

  const controlClassNames = classNames({
    [styles.Control]: true,
    [styles.isUnavailable]: isUnavailable,
    [styles.isInvalid]: showError,
  });

  const clearButtonIsUnavailable = isUnavailable || !hasValue;

  const clearButtonClassNames = classNames({
    [styles.Button]: true,
    [styles.isHidden]: clearButtonIsUnavailable,
  });

  const ariaControls = hasListBox ? listBoxId : undefined;
  const labelText = isLoading ? 'Загрузка...' : 'Выберите страну';

  return (
    <div className={styles.Combobox} onBlur={handleComboboxBlur}>
      <span role="status" className={styles.Hidden}>
        {isLoading ? 'Загрузка...' : emptyMessage}
      </span>

      <span role="status" className={styles.Hidden}>
        {limitMessage}
      </span>

      {showError && (
        <p id={errorId} className={styles.Error}>
          Проверьте выбранные значения
        </p>
      )}

      <div className={styles.Anchor}>
        <div
          className={controlClassNames}
          aria-busy={isLoading}
          onClick={handleControlClick}
        >
          <label
            id={labelId}
            htmlFor={inputId}
            className={labelClassNames}
          >
            {labelText}
          </label>

          <div className={styles.Rail}>
            <div ref={chipsAndInputRef} className={styles.ChipsAndInput}>
              <div className={styles.Chips}>
                {selectedValues.map(renderChip)}
              </div>

              <input
                ref={inputRef}
                id={inputId}
                className={styles.Input}
                type="text"
                role="combobox"
                aria-expanded={hasListBox}
                aria-controls={ariaControls}
                aria-autocomplete="list"
                aria-activedescendant={activeOptionId}
                aria-invalid={showError}
                aria-describedby={errorDescriptionId}
                autoComplete="off"
                maxLength={255}
                value={inputValue}
                disabled={isUnavailable}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onFocus={handleInputFocus}
              />
            </div>
          </div>

          <div className={styles.Buttons}>
            <button
              className={clearButtonClassNames}
              type="button"
              aria-label="Очистить выбор"
              disabled={clearButtonIsUnavailable}
              onClick={handleClearButtonClick}
            >
              <CloseIcon aria-hidden="true" />
            </button>

            <button
              className={arrowButtonClassNames}
              type="button"
              aria-label={arrowButtonLabel}
              disabled={isUnavailable}
              onClick={handleArrowButtonClick}
              onMouseDown={e => e.preventDefault()}
            >
              {isLoading && (
                <span className={styles.Loader} aria-hidden="true">
                  <LoadingIcon />
                </span>
              )}

              {!isLoading && (
                <ArrowDownIcon aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {isOpened && (
          <div className={styles.Popup}>
            {hasListBox && (
              <ul
                ref={listBoxRef}
                id={listBoxId}
                className={styles.List}
                role="listbox"
                tabIndex={-1}
                aria-labelledby={labelId}
                aria-multiselectable="true"
                onFocus={handleListBoxFocus}
              >
                {localOptions.map(renderOption)}
              </ul>
            )}

            {!hasListBox && (
              <p className={styles.Empty} aria-hidden="true">
                {emptyMessage}
              </p>
            )}

            {limitMessage && (
              <p className={styles.PopupLimit} aria-hidden="true">
                {limitMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {!isOpened && limitMessage && (
        <p className={styles.Message} aria-hidden="true">
          {limitMessage}
        </p>
      )}
    </div>
  );
};
