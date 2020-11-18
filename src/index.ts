import axios from 'axios';
import queryString from 'query-string';

axios.defaults.headers.get['x-psn-store-locale-override'] = 'en-FI';

type GameResponse = {
  data: {
    productRetrieve: {
      name: string;
      webctas: {
        price: {
          basePrice: string;
          discountText: string;
          discountedPrice: string;
          endTime: string;
        }
      }[];
    };
  }
};

const baseUrl = 'https://web.np.playstation.com/api/graphql/v1/op';

const storeBaseLink = 'https://store.playstation.com/en-fi/product';

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
  const response = await axios.get<GameResponse>(`${baseUrl}?${params}`);
  console.log(response.data.data.productRetrieve.webctas[0]);
})();
