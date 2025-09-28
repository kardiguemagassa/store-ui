import developerImage from "../assets/stickers/developer.png";
import breakImage from "../assets/stickers/break.png";
import itsnotabugImage from "../assets/stickers/itsnotabug.png";
import EatSleepCodeImage from "../assets/stickers/EatSleepCode.png";
import BreakingCodeImage from "../assets/stickers/BreakingCode.png";
import youaremycssImage from "../assets/stickers/youaremycss.png";
import CoolAstraunautImage from "../assets/stickers/CoolAstraunaut.png";
import MbappeImage from "../assets/stickers/Mbappe.png";
import ronaldoImage from "../assets/stickers/ronaldo.png";
import MyDrivingScaresMeTooImage from "../assets/stickers/MyDrivingScaresMeToo.png";
import HouseOfTheDragonSymbolImage from "../assets/stickers/HouseOfTheDragonSymbol.png";
import SquidGameImage from "../assets/stickers/SquidGame.png";
import ShinchanImage from "../assets/stickers/Shinchan.png";
import GameOverImage from "../assets/stickers/GameOver.png";
import MessiImage from "../assets/stickers/Messi.png";
import ViratImage from "../assets/stickers/Virat.png";
import LazyCatImage from "../assets/stickers/LazyCat.png";
import OverThinkerImage from "../assets/stickers/OverThinker.png";
import NarutoImage from "../assets/stickers/Naruto.png";
import GokuImage from "../assets/stickers/Goku.png";
import IamOkayImage from "../assets/stickers/IamOkay.png";
import BooImage from "../assets/stickers/Boo.png";
import EwFeelingsImage from "../assets/stickers/EwFeelings.png";
import BeWildImage from "../assets/stickers/BeWild.png";
import AestheticSummerCatImage from "../assets/stickers/AestheticSummerCat.png";
import YourOpinonMeansNothingImage from "../assets/stickers/YourOpinonMeansNothing.png";
import SociallyAwkwardImage from "../assets/stickers/SociallyAwkward.png";
import ButterflyImage from "../assets/stickers/Butterfly.png";
import IWon_tHesitateStickerImage from "../assets/stickers/IWon_tHesitateSticker.png";
import EvilEyeImage from "../assets/stickers/EvilEye.png";
import type { Product } from '../types/product';

