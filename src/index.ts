import axios from 'axios';
import queryString from 'query-string';

const baseUrl = 'https://web.np.playstation.com/api/graphql/v1/op';

const variables = {
  productId: 'EP1004-CUSA08519_00-REDEMPTION000002'
};
const extensions = {
  persistedQuery: {
    version: 1,
    sha256Hash: '8532da7eda369efdad054ca8f885394a2d0c22d03c5259a422ae2bb3b98c5c99',
  }
} ;
const queryParams = {
  operationName: 'productRetrieveForCtasWithPrice',
  variables: JSON.stringify(variables),
  extensions: JSON.stringify(extensions),
};
const params = queryString.stringify(queryParams);

(async () => {
  const response = await axios.get(`${baseUrl}?${params}`);
  console.log(response.data.data.productRetrieve.webctas);
})();
