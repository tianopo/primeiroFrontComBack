import { ChatCircleDots } from "@phosphor-icons/react";

interface IFloatingWhatsApp {
  phoneInternational?: string;
  message?: string;
}

export const FloatingWhatsApp = ({
  phoneInternational,
  message = "preciso de ajuda",
}: IFloatingWhatsApp) => {
  const encodedMsg = encodeURIComponent(message.trim());
  const href = phoneInternational
    ? `https://wa.me/${phoneInternational}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contato Whatsapp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-green-300"
    >
      <ChatCircleDots size={28} weight="fill" className="text-white" />

      {/* Tooltip */}
      <span className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow-md group-hover:block">
        Contato Whatsapp
      </span>
    </a>
  );
};
