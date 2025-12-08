import { boot } from 'quasar/wrappers';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // your backend
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default boot(({ app }) => {
  app.config.globalProperties.$apollo = apolloClient;
});

export { apolloClient };
