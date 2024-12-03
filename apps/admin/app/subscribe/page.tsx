import StripePricingTable from "@/components/StripePricingTable";
import Image from "next/image";
import { createSupabaseClientForServerSide } from "@/utils/supabase/server";
import { createStripeCheckoutSession } from "@/utils/stripe/api";
export default async function Subscribe() {
  const supabase = createSupabaseClientForServerSide();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const checkoutSessionSecret = await createStripeCheckoutSession(user!.email!);

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      
      <div className="w-full py-20 lg:py-32 xl:py-40">
        <div className="text-center py-6 md:py-10 lg:py-12 ">
          <h1 className="font-bold text-xl md:text-3xl lg:text-4xl ">
            Pricing
          </h1>
          <h1 className="pt-4 text-muted-foreground text-sm md:text-md lg:text-lg">
            Choose the right plan for your team! Cancel anytime!
          </h1>
        </div>
        <StripePricingTable checkoutSessionSecret={checkoutSessionSecret} />
      </div>
    </div>
  );
}