const products: Product[] = [
  {
    productId: 1,
    name: "Développeur",
    description: "Maître du code !",
    price: 5.0,
    popularity: "85",
    imageUrl: developerImage,
  },
  {
    productId: 2,
    name: "Casser",
    description: "Hé, prenons une pause et recommençons à zéro sur la ligne suivante",
    price: 4.5,
    popularity: "40",
    imageUrl: breakImage,
  },
  {
    productId: 3,
    name: "Ce n'est pas un bug ",
    description: "C'est une fonctionnalité surprise.",
    price: 6.0,
    popularity: "98",
    imageUrl: itsnotabugImage,
  },
  {
    productId: 4,
    name: "Devster",
    description: "Ils existent!",
    price: 5.0,
    popularity: "72",
    imageUrl: EatSleepCodeImage,
  },
  {
    productId: 5,
    name: "CodeSmasher",
    description: "Développeur intrépide!",
    price: 7.5,
    popularity: "88",
    imageUrl: BreakingCodeImage,
  },
  {
    productId: 6,
    name: "CodeMate",
    description: "Sans toi, je suis incomplet!",
    price: 2.0,
    popularity: "79",
    imageUrl: youaremycssImage,
  },
  {
    productId: 7,
    name: "Mbappé",
    description: "Phénoménal!",
    price: 8.0,
    popularity: "55",
    imageUrl: MbappeImage,
  },
  {
    productId: 8,
    name: "AstroChill",
    description: "Cool pour la gravité!",
    price: 3.0,
    popularity: "52",
    imageUrl: CoolAstraunautImage,
  },
  {
    productId: 9,
    name: "Ronaldo",
    description: "Légendaire!",
    price: 8.0,
    popularity: "100",
    imageUrl: ronaldoImage,
  },
  {
    productId: 10,
    name: "Ma conduite me fait peur aussi",
    description: "Ils existent!",
    price: 5.0,
    popularity: "65",
    imageUrl: MyDrivingScaresMeTooImage,
  },
  {
    productId: 11,
    name: "Symbole du dragon à trois têtes",
    description: "La force de la dynastie Targaryen",
    price: 9.0,
    popularity: "98",
    imageUrl: HouseOfTheDragonSymbolImage,
  },
  {
    productId: 12,
    name: "Jeu du calmar",
    description: "Jouons",
    price: 5.0,
    popularity: "70",
    imageUrl: SquidGameImage,
  },
  {
    productId: 13,
    name: "Shin-Chan",
    description: "Espiègle!",
    price: 5.0,
    popularity: "70",
    imageUrl: ShinchanImage,
  },
  {
    productId: 14,
    name: "Jeu terminé",
    description: "Jeu terminé!",
    price: 5.0,
    popularity: "50",
    imageUrl: GameOverImage,
  },
  {
    productId: 15,
    name: "Messi",
    description: "Magique!",
    price: 10.0,
    popularity: "99",
    imageUrl: MessiImage,
  },
  {
    productId: 16,
    name: "Virat Kohli",
    description: "Roi",
    price: 9.0,
    popularity: "99",
    imageUrl: ViratImage,
  },
  {
    productId: 17,
    name: "Chat paresseux",
    description: "Pas aujourd'hui",
    price: 6.0,
    popularity: "60",
    imageUrl: LazyCatImage,
  },
  {
    productId: 18,
    name: "Cerveau occupé",
    description: "Penseur excessif!",
    price: 4.0,
    popularity: "50",
    imageUrl: OverThinkerImage,
  },
  {
    productId: 19,
    name: "Naruto",
    description: "Ninja!",
    price: 6.0,
    popularity: "60",
    imageUrl: NarutoImage,
  },
  {
    productId: 20,
    name: "Goku",
    description: "Guerrier!",
    price: 6.0,
    popularity: "60",
    imageUrl: GokuImage,
  },
  {
    productId: 21,
    name: "Je vais bien",
    description: "Persistant!",
    price: 6.0,
    popularity: "60",
    imageUrl: IamOkayImage,
  },
  {
    productId: 22,
    name: "Boo",
    description: "Désapprobation!",
    price: 6.0,
    popularity: "60",
    imageUrl: BooImage,
  },
  {
    productId: 23,
    name: "Sentiment EW",
    description: "Dégoût!",
    price: 6.0,
    popularity: "60",
    imageUrl: EwFeelingsImage,
  },
  {
    productId: 24,
    name: "Soyez sauvage",
    description: "Déchaîné!",
    price: 6.0,
    popularity: "60",
    imageUrl: BeWildImage,
  },
  {
    productId: 25,
    name: "Chat d'été",
    description: "Moustaches de canicule",
    price: 6.0,
    popularity: "60",
    imageUrl: AestheticSummerCatImage,
  },
  {
    productId: 26,
    name: "Sauvagerie",
    description: "Votre opinion ne signifie rien",
    price: 6.0,
    popularity: "60",
    imageUrl: YourOpinonMeansNothingImage,
  },
  {
    productId: 27,
    name: "Gênant",
    description: "Gênant et étrange",
    price: 6.0,
    popularity: "60",
    imageUrl: SociallyAwkwardImage,
  },
  {
    productId: 28,
    name: "Papillon bleu",
    description: "Gracewing",
    price: 6.0,
    popularity: "60",
    imageUrl: ButterflyImage,
  },
  {
    productId: 29,
    name: "Aucune hésitation",
    description: "Toujours prêt à prendre les choses en main!",
    price: 6.0,
    popularity: "60",
    imageUrl: IWon_tHesitateStickerImage,
  },
  {
    productId: 30,
    name: "Wardgaze",
    description: "Pouvoir protecteur du mauvais œil",
    price: 6.0,
    popularity: "60",
    imageUrl: EvilEyeImage,
  },
];

export default products;