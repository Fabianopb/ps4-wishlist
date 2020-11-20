import axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';

moment.locale('fi');
axios.defaults.headers.get['x-psn-store-locale-override'] = 'en-FI';

const sha256Hash = '8532da7eda369efdad054ca8f885394a2d0c22d03c5259a422ae2bb3b98c5c99';

const wishlist = [
  'EP1004-CUSA08519_00-REDEMPTION000002', // RDR2
  'EP0131-NPEJ00518_00-BANNERSAGATRIBUN', // Banner saga trilogy
  'EP0082-CUSA07187_00-FFVIIREMAKE00000', // FF VII
  'EP0082-CUSA05531_00-FFXIIGAMEPS400EU', // FF XII
  'EP0102-CUSA03840_00-RE456BUND00000EU', // Resident Evil 4, 5, 6,
  'EP2120-CUSA11235_00-CELESTEXXCELESTE', // Celeste
  'EP3643-CUSA16703_00-GRISPS4SIEE00000', // Gris
  'EP1156-CUSA04094_00-CROSSBUYPS4PSVIT', // Crypt of the necrodancer
  'EP9000-CUSA12605_00-DEATHSTRAND00001', // Death Stranding
  'EP0002-CUSA02014_00-KINGSQUECOMPLETE', // King's quest
  'EP2377-CUSA05308_00-EDBASEGAME000000', // Elite Dangerous
  'EP9000-CUSA07410_00-0000000GODOFWARN', // God of War
  'EP0002-CUSA00433_00-D3ETERNALCOLL000', // Diablo III Collection
  'EP0343-CUSA16052_00-BGANDBGIICONSOLE', // Baldur's Gate
  'EP0850-CUSA02312_00-AXIOMVERGEPSVPS4', // Axiom Verge
  'EP9000-CUSA00717_00-DETROIT000000001', // Detroit
  'EP1805-CUSA13285_00-HOLLOWKNIGHT18EU', // Hollow Knight
  'EP3969-CUSA12659_00-HITMANHDENHANCED', // Hitman Collection
  'EP9000-CUSA07875_00-UNCHD4LOSTLEGACY', // Uncharted Lost Legacy
  'EP9000-CUSA00511_00-GBEYONDTWO000001', // Beyond two souls
  'EP0338-CUSA04241_00-2488202488202490', // Risk of Rain
  'EP0002-CUSA00568_00-DSTCOLLECTION001', // Destiny collection

];

type GameResponse = {
  data: {
    productRetrieve: {
      name: string;
      webctas: {
        price: {
          basePrice: string;
          discountText: string | null;
          discountedPrice: string;
          endTime: string;
        }
      }[];
    };
  }
};

const baseUrl = 'https://web.np.playstation.com/api/graphql/v1/op';

const storeBaseLink = 'https://store.playstation.com/en-fi/product';

const promises = wishlist.map(productId => {
  const variables = { productId: productId };
  const extensions = { persistedQuery: { version: 1, sha256Hash } };
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
    endTime: moment(Number(res.data.data.productRetrieve.webctas[0].price.endTime)).format('L LT'),
  }))
  console.log(output);
})();
