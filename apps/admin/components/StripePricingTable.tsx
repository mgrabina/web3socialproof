"use client"
import React, { useState, useEffect } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}
export default function StripePricingTable({ checkoutSessionSecret }: { checkoutSessionSecret: string }) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Missing Stripe Publishable Key")
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID) {
        throw new Error("Missing Stripe Pricing Table ID")
    }

    console.log("Publishable key", process.env.STRIPE_PUBLISHABLE_KEY)

    return (
        <stripe-pricing-table
            pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
            publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
            customer-session-client-secret={checkoutSessionSecret}
        >
        </stripe-pricing-table>
    )


};
