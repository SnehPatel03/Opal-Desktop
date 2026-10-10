import React, { useEffect, useState } from "react";
import {
  SignIn,
  SignUp,
  Show,
  UserButton,
} from "@clerk/electron/react";

const AuthButton = () => {
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up" | null>(
    null,
  );

  useEffect(() => {
    const syncAuthMode = () => {
      const route = window.location.hash.slice(1).split("?")[0];
      if (route.startsWith("/sign-up")) {
        setAuthMode("sign-up");
      } else if (route.startsWith("/sign-in")) {
        setAuthMode("sign-in");
      }
    };

    window.addEventListener("hashchange", syncAuthMode);
    return () => window.removeEventListener("hashchange", syncAuthMode);
  }, []);

  return (
    <>
      <div className="flex items-center">
        <Show when="signed-out">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="
                non-draggable
                rounded-xl
                border border-white/10
                bg-white/10
                px-4 py-2
                text-sm font-medium
                text-white
                transition-all
                hover:bg-white/20
              "
              onClick={() => setAuthMode("sign-in")}
            >
              Sign In
            </button>

            <button
              type="button"
              className="
                non-draggable
                rounded-xl
                bg-white
                px-4 py-2
                text-sm font-medium
                text-black
                transition-all
                hover:bg-gray-200
              "
              onClick={() => setAuthMode("sign-up")}
            >
              Sign Up
            </button>
          </div>
        </Show>

        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </Show>
      </div>

      <Show when="signed-out">
        {authMode && (
          <div className="non-draggable fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto rounded-xl bg-zinc-950/95 p-3">
            <div className="relative flex max-h-full w-full max-w-sm flex-col items-center overflow-y-auto rounded-xl">
              <button
                type="button"
                aria-label="Close sign in"
                className="absolute right-2 top-2 z-10 rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-white/10 hover:text-white"
                onClick={() => setAuthMode(null)}
              >
                Close
              </button>
              <div className="w-full pt-8">
                {authMode === "sign-in" ? (
                  <SignIn routing="hash" signUpUrl="#/sign-up" />
                ) : (
                  <SignUp routing="hash" signInUrl="#/sign-in" />
                )}
              </div>
            </div>
          </div>
        )}
      </Show>
    </>
  );
};

export default AuthButton;
