// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     output: 'standalone',
//     reactStrictMode: true,
//     env: {
//         NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
//         NEXT_PUBLIC_URL_SERVICE: process.env.NEXT_PUBLIC_URL_SERVICE,
//         NEXT_PUBLIC_REDIRECT_BASE: process.env.NEXT_PUBLIC_REDIRECT_BASE,
//     },
//     images: {
//         remotePatterns: [],
//     },
// };

// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    // Next.js automatically makes NEXT_PUBLIC_ vars available to the client.
    // Explicitly mapping them in 'env' is fine, but usually redundant.
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

module.exports = nextConfig;