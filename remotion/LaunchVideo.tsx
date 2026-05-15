import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TheHook } from "./scenes/TheHook";
import { TheProblem } from "./scenes/TheProblem";
import { TheMagic } from "./scenes/TheMagic";
import { FeaturesFlash } from "./scenes/FeaturesFlash";
import { CTA } from "./scenes/CTA";

export const LaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence from={0} durationInFrames={90}>
        <TheHook />
      </Sequence>
      <Sequence from={90} durationInFrames={150}>
        <TheProblem />
      </Sequence>
      <Sequence from={240} durationInFrames={300}>
        <TheMagic />
      </Sequence>
      <Sequence from={540} durationInFrames={210}>
        <FeaturesFlash />
      </Sequence>
      <Sequence from={750} durationInFrames={210}>
        <CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
