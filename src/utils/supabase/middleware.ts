/* eslint-disable */

import { createServerClient } from "@supabase/ssr";
import { type User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return await handleAuthStatusRedirect(user, request, supabaseResponse);
}

async function handleAuthStatusRedirect(
  user: User | null,
  request: NextRequest,
  supabaseResponse: NextResponse,
): Promise<NextResponse> {
  console.log("user", user);

  function redirectTo(pathname: string) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;

    const newResponse = NextResponse.redirect(url);

    const cookies = supabaseResponse.cookies.getAll();
    for (const cookie of cookies) newResponse.cookies.set(cookie);

    return newResponse;
  }

  const isAuthenticated = Boolean(user);
  const { pathname } = request.nextUrl;

  if (isAuthenticated) {
    if (pathname !== "/login") return supabaseResponse;
    return redirectTo("/");
  } else {
    if (pathname === "/login") return supabaseResponse;
    return redirectTo("/login");
  }
}
