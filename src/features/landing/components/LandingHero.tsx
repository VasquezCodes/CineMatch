"use client";

import { HeroLoopedPanels } from "./HeroLoopedPanels";

export function LandingHero() {
    return (
        <section className="relative w-full overflow-hidden">
            <HeroLoopedPanels />

            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="text-center pointer-events-auto">
                    <h1 className="text-4xl font-bold"></h1>
                </div>
            </div>
        </section>
    );
}
