"use client";

export function NewsletterForm() {
  return (
    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
      <input className="newsletter-input" type="email" placeholder="Enter Your Email" />
      <button type="submit" className="btn-orange">Join Now</button>
    </form>
  );
}
