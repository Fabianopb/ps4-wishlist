import axios from 'axios';
import queryString from 'query-string';

axios.defaults.headers.get['x-psn-store-locale-override'] = 'en-FI';

const wishlist = [
  { id: 'EP1004-CUSA08519_00-REDEMPTION000002', hash: '8532da7eda369efdad054ca8f885394a2d0c22d03c5259a422ae2bb3b98c5c99' }
];

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

const promises = wishlist.map(game => {
  const variables = { productId: game.id };
  const extensions = { persistedQuery: { version: 1, sha256Hash: game.hash } };
  const queryParams = {
    operationName: 'productRetrieveForCtasWithPrice',
    variables: JSON.stringify(variables),
    extensions: JSON.stringify(extensions),
  };
  const params = queryString.stringify(queryParams);
  return axios.get<GameResponse>(`${baseUrl}?${params}`);
});

(async () => {
  const responses = await Promise.all(promises);
  const output = responses.map(res => ({
    name: res.data.data.productRetrieve.name,
    normalPrice: res.data.data.productRetrieve.webctas[0].price.basePrice,
    discountPrice: res.data.data.productRetrieve.webctas[0].price.discountedPrice,
    discount: res.data.data.productRetrieve.webctas[0].price.discountText,
    endTime: res.data.data.productRetrieve.webctas[0].price.endTime,
  }))
  console.log(output);
})();
