import { AsciiShine } from "./ascii-shine";
import { ASCII_NAME } from "@/utils/ascii";
import { contact } from "@/utils/constants";

const link =
  "underline decoration-black/30 underline-offset-4 hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

export function ReachMe() {
  return (
    <section
      id="contact"
      className="8️⃣ row-8 min-w-0 space-y-10 p-2 md:p-5 text-gray-700"
    >
      <div className="space-y-4">
        <h2 className="uppercase font-bold text-black/70 tracking-wider">
          03 / Reach me
        </h2>
        <p className="text-sm">
          <a href={contact.x} target="_blank" rel="noopener noreferrer" className={link}>
            {contact.xHandle}
          </a>
          {" · "}
          <a href={`mailto:${contact.email}`} className={link}>
            {contact.email}
          </a>
        </p>
      </div>

      <div className="overflow-hidden">
        <span className="sr-only">felipetodev</span>
        <AsciiShine
          text={ASCII_NAME}
          className="select-none leading-none text-gray-500/70 text-[clamp(4px,1.1vw,9px)] whitespace-pre"
        />
      </div>
    </section>
  );
}
