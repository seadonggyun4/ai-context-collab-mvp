import { Button, type ButtonProps } from "@astryxdesign/core/Button";

type ProductButtonProps = Pick<
  ButtonProps,
  "label" | "variant" | "size" | "href" | "onClick" | "isDisabled" | "type" | "endContent"
> & {
  className?: string;
};

export function ProductButton({ className, ...props }: ProductButtonProps) {
  return <Button {...props} className={["product-button", className].filter(Boolean).join(" ")} />;
}
