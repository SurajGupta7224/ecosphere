import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-white text-slate-900 font-sans">
            {/* Page Header Banner */}
            <div className="relative w-full bg-slate-900 pt-32 pb-16 md:pt-48 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 opacity-95"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-soft-light"></div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                        Privacy Policy
                    </h1>
                    <div className="inline-block bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-4 py-1.5">
                        <p className="text-sm md:text-base text-emerald-100 font-medium">Ecosphere Waste Solutions | Last Updated: January 2025</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">1. Introduction</h2>
                    <p className="leading-relaxed text-slate-700 mb-4">
                        Ecosphere Waste Solutions ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services for commercial waste management.
                    </p>
                    <p className="leading-relaxed text-slate-700">
                        By using our application, you consent to the data practices described in this policy. If you do not agree with the terms of this privacy policy, please do not access the application.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">2. Information We Collect</h2>

                    <h3 className="font-semibold text-lg mt-4 mb-2">2.1 Personal Information</h3>
                    <p className="leading-relaxed text-slate-700 mb-4">
                        We collect information that you voluntarily provide to us when registering for the application, including: name and contact details (email address, phone number), business name and address, GST number (if applicable), and service location details.
                    </p>

                    <h3 className="font-semibold text-lg mt-4 mb-2">2.2 Payment Information</h3>
                    <p className="leading-relaxed text-slate-700 mb-4 font-semibold text-red-500">
                        Important: When you make a payment through our application, your payment is processed by our third-party payment gateway, Razorpay, PhonePe etc. We do NOT store or have access to your complete credit/debit card numbers, CVV, or banking credentials.
                    </p>
                    <p className="leading-relaxed text-slate-700 mb-4">
                        The payment information we may collect and store includes: transaction IDs and payment confirmation details, payment method type (UPI, Card, Net Banking, etc.), billing address, and payment history and invoice records.
                    </p>

                    <h3 className="font-semibold text-lg mt-4 mb-2">2.3 Service Usage Data</h3>
                    <p className="leading-relaxed text-slate-700">
                        We automatically collect certain information when you use our services, including: waste collection records (weight, type, frequency), pickup schedules and service history, location data for pickup services, and device information and app usage analytics.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">3. Payment Processing & Security</h2>

                    <h3 className="font-semibold text-lg mt-4 mb-2">3.1 Payment Methods Accepted</h3>
                    <p className="leading-relaxed text-slate-700 mb-4">
                        We accept payments through: Credit and Debit Cards (Visa, MasterCard, RuPay, American Express), UPI (Google Pay, PhonePe, Paytm, BHIM, etc.), Net Banking, and Mobile Wallets.
                    </p>

                    <h3 className="font-semibold text-lg mt-4 mb-2">3.3 Payment Data Security</h3>
                    <p className="leading-relaxed text-slate-700">
                        Your payment information is encrypted using SSL/TLS technology during transmission. Razorpay, PhonePe maintains PCI-DSS Level 1 compliance, the highest level of certification in the payments industry. We implement additional security measures including two-factor authentication for sensitive operations, regular security audits, encrypted data storage, and access controls and monitoring.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">4. How We Use Your Information</h2>
                    <ul className="list-disc pl-5 space-y-2 text-slate-700">
                        <li>Provide and maintain our waste collection services</li>
                        <li>Process payments and send invoices</li>
                        <li>Communicate with you about services, schedules, and updates</li>
                        <li>Improve our application and services</li>
                        <li>Comply with legal obligations and resolve disputes</li>
                        <li>Send promotional communications (with your consent)</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">5. Disclosure of Your Information</h2>
                    <p className="leading-relaxed text-slate-700">
                        We may share your information with: Payment Processors (Razorpay, PhonePe etc.) to process transactions; Service Providers who assist in our operations; Legal Authorities when required by law; and Business Partners for recycling and waste processing (anonymized data only).
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">6. Data Retention</h2>
                    <p className="leading-relaxed text-slate-700">
                        We retain your personal information for as long as your account is active or as needed to provide services. Payment records are retained for 7 years as required by Indian tax regulations. You may request deletion of your data, subject to legal retention requirements.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">7. Your Rights</h2>
                    <p className="leading-relaxed text-slate-700">
                        Under applicable Indian data protection laws, you have the right to: access your personal data, correct inaccurate information, request deletion of your data (subject to legal requirements), opt-out of marketing communications, and withdraw consent for data processing.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">8. Cookies and Tracking</h2>
                    <p className="leading-relaxed text-slate-700">
                        Our application may use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your device settings.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">9. Children's Privacy</h2>
                    <p className="leading-relaxed text-slate-700">
                        Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">10. Changes to This Policy</h2>
                    <p className="leading-relaxed text-slate-700">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">11. Contact Us</h2>
                    <p className="leading-relaxed text-slate-700">
                        If you have questions about this Privacy Policy or our data practices, please contact us:<br />
                        <strong>Ecosphere Waste Solutions</strong><br />
                        No 201, Dhammanagi Zeus Apartment, Millers Tank Bund Rd, Vasanth Nagar, Bangalore, Karnataka 560034<br />
                        Email: <a href="mailto:info@ecospherewm.com" className="text-emerald-600 hover:underline">info@ecospherewm.com</a><br />
                        Phone: <a href="tel:+916363865658" className="text-emerald-600 hover:underline">+91 63638 65658</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
