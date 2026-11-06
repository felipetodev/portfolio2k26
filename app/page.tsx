import fs from "node:fs";
import path from "node:path";
import { Divider } from "@/components/divider";
import { Intro } from "@/components/intro";
import { Projects } from "@/components/projects";
import { Terminal } from "@/components/terminal";

export default function Portfolio() {
  const agentsContent = fs.readFileSync(
    path.join(process.cwd(), "./AGENTS.md"),
    "utf-8",
  );
  return (
    <main className="flex flex-col flex-1 items-center justify-center bg-[#E7E5E4] px-3 md:px-6 overflow-hidden">
      <div className="grid grid-cols-[var(--fluid-col)_1fr_var(--fluid-col)] grid-rows-[repeat(6,auto)_1fr_repeat(4,auto)] max-w-4xl w-full min-h-screen mx-auto border-x border-dashed border-black/30">
        <div className="grid grid-rows-subgrid col-2 row-[1/11] border-x border-gray-500/20">
          {/* row 1 */}
          <section className="1️⃣ relative h-10 row-1 before:content before:absolute before:h-px before:w-[200vw] before:border-b before:border-black/30 before:border-dashed before:left-1/2 before:-translate-x-1/2 before:-bottom-px" />
          {/* row 2 */}
          <Intro />
          {/* row 3 */}
          <Divider className="3️⃣ row-3" />
          {/* row 5 */}
          <Projects markdown={agentsContent} />
          {/* row 6 */}
          <Divider className="6️⃣ row-6" />
          <Terminal />
        </div>
      </div>
    </main>
  );
}
