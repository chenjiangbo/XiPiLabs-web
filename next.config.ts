import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
};

export default withContentlayer(nextConfig);
