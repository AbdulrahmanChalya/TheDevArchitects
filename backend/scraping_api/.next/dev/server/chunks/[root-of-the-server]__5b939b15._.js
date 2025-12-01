module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/expediaAttractions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/expedia.ts
__turbopack_context__.s([
    "buildExpediaAttractionsSearchUrl",
    ()=>buildExpediaAttractionsSearchUrl
]);
function encodeDateForExpedia(date) {
    if (!date) return "";
    return date;
}
function buildExpediaAttractionsSearchUrl({ city, startDate, endDate, adults = 2 }) {
    const base = "https://www.expedia.ca/things-to-do/search";
    const params = new URLSearchParams();
    // Location
    if (city) {
        params.set("location", city);
    }
    // Dates
    if (startDate) params.set("startDate", encodeDateForExpedia(startDate));
    if (endDate) params.set("endDate", encodeDateForExpedia(endDate));
    // People: Expedia sometimes uses travellers/adults – this works in practice.
    params.set("travellers", String(adults));
    params.set("sort", "RECOMMENDED");
    params.set("filter.seeAll", "true");
    return `${base}?${params.toString()}`;
}
}),
"[project]/parsing/expediaAttractionsCustomParser.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"attractions":{"_fns":[{"_fn":"xpath","_args":["//*[@data-testid='activity-tile-card']"]}],"_items":{"name":{"_fns":[{"_fn":"xpath_one","_args":[".//h3[@data-testid='activity-tile-card--title']/text()"]}]},"image":{"_fns":[{"_fn":"xpath_one","_args":[".//div[@data-testid='activity-tile-card-img']//img/@src"]}]},"duration":{"_fns":[{"_fn":"xpath_one","_args":[".//div[@data-testid='activity-duration--feature']//span[@aria-hidden='true']/text()",".//div[@data-testid='activity-duration--feature']//span[@class='is-visually-hidden']/text()"]}]},"ratingScore":{"_fns":[{"_fn":"xpath_one","_args":[".//div[@data-testid='activity-highlight-review']//span[contains(@class,'uitk-badge-base-text')]/text()"]}]},"ratingText":{"_fns":[{"_fn":"xpath_one","_args":[".//div[@data-testid='activity-highlight-review']//div[contains(@class,'uitk-text-emphasis-theme')]/text()"]}]},"reviewCount":{"_fns":[{"_fn":"xpath_one","_args":[".//div[@data-testid='activity-highlight-review']//div[contains(text(),'review')]/text()"]},{"_fn":"amount_from_string"}]},"priceText":{"_fns":[{"_fn":"xpath_one","_args":[".//span[contains(@class,'uitk-price-a11y')]/text()"]}]},"price":{"_fns":[{"_fn":"xpath_one","_args":[".//span[contains(@class,'uitk-price-a11y')]/text()"]},{"_fn":"amount_from_string"}]},"link":{"_fns":[{"_fn":"xpath_one","_args":[".//a[@data-testid='card-link']/@href"]}]}}}});}),
"[project]/app/api/attractions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/attractions/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$expediaAttractions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/expediaAttractions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$parsing$2f$expediaAttractionsCustomParser$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/parsing/expediaAttractionsCustomParser.json (json)");
;
;
;
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city") || "";
        const startDate = searchParams.get("startDate") || "";
        const endDate = searchParams.get("endDate") || "";
        const people = Number(searchParams.get("people") || 2);
        const expediaSearchUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$expediaAttractions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildExpediaAttractionsSearchUrl"])({
            city,
            startDate,
            endDate,
            adults: people
        });
        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;
        if (!username || !password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing OXYLABS_USERNAME or OXYLABS_PASSWORD env vars"
            }, {
                status: 500
            });
        }
        const authToken = Buffer.from(`${username}:${password}`).toString("base64");
        const payload = {
            source: "universal",
            url: expediaSearchUrl,
            render: "html",
            parse: true,
            parsing_instructions: __TURBOPACK__imported__module__$5b$project$5d2f$parsing$2f$expediaAttractionsCustomParser$2e$json__$28$json$29$__["default"],
            browser_instructions: [
                {
                    type: "scroll_to_bottom",
                    timeout_s: 30,
                    wait_time_s: 20
                }
            ]
        };
        const res = await fetch("https://realtime.oxylabs.io/v1/queries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authToken}`
            },
            // Optional caching hint for Next.js route handler
            // next: {
            //   revalidate: 60 * 60, // cache for 1 hour
            // },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const text = await res.text();
            console.error("Oxylabs error:", res.status, text);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Oxylabs error",
                status: res.status,
                details: text
            }, {
                status: res.status
            });
        }
        const data = await res.json();
        const content = data?.results?.[0]?.content;
        const attractionsRaw = content?.attractions ?? [];
        const attractions = attractionsRaw.map((a, index)=>({
                id: `attraction-${index + 1}`,
                name: a.name,
                ratingScore: a.ratingScore || null,
                ratingText: a.ratingText || null,
                reviewCount: typeof a.reviewCount === "number" ? a.reviewCount : null,
                distance: a.distance || null,
                duration: a.duration || null,
                price: typeof a.price === "number" ? a.price : null,
                priceText: a.priceText || null,
                image: a.image || null
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            attractions,
            expediaSearchUrl
        });
    } catch (err) {
        console.error("Attractions API error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Server failed",
            detail: err.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5b939b15._.js.map