/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@musicai/shared"],
  images: {
    domains: ["musicai-audio.s3.eu-west-3.amazonaws.com"],
  },
};

module.exports = nextConfig;
