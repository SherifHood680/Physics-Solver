import { Suspense } from "react";
import HomeContent from "./home-content";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
