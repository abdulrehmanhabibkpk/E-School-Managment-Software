import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client';

let apolloInstance: ApolloClient<NormalizedCacheObject> | null = null;

export const getApolloClient = () => {
  if (apolloInstance) return apolloInstance;

  const httpLink = new HttpLink({
    uri: 'https://your-graphql-endpoint.com/graphql', // Placeholder as per user's GetDogs example
    // Ensure we use the native fetch to avoid potential polyfill collisions
    fetch: (input: RequestInfo | URL, init?: RequestInit) => window.fetch(input, init),
  });

  apolloInstance = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    connectToDevTools: false,
  });

  return apolloInstance;
};
