import { cn } from "@/lib/utils";

export default function MaterialIcon({ name, className }) {
  return (
    <span className={cn("material-symbols-outlined", className)}>{name}</span>
  );
}

