"use client";

import { useState } from "react";

const faqData = [
  { q: "What is Farhan.Dev?", a: "A personal technical publication focused on software architecture, systems engineering, and the craft of high-quality software." },
  { q: "What topics do you cover?", a: "Deep dives into Node.js, Next.js, Distributed Systems, and the occasional personal meditation on technical growth." },
  { q: "How often do you post?", a: "New long-form articles are released bi-weekly, with smaller insights and 'Today I Learned' snippets appearing more frequently." },
  { q: "Can I collaborate or guest post?", a: "While this is primarily a personal journal, I am always open to technical discussions and collaborative open-source ventures." },
  { q: "Where can I follow you?", a: "I am most active on LinkedIn and X. You can find links to all my social profiles in the footer below." },
];

export function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? -1 : i);

  return (
    <div className="faq-right">
      {faqData.map((item, i) => (
        <div
          key={i}
          className={`faq-item ${openFaq === i ? "open" : ""}`}
          onClick={() => toggleFaq(i)}
        >
          <div className="faq-question">
            {item.q}
            <div className="faq-icon">+</div>
          </div>
          <div className="faq-answer">{item.a}</div>
        </div>
      ))}
    </div>
  );
}
