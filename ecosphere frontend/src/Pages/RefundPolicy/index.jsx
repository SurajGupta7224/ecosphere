import React from 'react';

const RefundPolicy = () => {
    return (
        <div className="bg-white text-slate-900 font-sans">
            {/* Page Header Banner */}
            <div className="relative w-full bg-slate-900 pt-32 pb-16 md:pt-48 md:pb-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 opacity-95"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-soft-light"></div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                        Refund & Cancellation Policy
                    </h1>
                    <div className="inline-block bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-4 py-1.5">
                        <p className="text-sm md:text-base text-emerald-100 font-medium">Ecosphere Waste Solutions | Last Updated: January 2025</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">1. Overview</h2>
                    <p className="leading-relaxed text-slate-700">
                        This Refund & Cancellation Policy outlines the terms governing refunds and cancellations for services provided by Ecosphere Waste Solutions. By using our services, you agree to the terms of this policy.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">2. Nature of Services</h2>
                    <p className="leading-relaxed text-slate-700">
                        Ecosphere Waste Solutions provides commercial waste collection and management services. Due to the nature of our services, once waste collection has been performed, the service is considered fully rendered and cannot be reversed.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">3. Refund Policy</h2>

                    <h3 className="font-semibold text-lg mt-4 mb-2">3.1 General Policy</h3>
                    <p className="leading-relaxed text-slate-700 mb-4">
                        No refunds will be provided for services that have already been rendered. Once our team has completed waste collection from your premises, the service is considered complete and payment is non-refundable.
                    </p>

                    <h3 className="font-semibold text-lg mt-4 mb-2">3.2 Exceptions</h3>
                    <p className="leading-relaxed text-slate-700 mb-2">Refunds may be considered in the following exceptional circumstances:</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-700">
                        <li><strong>Duplicate Payment:</strong> If you have been charged twice for the same service, the duplicate amount will be refunded.</li>
                        <li><strong>Service Not Provided:</strong> If payment was collected but the scheduled service was not performed due to our fault, a full refund will be processed.</li>
                        <li><strong>Billing Errors:</strong> If there is a verifiable error in the invoiced amount, the excess amount will be refunded.</li>
                    </ul>

                    <h3 className="font-semibold text-lg mt-4 mb-2">3.3 Refund Process</h3>
                    <p className="leading-relaxed text-slate-700 mb-4">
                        To request a refund under the exceptional circumstances listed above: submit a written request to <a href="mailto:info@ecospherewm.com" className="text-emerald-600 hover:underline">info@ecospherewm.com</a> within 7 days of the transaction, include your order/transaction ID and reason for the refund request, and provide any supporting documentation. Our team will review your request and respond within 5-7 business days.
                    </p>

                    <h3 className="font-semibold text-lg mt-4 mb-2">3.4 Refund Timeline</h3>
                    <p className="leading-relaxed text-slate-700">
                        Approved refunds will be processed within 7-10 business days. The refund will be credited to the original payment method used. Bank processing times may vary, and it may take an additional 5-7 business days for the amount to reflect in your account.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">4. Cancellation Policy</h2>

                    <h3 className="font-semibold text-lg mt-4 mb-2">4.1 Cancellation by Customer</h3>
                    <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-4">
                        <li><strong>Before Service Execution:</strong> You may cancel a scheduled pickup at least 24 hours before the scheduled time without any charges.</li>
                        <li><strong>Less Than 24 Hours Notice:</strong> Cancellations made less than 24 hours before the scheduled service may be subject to a cancellation fee.</li>
                        <li><strong>After Service Commencement:</strong> Once our collection team has arrived at your premises, cancellation is not permitted, and full charges will apply.</li>
                    </ul>

                    <h3 className="font-semibold text-lg mt-4 mb-2">4.2 How to Cancel</h3>
                    <p className="leading-relaxed text-slate-700 mb-4">
                        To cancel a scheduled service: use the cancellation option in the Ecosphere app, call us at <a href="tel:+916363865658" className="text-emerald-600 hover:underline">+91 63638 65658</a>, or email <a href="mailto:info@ecospherewm.com" className="text-emerald-600 hover:underline">info@ecospherewm.com</a> with your booking details.
                    </p>

                    <h3 className="font-semibold text-lg mt-4 mb-2">4.3 Cancellation by Ecosphere</h3>
                    <p className="leading-relaxed text-slate-700">
                        We reserve the right to cancel or reschedule services due to: inclement weather or natural disasters, vehicle breakdown or operational issues, safety concerns at the collection site, or non-compliance with waste segregation requirements. In such cases, we will notify you promptly and reschedule at no additional cost.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">5. Service Modifications</h2>
                    <p className="leading-relaxed text-slate-700">
                        If you need to modify a scheduled service (change time, date, or location), please contact us at least 24 hours in advance. Modifications are subject to availability and may require rescheduling.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">6. Disputes</h2>
                    <p className="leading-relaxed text-slate-700">
                        If you have any concerns about charges or services, please contact our customer support team within 7 days of the service date. We are committed to resolving disputes fairly and promptly.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">7. Payment Gateway Refunds</h2>
                    <p className="leading-relaxed text-slate-700">
                        All refunds are processed through our payment gateway, Razorpay, PhonePe etc. The refund timeline and process are subject to payment gateway provider policies and your bank's processing times. We are not responsible for delays caused by third-party payment processors or banking institutions.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">8. Changes to This Policy</h2>
                    <p className="leading-relaxed text-slate-700">
                        We reserve the right to modify this Refund & Cancellation Policy at any time. Changes will be effective upon posting to our application. Your continued use of our services constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-emerald-700">9. Contact Us</h2>
                    <p className="leading-relaxed text-slate-700">
                        For refund requests or questions about this policy:<br />
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

export default RefundPolicy;
