import { isLoggedIn, getAccessToken } from './auth';
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  gql,
} from 'apollo-boost';

const endpoint = 'http://localhost:9000/api';

const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    operation.setContext({
      headers: {
        authorization: 'Bearer ' + getAccessToken(),
      },
    });
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: endpoint })]),
  cache: new InMemoryCache(),
});

export const loadJobs = async () => {
  const query = gql`
    query {
      jobs {
        id
        title
        company {
          id
          name
        }
      }
    }
  `;
  const {
    data: { jobs },
  } = await client.query({ query });
  return jobs;
};

export const fetchJobDetails = async (id) => {
  const query = gql`
    query JobQuery($id: ID!) {
      job(id: $id) {
        id
        title
        description
        company {
          id
          name
        }
      }
    }
  `;

  const {
    data: { job },
  } = await client.query({ query, variables: { id } });

  return job;
};

export const fetchCompanyDetails = async (id) => {
  const query = gql`
    query CompanyQuery($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          title
        }
      }
    }
  `;

  const {
    data: { company },
  } = await client.query({ query, variables: { id } });

  return company;
};

export const createJob = async (input) => {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput) {
      job: createJob(input: $input) {
        id
        title
        description
        company {
          id
          name
        }
      }
    }
  `;

  const {
    data: { job },
  } = await client.mutate({ mutation, variables: { input } });

  return job;
};
