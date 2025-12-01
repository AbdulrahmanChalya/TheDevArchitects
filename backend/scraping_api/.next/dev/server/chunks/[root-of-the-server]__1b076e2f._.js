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
"[project]/lib/expediaFlights.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildExpediaFlightSearchUrl",
    ()=>buildExpediaFlightSearchUrl
]);
function formatDateForExpedia(date) {
    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
}
function buildExpediaFlightSearchUrl({ originAirport, destinationAirport, departureDate, returnDate, adults }) {
    const base = "https://www.expedia.ca/Flights-Search";
    const dep = formatDateForExpedia(departureDate);
    const ret = formatDateForExpedia(returnDate);
    const leg1 = `leg1=from:${encodeURIComponent(originAirport)},to:${encodeURIComponent(destinationAirport)},departure:${encodeURIComponent(`${dep}TANYT`)}`;
    const leg2 = `leg2=from:${encodeURIComponent(destinationAirport)},to:${encodeURIComponent(originAirport)},departure:${encodeURIComponent(`${ret}TANYT`)}`;
    const passengers = `passengers=${encodeURIComponent(`children:0,adults:${adults},seniors:0,infantinlap:Y`)}`;
    const options = `options=${encodeURIComponent("cabinclass:economy")}`;
    const qs = [
        "trip=roundtrip",
        leg1,
        leg2,
        passengers,
        options,
        "mode=search"
    ].join("&");
    return `${base}?${qs}`;
}
}),
"[project]/parsing/expediaFlightCustomParser.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"flights":{"_fns":[{"_fn":"xpath","_args":["//*[@data-test-id='listings']//*[@data-test-id='offer-listing']"]}],"_items":{"airline":{"_fns":[{"_fn":"xpath_one","_args":["(.//*[@data-stid='flight-information-section']//div[contains(@class,'uitk-text') and contains(@class,'uitk-text-secondary-theme')])[2]/text()"]}]},"airlineLogo":{"_fns":[{"_fn":"xpath_one","_args":[".//img[contains(@class,'uitk-mark-landscape-oriented')]/@src","(.//*[@data-stid='flight-information-section']/ancestor::div[contains(@class,'uitk-layout-grid')][1]//img[contains(@class,'uitk-mark-landscape-oriented')])[1]/@src"]}]},"route":{"_fns":[{"_fn":"xpath_one","_args":["(.//*[@data-stid='flight-information-section']//div[contains(@class,'uitk-text') and contains(@class,'uitk-text-secondary-theme')])[1]/text()"]}]},"price":{"_fns":[{"_fn":"xpath_one","_args":[".//div[@data-stid='price-display']//span[@aria-hidden='true']/text()"]},{"_fn":"amount_from_string"}]},"duration":{"_fns":[{"_fn":"xpath_one","_args":[".//div[@data-stid='tertiary-section']//span[contains(@class,'uitk-type-300')][1]/text()"]}]}}}});}),
"[project]/lib/flightParsers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseRouteFull",
    ()=>parseRouteFull
]);
const parseRouteFull = (route)=>{
    const match = route.match(/^(.*?)\s*-\s*(.*)$/);
    return {
        departureAirport: match?.[1]?.trim() || null,
        arrivalAirport: match?.[2]?.trim() || null
    };
};
}),
"[project]/app/api/flights/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$expediaFlights$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/expediaFlights.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$parsing$2f$expediaFlightCustomParser$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/parsing/expediaFlightCustomParser.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$flightParsers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/flightParsers.ts [app-route] (ecmascript)");
;
;
;
;
const revalidate = 60 * 60;
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        // Expect IATA codes here, e.g. origin=JFK&destination=CDG
        const originAirport = searchParams.get("origin") || "";
        const destinationAirport = searchParams.get("destination") || "";
        const departureDate = searchParams.get("startDate") || ""; // YYYY-MM-DD
        const returnDate = searchParams.get("endDate") || ""; // YYYY-MM-DD
        const adults = Number(searchParams.get("people") || 1);
        const cabinClass = searchParams.get("class") || "Economy";
        if (!originAirport || !destinationAirport || !departureDate || !returnDate) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing required query params. Required: origin, destination, startDate, endDate"
            }, {
                status: 400
            });
        }
        const expediaSearchUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$expediaFlights$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildExpediaFlightSearchUrl"])({
            originAirport,
            destinationAirport,
            departureDate,
            returnDate,
            adults
        });
        const username = process.env.OXYLABS_USERNAME;
        const password = process.env.OXYLABS_PASSWORD;
        if (!username || !password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing OXYLABS_USERNAME or OXYLABS_PASSWORD environment variables"
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
            parsing_instructions: __TURBOPACK__imported__module__$5b$project$5d2f$parsing$2f$expediaFlightCustomParser$2e$json__$28$json$29$__["default"],
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
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const text = await res.text();
            console.error("Oxylabs error:", res.status, text);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Oxylabs error",
                status: res.status,
                details: text.slice(0, 500)
            }, {
                status: res.status
            });
        }
        const data = await res.json();
        const content = data?.results?.[0]?.content;
        const flightsRaw = content?.flights || [];
        const flights = flightsRaw.map((f, index)=>{
            const { departureAirport, arrivalAirport } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$flightParsers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseRouteFull"])(f.route);
            // f.price should already be numeric because of amount_from_string,
            // but we normalise anyway just in case
            let numericPrice = 0;
            if (typeof f.price === "number") {
                numericPrice = f.price;
            } else if (typeof f.price === "string") {
                const cleaned = f.price.replace(/[^\d.]/g, "");
                numericPrice = cleaned ? Number(cleaned) : 0;
            }
            return {
                id: `flight-${index + 1}`,
                airline: f.airline ?? null,
                logo: f.airlineLogo || null,
                departureAirport: departureAirport ?? null,
                arrivalAirport: arrivalAirport ?? null,
                price: numericPrice,
                duration: f.duration ?? null,
                class: cabinClass
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            flights,
            expediaSearchUrl
        });
    } catch (err) {
        console.error("Flights API error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Server failed",
            detail: err?.message ?? String(err)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1b076e2f._.js.map