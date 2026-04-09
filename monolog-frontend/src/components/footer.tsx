"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-px pb-14">
        <div className="footer-top flex flex-col md:flex-row gap-10 md:gap-16">
          {/* SERVICE */}
          <div className="footer-col flex-1">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/posts">Articles</Link></li>
              <li><Link href="/series">Series</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="footer-col flex-1">
            <h4>Legal</h4>
            <ul>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="footer-col flex-[2]">
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
          <div className="footer-brand flex-1 text-left md:text-right">
            <h3 className="text-xl font-bold mb-4">Exploring the intersection of<br />code, systems, and craft.</h3>
            <div className="social-links justify-start md:justify-end">
              <a href="https://www.facebook.com/farhan.shahriar.5264" target="_blank" rel="noopener noreferrer" className="social-btn">f</a>
              <a href="https://www.linkedin.com/in/farhan-shahriar1/" target="_blank" rel="noopener noreferrer" className="social-btn">in</a>
              <a href="https://x.com/FarhanShah29986" target="_blank" rel="noopener noreferrer" className="social-btn">𝕏</a>
            </div>
          </div>
        </div>

        {/* Giant brand wordmark */}
        <div className="footer-wordmark mt-10">Farhan.Dev</div>

        {/* Copyright */}
        <div className="footer-bottom border-t border-foot-b pt-6 text-center">
          © {new Date().getFullYear()} Farhan.Dev. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
