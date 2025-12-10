import type { Component } from "solid-js";
import { Button } from "@/components/ui/button";

const App: Component = () => {
  return (
    <>
      <p class="text-4xl text-primary text-center py-20">Hello tailwind!</p>
      <Button onClick={() => alert("asdf")}>Hello</Button>
    </>
  );
};

export default App;
