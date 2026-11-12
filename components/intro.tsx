export function Intro() {
  return (
    <section className="2️⃣ row-2 space-y-8 p-2 md:p-5">
      <div className="grid text-black/70">
        <h1 className="text-lg font-bold tracking-wider">
          ~/felipetodev
        </h1>
        <p className="tracking-wide">a fullstack web developer</p>
        <span className="text-sm text-gray-500">based in santiago, chile</span>
      </div>
      <p className="text-gray-700 text-sm text-balance whitespace-pre-line">
        {`I'm a software engineer who has always been drawn to the visual side of
        products: design systems, UI polish, and making things feel good to use,
        for users/devs experience.\n\nLately I'm deep into AI-powered apps, building
        agents and workflows, and observability (evals, metrics, traces), so they
        actually solve real-world tasks.`}
      </p>
    </section>
  );
}
