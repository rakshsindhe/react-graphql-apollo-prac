import { isLoggedIn, getAccessToken } from './auth';

const endpoint = 'http://localhost:9000/api';

export const graphqlRequests = async (query, variables = {}) => {
  const request = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  if (isLoggedIn()) {
    request.headers['authorization'] = 'Bearer ' + getAccessToken();
  }
  const response = await fetch(endpoint, request);

  const result = await response.json();
  if (result.errors) {
    const message = result.errors.map((e) => e.message).join('\n');
    throw new Error(message);
  }

  return result.data;
};

export const loadJobs = async () => {
  const query = `
    query {
      jobs{
        id
        title,
        company{
          id
          name
        }
      }
    }
    `;
  const response = await graphqlRequests(query);

  return response.jobs;
};

export const fetchJobDetails = async (id) => {
  const query = `query JobQuery($id: ID!){
        job(id:$id){
          id
          title
          description
          company{
            id
            name
          }
        } }`;

  const result = await graphqlRequests(query, { id });

  return result.job;
};

export const fetchCompanyDetails = async (id) => {
  const query = `
  query CompanyQuery($id: ID!){
    company(id:$id){
      id
      name
      description
      jobs{
      id
      title
    }
    }  
  }`;

  const result = await graphqlRequests(query, { id });

  return result.company;
};

export const createJob = async (input) => {
  const mutation = `
    mutation CreateJob($input: CreateJobInput){
        job : createJob(input: $input){
          id
          title
          description
          company{
            id
            name
          }
        }
      }`;

  const result = await graphqlRequests(mutation, { input });

  return result.job;
};
