import { Hero } from "@/components/sections/Hero";
import { Identity } from "@/components/sections/Identity";
import { Coding } from "@/components/sections/Coding";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Playground } from "@/components/sections/Playground";
import { Process } from "@/components/sections/Process";
import { Tools } from "@/components/sections/Tools";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Hero /><Identity /><Coding /><About /><Projects /><Skills />
      <Playground /><Process /><Tools /><Contact />
    </main>
  );
}
