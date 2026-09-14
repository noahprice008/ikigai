import logo from "@/assets/ikigai-logo.png";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: boolean;
};

export function BrandMark({ className, label = true }: Props) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <img
        src={logo}
        alt=""
        width={48}
        height={48}
        className="size-10 shrink-0 object-contain drop-shadow-sm sm:size-11"
      />
      {label && (
        <span className="min-w-0">
          <span className="block truncate font-display text-lg font-semibold leading-none">Ikigai</span>
          <span className="eyebrow mt-1 block truncate text-muted-foreground">生き甲斐 · your map</span>
        </span>
      )}
    </span>
  );
}