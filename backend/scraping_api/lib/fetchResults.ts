import { Result, SearchParams } from "../typings";

export async function fetchResults(searchParams: SearchParams) {
  const username = process.env.OXYLABS_USERNAME;
  const password = process.env.OXYLABS_PASSWORD;

  const url = new URL("https://www.booking.com/searchresults.html");

  if (searchParams.location) {
    url.searchParams.set("ss", searchParams.location);
  }
  if (searchParams.group_adults) {
    url.searchParams.set("group_adults", searchParams.group_adults);
  }
  if (searchParams.group_children) {
    url.searchParams.set("group_children", searchParams.group_children);
  }
  if (searchParams.no_rooms) {
    url.searchParams.set("no_rooms", searchParams.no_rooms);
  }
  if (searchParams.checkin) {
    url.searchParams.set("checkin", searchParams.checkin);
  }
  if (searchParams.checkout) {
    url.searchParams.set("checkout", searchParams.checkout);
  }

  const body = {
    source: "universal",
    url: url.href,
    parse: true,
    render: "html",
    parsing_instructions: {
      listings: {
        _fns: [
          {
            _fn: "xpath",
            _args: ["//*[@data-testid='property-card']"],
          },
        ],
        _items: {
          title: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//*[@data-testid='title']/text()"],
              },
            ],
          },
          booking_metadata: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//*[@data-testid='price-for-x-nights']/text()"],
              },
            ],
          },
          link: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//*[@data-testid='title-link']/@href"],
              },
            ],
          },
          price: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  ".//*[@data-testid='price-and-discounted-price']/text()",
                ],
              },
            ],
          },
          description: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  ".//h4[contains(@class, 'fff1944c52 f254df5361')]/text()",
                ],
              },
            ],
          },
          url: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//img/@src"],
              },
            ],
          },
          rating_word: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  ".//div[@class='f63b14ab7a f546354b44 becbee2f63']/text()",
                ],
              },
            ],
          },
          rating: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//div[@class='f63b14ab7a dff2e52086']/text()"],
              },
            ],
          },
          rating_count: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  ".//div[@class='fff1944c52 fb14de7f14 eaa8455879']/text()",
                ],
              },
            ],
          },
        },
      },
      total_listings: {
        _fns: [
          {
            _fn: "xpath_one",
            _args: ["//h1/text()"],
          },
        ],
      },
    },
  };

  const data = await fetch("https://realtime.oxylabs.io/v1/queries", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
    },
  }).then((r) => r.json());

  if (!data.results || data.results.length === 0) {
    console.log("No results", data);
    return;
  }

  const response: Result = data.results[0];
  return response;
}
