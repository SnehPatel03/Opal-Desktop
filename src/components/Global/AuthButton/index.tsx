import React from "react";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";

const AuthButton = () => {
  return (
    <div className="flex items-center">
      <Show when="signed-out">
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <button
              type="button"
              className="
                rounded-xl
                border border-white/10
                bg-white/10
                px-4 py-2
                text-sm font-medium
                text-white
                transition-all
                hover:bg-white/20
              "
            >
              Sign In
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button
              type="button"
              className="
                rounded-xl
                bg-white
                px-4 py-2
                text-sm font-medium
                text-black
                transition-all
                hover:bg-gray-200
              "
            >
              Sign Up
            </button>
          </SignUpButton>
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
  );
};

export default AuthButton;
