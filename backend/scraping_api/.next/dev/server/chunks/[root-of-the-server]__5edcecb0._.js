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
"[project]/lib/expedia.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildExpediaSearchUrl",
    ()=>buildExpediaSearchUrl
]);
function buildExpediaSearchUrl({ city, startDate, endDate, totalGuests, rooms }) {
    const baseURL = "https://www.expedia.ca/Hotel-Search";
    const adultsPerRoom = Math.max(1, Math.ceil(totalGuests / rooms));
    const adultsList = Array.from({
        length: rooms
    }, ()=>adultsPerRoom).join(",");
    const params = new URLSearchParams({
        destination: city,
        d1: startDate,
        d2: endDate,
        startDate,
        endDate,
        adults: adultsList,
        rooms: String(rooms)
    });
    return `${baseURL}?${params.toString()}`;
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/parsing/expediaCustomParser.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"hotels":{"_fns":[{"_fn":"xpath","_args":["//*[@data-stid='property-listing-results']//*[@data-stid='lodging-card-responsive']","//*[@data-stid='lodging-card-responsive']"]}],"_items":{"name":{"_fns":[{"_fn":"xpath_one","_args":[".//h3[contains(@class,'uitk-heading')]/text()",".//*[@data-stid='content-hotel-title']/text()"]}]},"ratingScore":{"_fns":[{"_fn":"xpath_one","_args":[".//div[contains(@class,'uitk-card-content-section')]//span[contains(@class,'uitk-badge-base-text')]/text()"]}]},"ratingText":{"_fns":[{"_fn":"xpath_one","_args":[".//div[contains(@class,'uitk-card-content-section')]//span[contains(@class,'uitk-text') and contains(@class,'uitk-type-medium')]/text()"]}]},"pricePerNight":{"_fns":[{"_fn":"xpath_one","_args":[".//span[@data-stid='price-lockup-text']/text()",".//div[contains(@class,'uitk-type-500')]/text()"]}]},"totalPrice":{"_fns":[{"_fn":"xpath_one","_args":[".//*[@data-test-id='price-summary']//div[contains(@class,'uitk-type-end') and contains(text(),'total')]/text()",".//*[@data-test-id='price-summary-message-line']//div[contains(text(),'total')]/text()",".//div[contains(@class,'uitk-type-end')][contains(text(),'total')]/text()"]}]},"images":{"_fns":[{"_fn":"xpath","_args":[".//*[@data-stid='lodging-card-media-section']//img[contains(@class,'uitk-image-media')]/@src",".//*[@data-stid='lodging-card-media-section']//img[contains(@class,'uitk-image-media')]/@data-src",".//div[contains(@class,'uitk-gallery-carousel-items')]//img[contains(@class,'uitk-image-media')]/@src",".//div[contains(@class,'uitk-gallery-carousel-items')]//img[contains(@class,'uitk-image-media')]/@data-src",".//img[contains(@class,'uitk-image-media')]/@src",".//img[contains(@class,'uitk-image-media')]/@data-src"]}]},"amenities":{"_fns":[{"_fn":"xpath","_args":[".//ul[contains(@class,'uitk-typelist') and contains(@class,'uitk-typelist-size-2')]//div[contains(@class,'uitk-text')]/text()",".//ul[contains(@class,'uitk-typelist')]//li//div[contains(@class,'uitk-text')]/text()"]}]},"reviewCount":{"_fns":[{"_fn":"xpath_one","_args":[".//span[contains(@class,'uitk-text') and contains(@class,'uitk-type-200') and contains(., 'review')]/text()"]},{"_fn":"amount_from_string"}]}}}});}),
"[project]/app/api/hotels/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$expedia$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/expedia.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$parsing$2f$expediaCustomParser$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/parsing/expediaCustomParser.json (json)");
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
        const rooms = Number(searchParams.get("rooms") || 1);
        const expediaSearchUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$expedia$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildExpediaSearchUrl"])({
            city,
            startDate,
            endDate,
            totalGuests: people,
            rooms
        });
        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;
        // if (!username || !password) {
        //   // This is a VERY common reason for 500
        //   return NextResponse.json(
        //     { error: "Missing OXYLABS_USERNAME or OXYLABS_PASSWORD env vars" },
        //     { status: 500 }
        //   );
        // }
        const authToken = Buffer.from(`${username}:${password}`).toString("base64");
        const payload = {
            source: "universal",
            url: expediaSearchUrl,
            render: "html",
            parse: true,
            parsing_instructions: __TURBOPACK__imported__module__$5b$project$5d2f$parsing$2f$expediaCustomParser$2e$json__$28$json$29$__["default"],
            browser_instructions: [
                {
                    type: "scroll_to_bottom",
                    timeout_s: 5,
                    wait_time_s: 5
                }
            ]
        };
        const res = await fetch("https://realtime.oxylabs.io/v1/queries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authToken}`
            },
            body: JSON.stringify(payload)
        });
        // const contentType = res.headers.get("content-type") || "";
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
        // if (!contentType.includes("application/json")) {
        //   const text = await res.text();
        //   console.error("Oxylabs non-JSON response:", text);
        //   return NextResponse.json(
        //     {
        //       error: "Oxylabs did not return JSON",
        //       details: text.slice(0, 500), // first 500 chars for debugging
        //     },
        //     { status: 502 }
        //   );
        // }
        const data = await res.json();
        // const result = data?.results?.[0];
        // console.log("parse_status_code:", result?.content?.parse_status_code);
        // console.log(
        //   "parser warnings:",
        //   JSON.stringify(result?.content?._warnings, null, 2)
        // );
        // console.log(
        //   "hotels from parser:",
        //   Array.isArray(result?.content?.hotels)
        //     ? result.content.hotels.length
        //     : result?.content?.hotels
        // );
        const content = data.results?.[0]?.content;
        const hotelsRaw = content?.hotels ?? [];
        const hotels = hotelsRaw.map((h, index)=>({
                id: `hotel-${index + 1}`,
                name: h.name,
                ratingText: h.ratingText || undefined,
                ratingScore: h.ratingScore || undefined,
                pricePerNight: h.pricePerNight || undefined,
                totalPrice: h.totalPrice || undefined,
                images: Array.isArray(h.images) && h.images.length > 0 ? h.images : undefined,
                amenities: Array.isArray(h.amenities) ? h.amenities : undefined,
                reviewCount: typeof h.reviewCount === "number" ? h.reviewCount : undefined
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            hotels,
            expediaSearchUrl
        });
    } catch (err) {
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

//# sourceMappingURL=%5Broot-of-the-server%5D__5edcecb0._.js.map