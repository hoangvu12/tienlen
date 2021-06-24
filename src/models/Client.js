const _ = require("lodash");

const {
  compareCards,
  validCombination,
  validChop,
  compareHighest,
} = require("../utils/cardComparison");

const { GameClients } = require("../Store");
const { Combinations, Errors, Suits, Ranks } = require("../constants");

class GameClient {
  constructor(clientName, options) {
    if (GameClients.has(clientName)) {
      throw new Error(Errors.CLIENT_ALREADY_EXIST);
    }

    this.name = clientName;
    this.players = [];
    this.winner = [];
    this.table = [];
    this.options = {
      minPlayer: 2,
      maxPlayer: 4,
      ...options,
    };

    this.isInProgress = false;

    GameClients.set(clientName, this);
  }

  shuffleCards() {
    let deck = [];

    for (let suit of Suits) {
      for (let rank of Ranks) {
        deck.push({ suit: suit, rank: rank });
      }
    }

    const shuffleTime = Math.floor(Math.random() * 4);

    for (let i = 0; i < shuffleTime; i++) {
      deck = _.shuffle(deck);
    }

    this.deck = deck;

    return deck;
  }

  setup() {
    const deck = this.shuffleCards();

    const chunkedDeck = _.chunk(deck, 13).map((x) => x.sort(compareCards));

    let firstPlayer;

    for (let i = 0; i < this.players.length; i++) {
      if (_.find(chunkedDeck[i], { rank: "3", suit: "S" })) {
        firstPlayer = i;
      }

      this.players[i].hand = chunkedDeck[i];
    }

    this.roundType = Combinations.ANY;

    this.playerTurn = firstPlayer;
  }

  start() {
    const { minPlayer, maxPlayer } = this.options;

    if (this.players.length < minPlayer) {
      throw new Error(Errors.NOT_ENOUGH_PLAYERS);
    }
    if (this.players.length > maxPlayer) {
      throw new Error(Errors.TOO_MUCH_PLAYERS);
    }

    this.isInProgress = true;

    this.setup();
  }

  play(cardsIndex, player) {
    if (!cardsIndex || cardsIndex.length === 0) {
      throw new Error(Errors.STAGING_CARDS_INVALID);
    }

    player = this.getPlayer(player);

    const cards = cardsIndex.map((index) => player.hand[index]);

    const currentPlayer = this.players[this.playerTurn];

    if (!_.isEqual(player, currentPlayer)) {
      throw new Error(Errors.INVALID_TURN);
    }

    const combinationType = validCombination(cards);

    this.roundType = combinationType;

    if (!this.isValidPlay(cards)) throw new Error(Errors.INVALID_PLAY);

    this.table = _.clone(cards).sort(compareCards);

    this.removeCards(cards, player.hand);

    this.setNextTurn();

    const returnObj = {
      isClientEnd: false,
      isPlayerWon: false,
    };

    if (player.hand.length === 0) {
      player.isWon = true;
      this.winner.push(player);

      returnObj.isPlayerWon = true;

      if (this.players.length - this.winner.length === 1) {
        this.isInProgress = false;

        returnObj.isClientEnd = true;
      }
    }

    return returnObj;
  }

  passTurn(player) {
    player.isSkipped = true;

    this.setNextTurn();
  }

  setNextTurn() {
    let playerTurn = this.playerTurn + 1;

    if (playerTurn > this.players.length - 1) playerTurn = 0;

    const nextPlayer = this.players[playerTurn];

    if (!nextPlayer.isSkipped && !nextPlayer.isWon) {
      this.playerTurn = playerTurn;

      return;
    }

    const skippedPlayers = this.players.filter((player) => player.isSkipped);
    const activePlayers = this.players.filter((player) => !player.isWon);

    if (
      activePlayers.length === skippedPlayers.length &&
      this.players.some((player) => player.isWon)
    ) {
      this.reset();
    }

    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];

      if (player.isSkipped || player.isWon) continue;

      this.playerTurn = i;

      break;
    }

    if (this.players.length - skippedPlayers.length === 1) {
      this.reset();
    }
  }

  reset() {
    this.table = [];
    this.players.map((player) => (player.isSkipped = false));
    // console.log(this.players);
  }

  removeCards(cards, cardsHolder) {
    for (let i = 0; i < cards.length; i++) {
      cardsHolder.splice(cards[i], 1);
    }
  }

  getPlayers() {
    return this.players;
  }

  getPlayer(player) {
    let chosenPlayer;

    if (typeof player === "function") {
      chosenPlayer = this.players.find(player);
    } else {
      // If player is not a function, then it must be a sender Id
      chosenPlayer = this.players.find(
        (gamePlayer) => gamePlayer.senderId === player
      );
    }

    if (!chosenPlayer) {
      throw new Errors(Errors.PLAYER_NOT_FOUND);
    }

    return chosenPlayer;
  }

  removePlayer(fn) {
    this.players = _.reject(this.players, fn);
  }

  addPlayer(player) {
    player.client = this;

    this.players.push(player);
  }

  isValidPlay(cards) {
    const handType = validCombination(cards);

    if (cards.length === 0 || handType === undefined) {
      throw new Error(Errors.INVALID_PLAY);
    }

    if (this.roundType === Combinations.ANY || validChop(this.table, cards)) {
      return true;
    }

    if (this.roundType !== handType) {
      throw new Error(Errors.INVALID_PLAY);
    }

    if (compareHighest(cards, this.table) !== 1) {
      throw new Error(Errors.CANT_BEAT_TABLE_CARDS);
    }

    return true;
  }
}

module.exports = GameClient;
