"use server";
import { createSupabaseClientForServerSide } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createStripeCustomer } from "@/utils/stripe/api";
import { db, eq, protocolTable, usersTable } from "@web3socialproof/db";
import { PUBLIC_URL } from "@/lib/constants";

export async function resetPassword(
  currentState: { message: string },
  formData: FormData
) {
  const supabase = createSupabaseClientForServerSide();
  const passwordData = {
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
    code: formData.get("code") as string,
  };
  if (passwordData.password !== passwordData.confirm_password) {
    return { message: "Passwords do not match" };
  }

  const { data } = await supabase.auth.exchangeCodeForSession(
    passwordData.code
  );

  let { error } = await supabase.auth.updateUser({
    password: passwordData.password,
  });
  if (error) {
    return { message: error.message };
  }
  redirect(`/forgot-password/reset/success`);
}

export async function forgotPassword(
  currentState: { message: string },
  formData: FormData
) {
  const supabase = createSupabaseClientForServerSide();
  const email = formData.get("email") as string;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${PUBLIC_URL()}/forgot-password/reset`,
  });

  if (error) {
    return { message: error.message };
  }
  redirect(`/forgot-password/success`);
}
export async function signup(
  currentState: { message: string },
  formData: FormData
) {
  const supabase = createSupabaseClientForServerSide();

  const dataToInsert = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data, error } = await supabase.auth.signUp(dataToInsert);

  console.log("data", data);
  console.log("error", error);

  if (error) {
    return { message: error.message };
  }

  if (error) {
    redirect("/error");
  }

  const user = data?.user;

  console.log("user", user);

  if (!user?.id || !user?.email) {
    console.log("no user id or email");
    redirect("/error");
  }

  // create Stripe Customer Record
  const stripeID = await createStripeCustomer(user?.id, user?.email, "");
  // Create record in DB
  const protocolInDb = await db
    .insert(protocolTable)
    .values({
      stripe_id: stripeID,
      plan: "none",
    })
    .returning();

  if (!protocolInDb.length) {
    redirect("/error");
  }

  await db.insert(usersTable).values({
    name: "",
    email: user!.email!,
    protocol_id: protocolInDb[0].id,
  });

  revalidatePath("/", "layout");
  redirect("/subscribe");
}

export async function loginUser(
  currentState: { message: string },
  formData: FormData
) {
  const supabase = createSupabaseClientForServerSide();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = createSupabaseClientForServerSide();
  const { error } = await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = createSupabaseClientForServerSide();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${PUBLIC_URL()}/auth/callback`,
    },
  });

  console.log("data", data);

  if (data.url) {
    redirect(data.url); // use the redirect API for your server framework
  }
}

export async function signInWithGithub() {
  const supabase = createSupabaseClientForServerSide();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${PUBLIC_URL()}/auth/callback`,
    },
  });

  console.log("data", data);

  if (data.url) {
    redirect(data.url); // use the redirect API for your server framework
  }
}
