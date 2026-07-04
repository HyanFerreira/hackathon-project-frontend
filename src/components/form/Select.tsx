"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectBaseProps = {
  buttonClassName?: string;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
  error?: string;
  id?: string;
  label?: string;
  name?: string;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
};

type SingleSelectProps = SelectBaseProps & {
  multiple?: false;
  onChange: (value: string) => void;
  value?: string;
};

type MultiSelectProps = SelectBaseProps & {
  multiple: true;
  onChange: (value: string[]) => void;
  value: string[];
};

export type SelectProps = SingleSelectProps | MultiSelectProps;

type DropdownPlacement = "top" | "bottom";

function getScrollParent(element: HTMLElement) {
  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;

    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function Select({
  buttonClassName,
  className,
  disabled,
  emptyMessage = "Nenhuma opcao encontrada.",
  error,
  id,
  label,
  name,
  options,
  placeholder = "Selecione",
  searchable = false,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? name ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;
  const listboxId = `${selectId}-listbox`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPlacement, setDropdownPlacement] =
    useState<DropdownPlacement>("bottom");
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(256);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>();
  const [searchTerm, setSearchTerm] = useState("");

  const selectedValues = props.multiple
    ? props.value
    : props.value
      ? [props.value]
      : [];

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)),
    [options, selectedValues],
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm.trim());

    if (!normalizedSearch) return options;

    return options.filter((option) =>
      normalizeText(option.label).includes(normalizedSearch),
    );
  }, [options, searchTerm]);

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const scrollParent = getScrollParent(trigger);
    const scrollParentRect = scrollParent?.getBoundingClientRect();
    const viewportPadding = 16;
    const gap = 8;
    const preferredMaxHeight = 256;
    const minimumUsableHeight = 96;
    const clippingTop = Math.max(
      viewportPadding,
      scrollParentRect
        ? scrollParentRect.top + viewportPadding
        : viewportPadding,
    );
    const clippingBottom = Math.min(
      window.innerHeight - viewportPadding,
      scrollParentRect
        ? scrollParentRect.bottom - viewportPadding
        : window.innerHeight - viewportPadding,
    );
    const availableBelow = clippingBottom - rect.bottom;
    const availableAbove = rect.top - clippingTop;
    const shouldOpenUp =
      availableBelow < minimumUsableHeight && availableAbove > availableBelow;
    const availableSpace = shouldOpenUp ? availableAbove : availableBelow;
    const nextMaxHeight = Math.max(
      minimumUsableHeight,
      Math.min(preferredMaxHeight, availableSpace - gap),
    );

    setDropdownPlacement(shouldOpenUp ? "top" : "bottom");
    setDropdownMaxHeight(nextMaxHeight);
    setDropdownStyle({
      left: rect.left,
      width: rect.width,
      ...(shouldOpenUp
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      return;
    }

    if (searchable) {
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      const target = event.target;

      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, []);

  function isSelected(value: string) {
    return selectedValues.includes(value);
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) return;

    if (props.multiple) {
      props.onChange(
        isSelected(option.value)
          ? props.value.filter((value) => value !== option.value)
          : [...props.value, option.value],
      );
      return;
    }

    props.onChange(option.value);
    setIsOpen(false);
  }

  const hasValue = selectedOptions.length > 0;

  return (
    <div ref={containerRef} className={twMerge("space-y-2", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {name &&
          (props.multiple ? (
            selectedValues.map((value) => (
              <input key={value} type="hidden" name={name} value={value} />
            ))
          ) : (
            <input type="hidden" name={name} value={props.value ?? ""} />
          ))}

        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          aria-controls={listboxId}
          aria-describedby={errorId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          className={twMerge(
            "min-h-11 w-full rounded-system border border-input-border bg-white px-3 py-2.5 pr-16 text-left text-sm text-text-primary outline-0 transition focus:border-transparent focus:outline-2 focus:outline-offset-1 focus:outline-input-border-focus focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-input-border-focus disabled:cursor-default disabled:bg-input-disabled",
            error &&
              "border-red-500 focus:outline-red-600 focus-visible:outline-red-600",
            buttonClassName,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {hasValue ? (
              props.multiple ? (
                <span className="flex min-w-0 flex-wrap gap-1.5">
                  {selectedOptions.map((option) => (
                    <span
                      key={option.value}
                      className="rounded-full bg-brand-primary-soft px-2.5 py-0.5 text-xs font-semibold text-brand-primary"
                    >
                      {option.label}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="truncate">{selectedOptions[0]?.label}</span>
              )
            ) : (
              <span className="text-placeholder">{placeholder}</span>
            )}
          </span>
        </button>

        <span className="-translate-y-1/2 absolute top-1/2 right-2 flex items-center gap-1">
          {hasValue && !disabled && (
            <button
              type="button"
              aria-label="Limpar selecao"
              onClick={() => {
                if (props.multiple) {
                  props.onChange([]);
                } else {
                  props.onChange("");
                }
              }}
              className="inline-flex size-7 items-center justify-center rounded-system text-text-secondary transition hover:bg-slate-100 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-input-border-focus"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
          <ChevronDown
            aria-hidden="true"
            className={twMerge(
              "size-5 text-text-secondary transition",
              isOpen && "rotate-180",
            )}
          />
        </span>

        {isOpen && !disabled && (
          <div
            style={dropdownStyle}
            className={twMerge(
              "fixed z-50 overflow-hidden rounded-system border border-slate-200 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.16)]",
              dropdownPlacement === "top" && "origin-bottom",
              dropdownPlacement === "bottom" && "origin-top",
            )}
          >
            {searchable && (
              <div className="border-slate-200 border-b p-2">
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-text-secondary"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchTerm}
                    placeholder="Buscar..."
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-10 w-full rounded-system border border-input-border bg-white pr-3 pl-9 text-sm text-text-primary outline-0 placeholder:text-placeholder focus:border-transparent focus:outline-2 focus:outline-offset-1 focus:outline-input-border-focus"
                  />
                </div>
              </div>
            )}

            <div
              id={listboxId}
              role="listbox"
              aria-multiselectable={props.multiple || undefined}
              className="overflow-y-auto p-1"
              style={{ maxHeight: dropdownMaxHeight }}
            >
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-sm text-text-secondary">
                  {emptyMessage}
                </p>
              )}

              {filteredOptions.map((option) => {
                const selected = isSelected(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    onClick={() => selectOption(option)}
                    className={twMerge(
                      "flex min-h-10 w-full items-center justify-between gap-3 rounded-system px-3 py-2 text-left text-sm transition",
                      selected
                        ? "bg-brand-primary-soft font-semibold text-brand-primary"
                        : "text-text-primary hover:bg-slate-50",
                      option.disabled &&
                        "cursor-default opacity-50 hover:bg-transparent",
                    )}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {selected && (
                      <Check aria-hidden="true" className="size-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
