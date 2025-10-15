const { ApolloServer } = require("apollo-server");
const { ApolloGateway, IntrospectAndCompose } = require("@apollo/gateway");

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
    pollIntervalInMs: 10000,
  }),
  debug: true,
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  introspection: true,
  playground: true,
});

async function startServer() {
  try {
    const { url } = await server.listen({ port: 4000, host: "0.0.0.0" });
    console.log(`Playground ${url}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

startServer();
