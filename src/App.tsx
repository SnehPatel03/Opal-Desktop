import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import ControlLayout from "./layouts/ControlLayout";
import AuthButton from "./components/Global/AuthButton";
import Widget from "./components/Global/Widget";
const client = new QueryClient();
const isClerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

function App() {
  return (
    <QueryClientProvider client={client}>
      <ControlLayout>
        {isClerkConfigured ? (
          <>
            <AuthButton />
            <Widget />
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-gray-200">
            <h1 className="text-lg font-medium">Opal</h1>
            <p className="mt-1 text-sm text-gray-400">
              The app shell is running. Add VITE_CLERK_PUBLISHABLE_KEY to enable sign-in.
            </p>
          </div>
        )}
      </ControlLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
