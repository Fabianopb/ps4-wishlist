import axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';
import { table } from 'table';
import colors from 'colors/safe';

moment.locale('fi');
axios.defaults.headers.get['x-psn-store-locale-override'] = 'en-FI';

const wishlist = [
  'EP1004-CUSA08519_00-REDEMPTION000002', // RDR2
  'EP0131-NPEJ00518_00-BANNERSAGATRIBUN', // Banner saga trilogy
  'EP0082-CUSA07187_00-FFVIIREMAKE00000', // FF VII
  'EP0082-CUSA05531_00-FFXIIGAMEPS400EU', // FF XII
  'EP0102-CUSA03840_00-RE456BUND00000EU', // Resident Evil 4, 5, 6,
  'EP3643-CUSA16703_00-GRISPS4SIEE00000', // Gris
  'EP9000-CUSA12605_00-DEATHSTRAND00001', // Death Stranding
  'EP2377-CUSA05308_00-EDBASEGAME000000', // Elite Dangerous
  'EP0002-CUSA00433_00-D3ETERNALCOLL000', // Diablo III Collection
  'EP0343-CUSA16052_00-BGANDBGIICONSOLE', // Baldur's Gate
  'EP0850-CUSA02312_00-AXIOMVERGEPSVPS4', // Axiom Verge
  'EP9000-CUSA00717_00-DETROIT000000001', // Detroit
  'EP1805-CUSA13285_00-HOLLOWKNIGHT18EU', // Hollow Knight
  'EP3969-CUSA12659_00-HITMANHDENHANCED', // Hitman Collection
  'EP3969-CUSA12414_00-HITMANSTANDARD00', // Hitman 2
  'EP3969-PPSA01769_00-00000H3PRESTANDA', // Hitman 3
  'EP9000-CUSA07875_00-UNCHD4LOSTLEGACY', // Uncharted Lost Legacy
  'EP9000-CUSA00511_00-GBEYONDTWO000001', // Beyond two souls
  'EP0338-CUSA04241_00-2488202488202490', // Risk of Rain
  'EP0002-CUSA00568_00-DSTCOLLECTION001', // Destiny collection
  'EP2391-CUSA06681_00-THETURINGTEST001', // The Turing Test
  'EP4497-CUSA18278_00-00000000000000N2', // Cyberpunk 2077
  'EP9001-CUSA02168_00-GTSPORT000000000', // Gran Turismo Sport
  'EP0006-CUSA05749_00-BATTLEFRONTII000', // Star wars Battle Front II
  'EP0002-CUSA08630_00-CODWWIIGOLDED001', // Call of Duty WWII
  'EP1003-CUSA13275_00-DOOMETERNALBUNDL', // Doom Eternal Standard
  'EP1003-CUSA05486_00-SKYRIMHDFULLGAME', // Skyrim
  'EP0006-CUSA01499_00-PAMPLONA00000000', // Mirror's Edge
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
          endTime: string | null;
        }
      }[];
    };
  }
};

const baseUrl = 'https://web.np.playstation.com/api/graphql/v1/op';
// const storeBaseLink = 'https://store.playstation.com/en-fi/product';
const sha256Hash = '8532da7eda369efdad054ca8f885394a2d0c22d03c5259a422ae2bb3b98c5c99';

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

const tableHeader = ['Name', 'Price', 'Sale', 'Disc', 'Valid until'].map(h => colors.bold(h));

const getStyledPrice = (price: string) => {
  const parsedPrice = parseInt(price.replace(/[^0-9,.]/g, ""), 10);
  if (parsedPrice < 10) {
    return colors.bgGreen(price);
  }
  if (parsedPrice < 20) {
    return colors.bgYellow(price);
  }
  if (parsedPrice < 30) {
    return colors.bgCyan(price);
  }
  return colors.gray(price);
}

(async () => {
  const responses = await Promise.all(promises);
  const output = responses.map(res => {
    const { webctas, name } = res.data.data.productRetrieve;
    if (webctas.length === 0) {
      console.warn(`Product "${name}" does not have webcta property`);
      return undefined;
    }
    const endTime = webctas[0].price.endTime === null ? '' : moment(Number(webctas[0].price.endTime)).format('L LT');
    return {
      name,
      normalPrice: webctas[0].price.basePrice,
      discountPrice: getStyledPrice(webctas[0].price.discountedPrice),
      discount: webctas[0].price.discountText,
      endTime,
    }
  });
  const definedOutput = output.filter(<T>(game: T | undefined): game is T => game !== undefined);
  const sortedOutput = definedOutput.sort((a, b) => parseInt(a.discount || '0', 10) - parseInt(b.discount || '0', 10));
  const tableOutput = [tableHeader, ...sortedOutput.map(Object.values)]
  console.log(table(tableOutput));
})();
