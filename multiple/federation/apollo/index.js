const { ApolloServer } = require("apollo-server");
const { ApolloGateway, IntrospectAndCompose } = require("@apollo/gateway");

// Make sure to read env variables
const libraryUrl = process.env.LIBRARY_URL;
const radioUrl = process.env.RADIO_URL;

if (!libraryUrl || !radioUrl) {
  throw new Error(
    "Both LIBRARY_URL and RADIO_URL environment variables must be set"
  );
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "library", url: libraryUrl },
      { name: "radio", url: radioUrl },
    ],
  }),
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
});

server.listen({ port: 4000, host: "0.0.0.0" }).then(({ url }) => {
  console.log(`Apollo Gateway running at ${url}`);
});
