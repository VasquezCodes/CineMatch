"use client";

import dynamic from "next/dynamic";
import { RankingsSkeleton } from "./RankingsSkeleton";

// Dynamic import con ssr:false para evitar hydration mismatch
// (Radix Tabs genera IDs diferentes en server vs client cuando se usa con React Query)
const RankingsSectionDynamic = dynamic(
    () => import("./RankingsSection").then((mod) => mod.RankingsSection),
    { ssr: false, loading: () => <RankingsSkeleton /> }
);

interface RankingsSectionClientProps {
    userId: string;
}

/**
 * Client wrapper para RankingsSection que evita hydration mismatch
 * usando dynamic import con ssr:false
 */
export function RankingsSectionClient({ userId }: RankingsSectionClientProps) {
    return <RankingsSectionDynamic userId={userId} />;
}
