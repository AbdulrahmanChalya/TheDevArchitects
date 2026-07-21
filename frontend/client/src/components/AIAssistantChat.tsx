import { useState } from "react";
import {
  Maximize2,
  MessageCircle,
  Minimize2,
  Send,
  X,
} from "lucide-react";
import { backendUrl } from "@/lib/backendUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help you plan a trip, compare destinations, or answer travel questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const getPageHint = () => {
    const path = window.location.pathname;

    if (path === "/") {
      return "The user is on the homepage. They can search for a destination, airports, dates, guests, rooms, and budget.";
    }

    if (path === "/search") {
      return "The user is on the search results page. They can choose a destination card to continue.";
    }

    if (path === "/book-hotel") {
      return "The user is on the hotel booking page. They should choose a hotel before continuing.";
    }

    if (path === "/book-flight") {
      return "The user is on the flight booking page. They should choose a flight before continuing.";
    }

    if (path === "/payment") {
      return "The user is on the payment page. They can review the booking and continue to Stripe Checkout.";
    }

    if (path === "/booking-success") {
      return "The user is on the booking success page. The payment flow is complete.";
    }

    return "The user is somewhere on the GetawayHub website.";
  };

  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);

    return {
      destination: params.get("destination"),
      departureAirport: params.get("departureAirport"),
      arrivalAirport: params.get("arrivalAirport"),
      people: params.get("people"),
      rooms: params.get("rooms"),
      hotelId: params.get("hotelId"),
      flightId: params.get("flightId"),
      total: params.get("total"),
    };
  };
  
  const sendMessage = async () => {
    const trimmed = input.trim();

    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await authenticatedFetch(backendUrl("/api/assistant/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          pageContext: {
            path: window.location.pathname,
            search: window.location.search,
            url: window.location.href,
            title: document.title,
            pageHint: getPageHint(),
            tripParams: getUrlParams(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Assistant failed to respond");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "Sorry, I could not generate a response. Please try again.",
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message ||
            "Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatSizeClasses = isExpanded
    ? "bottom-4 right-4 h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] md:bottom-8 md:right-8 md:h-[80vh] md:w-[720px]"
    : "bottom-6 right-6 h-[500px] w-[360px]";

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          aria-label="Open AI travel assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl ${chatSizeClasses}`}
        >
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold">AI Travel Assistant</h2>
              <p className="text-xs text-blue-100">
                Ask about destinations, budgets, and trip ideas
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={
                  isExpanded
                    ? "Shrink AI travel assistant"
                    : "Expand AI travel assistant"
                }
                className="rounded-full p-1 hover:bg-blue-500"
              >
                {isExpanded ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close AI travel assistant"
                className="rounded-full p-1 hover:bg-blue-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isExpanded ? "max-w-[70%]" : "max-w-[85%]"
                  } ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask about travel..."
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-700 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Verify prices, visas, safety rules, and availability before
              booking.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
