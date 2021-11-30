const activeEnv =
  process.env.ACTIVE_ENV || process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: `.env.${activeEnv}`,
});

console.log(`Loaded ${activeEnv} env file`);

module.exports = {
  siteMetadata: {
    title: `Whitebrick`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`Shadows Into Light Two`],
        display: 'swap',
      },
    },
    `gatsby-plugin-gatsby-cloud`,
    `gatsby-plugin-typescript`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
