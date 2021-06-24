class Player {
  constructor({ name, senderId, threadId }) {
    this.hand = [];
    this.isSkipped = false;
    this.isWon = false;

    this.name = name;
    this.senderId = senderId;
    this.threadId = threadId;
  }

  play(cardsIndex) {
    this.client.play(cardsIndex, this.senderId);
  }

  passTurn() {
    this.client.passTurn(this);
  }
}

module.exports = Player;
