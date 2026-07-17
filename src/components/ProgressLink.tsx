import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { STUDENT_PROGRESS_URL } from "../config/urls";
import { resolvePrimaryProgressPackageId } from "../lib/packageAccess";

type Props = {
  className?: string;
  compact?: boolean;
};

export function ProgressLink({ className = "", compact = false }: Props) {
  const { ownedPackageIds } = useAuth();

  const href = useMemo(() => {
    const url = new URL(STUDENT_PROGRESS_URL);
    if (ownedPackageIds.length > 0) {
      url.searchParams.set("package", resolvePrimaryProgressPackageId(ownedPackageIds));
    }
    return url.toString();
  }, [ownedPackageIds]);

  return (
    <a
      className={`progress-link${className ? ` ${className}` : ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {compact ? "Progress →" : "My progress →"}
    </a>
  );
}
