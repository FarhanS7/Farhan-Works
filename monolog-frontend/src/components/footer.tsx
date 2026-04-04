"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        {/* SERVICE */}
        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link href="/posts">Articles</Link></li>
            <li><Link href="/series">Series</Link></li>
            <li><Link href="/about">About</Link></li>
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
              <span>Dhaka, Bangladesh</span>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <span>+8801554313374</span>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉</div>
              <span>farhan.official0007@gmail.com</span>
            </div>
          </div>
        </div>

        {/* BRAND + SOCIAL */}
        <div className="footer-brand">
          <h3>Exploring the intersection of<br />code, systems, and craft.</h3>
          <div className="social-links">
            <a href="https://www.facebook.com/farhan.shahriar.5264" target="_blank" rel="noopener noreferrer" className="social-btn">f</a>
            <a href="https://www.linkedin.com/in/farhan-shahriar1/" target="_blank" rel="noopener noreferrer" className="social-btn">in</a>
            <a href="https://x.com/FarhanShah29986" target="_blank" rel="noopener noreferrer" className="social-btn">𝕏</a>
          </div>
        </div>
      </div>

      {/* Giant brand wordmark */}
      <div className="footer-wordmark">Farhan.Dev</div>

      {/* Copyright */}
      <div className="footer-bottom">
        © 2024 Farhan.Dev. All rights reserved.
      </div>
    </footer>
  );
}
