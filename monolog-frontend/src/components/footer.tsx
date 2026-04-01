"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        {/* SERVICE */}
        <div className="footer-col">
          <h4>Service</h4>
          <ul>
            <li><Link href="#">Case Studies</Link></li>
            <li><Link href="#">Insights</Link></li>
            <li><Link href="#">Contact Us</Link></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link href="#">Privacy Policy</Link></li>
            <li><Link href="#">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-col">
          <h4>Contact</h4>
          <div className="footer-contact">
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <span>Floor 8, Building a One Central, DWTC, Dubai, UAE</span>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <span>+971 50 324 3460</span>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉</div>
              <span>hello@inneraktive.com</span>
            </div>
          </div>
        </div>

        {/* BRAND + SOCIAL */}
        <div className="footer-brand">
          <h3>Unlock Your Potential with<br />no-code Solutions</h3>
          <div className="social-links">
            <a href="#" className="social-btn">f</a>
            <a href="#" className="social-btn">in</a>
            <a href="#" className="social-btn">𝕏</a>
            <a href="#" className="social-btn">▶</a>
          </div>
        </div>
      </div>

      {/* Giant brand wordmark */}
      <div className="footer-wordmark">INNERAKTIVE</div>

      {/* Copyright */}
      <div className="footer-bottom">
        © 2024 Inneraktive FZE. All rights reserved.
      </div>
    </footer>
  );
}
