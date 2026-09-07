import { SourceDeviceprops } from "@/hooks/useMediaSource";
import { useStudioSettings } from "@/hooks/useStudioSettings";
import { ChevronDown, Headphones, Monitor, Settings2 } from "lucide-react";

type Props = {
  state: SourceDeviceprops;
  user:
    | ({
        subscription: {
          plan: "FREE" | "PRO";
        } | null;
        studio: {
          id: string;
          screen: string | null;
          mic: string | null;
          camera: string | null;
          preset: "HD" | "SD";
          userId: string | null;
        } | null;
      } & {
        id: string;
        email: string;
        firstname: string | null;
        lastname: string | null;
        createdAt: Date;
        clerkid: string;
      })
    | null;
};

const MediaConfig = ({ user, state }: Props) => {
  const { register } = useStudioSettings(
    user?.studio?.id ?? "",
    user?.studio?.screen || state.displays?.[0]?.id,
    user?.studio?.mic || state.audioInputs?.[0]?.deviceId,
    user?.studio?.preset,
    user?.subscription?.plan,
  );

  if (!user) {
    return null;
  }

  const selectClass = `
   h-10
      w-full
      appearance-none
      rounded-2xl
      border border-white/[0.10]
      bg-[#171717]
      px-3
      pr-12
      text-sm
      text-zinc-200
      outline-none
      cursor-pointer
      transition-all
      duration-200
      hover:border-white/[0.18]
      hover:bg-[#1a1a1a]
      focus:border-[#FF4C0F]/50
      focus:ring-2
      focus:ring-[#FF4C0F]/10
  `;

  const iconContainerClass = `
    flex
    h-10
    w-10
    shrink-0
    items-center
    justify-center
    rounded-2xl
    border
    border-white/[0.08]
    bg-white/[0.04]
    text-zinc-400
    transition-all
    duration-200
  `;

  const arrowClass = `
   pointer-events-none
      absolute
      right-4
      top-1/2
      -translate-y-1/2
      text-zinc-400
  `;

  return (
    <form className="relative w-full space-y-2.5">
      {/* ==================== SCREEN ==================== */}
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <div className={iconContainerClass}>
          <Monitor size={17} strokeWidth={1.8} />
        </div>

        {/* Select */}
        <div className="relative min-w-0 flex-1">
          <select
            {...register("screen")}
            className=" h-10
      w-full
      appearance-none
      rounded-2xl
      border border-white/[0.10]
      bg-[#171717]
      px-3
      pr-12
      text-sm
      text-zinc-200
      outline-none
      cursor-pointer
      transition-all
      duration-200
      hover:border-white/[0.18]
      hover:bg-[#1a1a1a]
      focus:border-[#FF4C0F]/50
      focus:ring-2
      focus:ring-[#FF4C0F]/10"
          >
            {!state.displays?.length && (
              <option value="" disabled>
                No screens or windows found
              </option>
            )}

            {state.displays?.map((display) => (
              <option
                value={display.id}
                key={display.id}
                className="bg-[#171717] text-zinc-200"
              >
                {display.name}
              </option>
            ))}
          </select>

          {/* Left dropdown arrow */}
          <ChevronDown  size={17}
    strokeWidth={1.8}
    className="
      pointer-events-none
      absolute
      right-4
      top-1/2
      -translate-y-1/2
      text-zinc-400
    " />
        </div>
      </div>

      {/* ==================== AUDIO ==================== */}
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <div className={iconContainerClass}>
          <Headphones size={17} strokeWidth={1.8} />
        </div>

        {/* Select */}
        <div className="relative min-w-0 flex-1">
          <select {...register("audio")} className={selectClass}>
            {!state.audioInputs?.length && (
              <option value="" disabled>
                No microphones found
              </option>
            )}

            {state.audioInputs?.map((device) => (
              <option
                value={device.deviceId}
                key={device.deviceId}
                className="bg-[#171717] text-zinc-200"
              >
                {device.label || "Microphone (permission required)"}
              </option>
            ))}
          </select>

          {/* Left dropdown arrow */}
          <ChevronDown size={17} strokeWidth={1.8} className={arrowClass} />
        </div>
      </div>

      {/* ==================== QUALITY ==================== */}
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <div className={iconContainerClass}>
          <Settings2 size={17} strokeWidth={1.8} />
        </div>

        {/* Select */}
        <div className="relative min-w-0 flex-1">
          <select {...register("preset")} className={selectClass}>
            <option
              disabled={user.subscription?.plan === "FREE"}
              value="HD"
              className="bg-[#171717] text-zinc-200"
            >
              1080p
            </option>

            <option value="SD" className="bg-[#171717] text-zinc-200">
              720p
            </option>
          </select>

          {/* Left dropdown arrow */}
          <ChevronDown size={17} strokeWidth={1.8} className={arrowClass} />
        </div>
      </div>
    </form>
  );
};

export default MediaConfig;
