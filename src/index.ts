import axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';
import { table } from 'table';
import colors from 'colors/safe';

moment.locale('fi');
axios.defaults.headers.get['x-psn-store-locale-override'] = 'en-FI';

const wishlist = [
  'EP1004-CUSA08519_00-REDEMPTIONFULL02', // RDR2
  'EP0131-NPEJ00518_00-BANNERSAGATRIBUN', // Banner saga trilogy
  'EP0082-CUSA07187_00-FFVIIREMAKE00000', // FF VII
  'EP0082-CUSA05531_00-FFXIIGAMEPS400EU', // FF XII
  'EP3643-CUSA16703_00-GRISPS4SIEE00000', // Gris
  'EP9000-CUSA12605_00-DEATHSTRAND00001', // Death Stranding
  'EP2377-CUSA05308_00-EDBASEGAME000000', // Elite Dangerous
  'EP0002-CUSA00433_00-D3ETERNALCOLL000', // Diablo III Collection
  'EP0343-CUSA16052_00-BGANDBGIICONSOLE', // Baldur's Gate
  'EP0850-CUSA02312_00-AXIOMVERGEPSVPS4', // Axiom Verge
  'EP9000-CUSA00717_00-DETROIT000000001', // Detroit
  'EP1805-CUSA13285_00-HOLLOWKNIGHT18EU', // Hollow Knight
  'EP3969-CUSA12414_00-HITMANSTANDARD00', // Hitman 2
  'EP3969-PPSA01769_00-00000H3000STANDA', // Hitman 3
  'EP9000-CUSA07875_00-UNCHD4LOSTLEGACY', // Uncharted Lost Legacy
  'EP9000-CUSA00511_00-GBEYONDTWO000001', // Beyond two souls
  'EP0290-CUSA16209_00-RISKOFRAIN2SIEE0', // Risk of Rain 2
  'EP0002-CUSA00568_00-DSTCOLLECTION001', // Destiny collection
  'EP2391-CUSA06681_00-THETURINGTEST001', // The Turing Test
  // 'EP4497-CUSA18278_00-00000000000000N2', // Cyberpunk 2077 - removed from store
  'EP9001-CUSA02168_00-GTSPORT000000000', // Gran Turismo Sport
  'EP0006-CUSA05749_00-BATTLEFRONTII000', // Star wars Battle Front II
  'EP0002-CUSA08630_00-CODWWIIGOLDED001', // Call of Duty WWII
  'EP1003-CUSA13275_00-DOOMETERNALBUNDL', // Doom Eternal Standard
  'EP1003-CUSA05486_00-SKYRIMHDFULLGAME', // Skyrim
  'EP0320-CUSA05666_00-HYPERLIGHTDRIFTR', // Hyper Light Drifter
  'EP2107-CUSA00327_00-DONTSTARVEPS4V01', // Don't Starve
  'EP2333-CUSA09919_00-OUTERWILDSSIEE00', // Outer Wilds
  'EP4139-CUSA07254_00-STELLARISDDE0001', // Stellaris Delux Edition
  'EP0177-CUSA15036_00-CFBDIGITALDELUXE', // Catherine Deluxe
  'EP2333-CUSA07974_00-WHATREMAINSFINCH', // Edith Finch
  'EP0700-CUSA08495_00-DARKSOULSHD00000', // Dark Souls
  'EP9000-CUSA08809_00-SOTC0000000000EU', // Shadow of the Colossus
  'EP1003-CUSA07377_00-COLOSSUSFULLGAME', // Wolfenstein® II: The New Colossus
  'EP1003-CUSA13094_00-YNGBLD0000000000', // Wolfenstein: Youngblood
  'EP9000-CUSA10211_00-HRZCE00000000000', // Horizon Zero Dawn Complete Edition
  'EP4365-CUSA16260_00-COMMANDOS2HD0001', // Commandos 2 - HD Remaster
  'EP0001-NPEJ00305_00-B000000000001030', // Child of Light
  'EP4293-CUSA24722_00-0924011560021288', // Quantum Replica
  'EP4176-PPSA02117_00-8201964206903574', // Observer System Redux
  'EP2520-CUSA23292_00-DISJUNCTIONBUNDL', // Disjunction
  'EP1121-CUSA19036_00-CLOUDPUNK0000001', // Cloudpunk
  'EP0082-PPSA01779_00-1955314285649692', // Outriders
  'EP4062-PPSA01749_00-522MEEGOLDEDGEN9', // Metro Exodus Gold Edition
  'EP1003-CUSA24594_00-QKRMST0000000000', // Quake
  'EP0700-CUSA12287_00-PS4TOVHD00000001', // Tales of Vesperia
  'EP0700-NPEB02235_00-TOZ00000DIGEDPS3', // Tales of Zestiria
  'EP0700-CUSA05105_00-PS4TOBERSERIA001', // Tales of Berseria
  'EP0700-PPSA02745_00-TOARISEPS5000001', // Tales of Arise
];

// PS3 only
// Resistance series

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
    } | null;
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
  const output = responses.map((res, index) => {
    if (!res.data.data.productRetrieve) {
      console.log(colors.red(`Product with id "${wishlist[index]}" could not be retrieved`));
      return undefined;
    }
    const { webctas, name } = res.data.data.productRetrieve;
    if (webctas.length === 0) {
      console.log(colors.red(`Product "${name}" does not have webcta property`));
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
