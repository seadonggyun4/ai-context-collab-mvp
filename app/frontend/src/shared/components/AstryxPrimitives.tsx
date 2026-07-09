import { Button as AstryxButton } from "@astryxdesign/core/Button";
import type { ButtonProps as AstryxButtonProps } from "@astryxdesign/core/Button";
import { Card as AstryxCard } from "@astryxdesign/core/Card";
import type { MouseEventHandler, ReactNode } from "react";

interface ShellButtonProps {
  children: string;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  type?: "button" | "submit" | "reset";
  variant?: AstryxButtonProps["variant"];
}

interface ShellPanelProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}

interface ShellTabsProps<TValue extends string> {
  value: TValue;
  tabs: Array<{ value: TValue; label: string; count?: number }>;
  onChange: (value: TValue) => void;
}

export function ShellButton({
  variant = "primary",
  className = "",
  children,
  disabled,
  ...props
}: ShellButtonProps) {
  return (
    <AstryxButton
      className={`shell-button shell-button--${variant} ${className}`.trim()}
      data-astryx-component="Button"
      isDisabled={disabled}
      label={children}
      type={props.type ?? "button"}
      {...props}
    >
      {children}
    </AstryxButton>
  );
}

export function ShellPanel({
  title,
  actions,
  children,
  tone = "light",
  className = ""
}: ShellPanelProps) {
  return (
    <AstryxCard
      className={`shell-panel shell-panel--${tone} ${className}`.trim()}
      data-astryx-component="Card"
      padding={0}
      style={{ borderRadius: 5 }}
    >
      {(title || actions) && (
        <div className="shell-panel__header">
          {title ? <h2>{title}</h2> : <span />}
          {actions ? <div className="shell-panel__actions">{actions}</div> : null}
        </div>
      )}
      {children}
    </AstryxCard>
  );
}

export function ShellTabs<TValue extends string>({
  value,
  tabs,
  onChange
}: ShellTabsProps<TValue>) {
  return (
    <div
      aria-label="APC 데이터 관리 메뉴"
      className="shell-tabs"
      data-astryx-component="Tabs"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          aria-selected={value === tab.value}
          className="shell-tabs__item"
          key={tab.value}
          onClick={() => onChange(tab.value)}
          role="tab"
          type="button"
        >
          <span>{tab.label}</span>
          {typeof tab.count === "number" ? (
            <strong aria-label={`${tab.label} 개수`}>{tab.count}</strong>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function ShellSelect({
  label,
  onChange,
  value,
  options
}: {
  label: string;
  onChange?: (value: string) => void;
  value: string;
  options: string[];
}) {
  return (
    <label className="shell-field" data-astryx-component="Selector">
      <span>{label}</span>
      <select onChange={(event) => onChange?.(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
