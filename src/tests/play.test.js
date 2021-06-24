const Client = require("../models/Client");
const Player = require("../models/Player");

describe("moves", () => {
  let client;

  beforeEach(() => {
    const name = Math.floor(Math.random() * 10000).toString();

    client = new Client(name);

    const player1 = new Player({
      name: "mirai",
      senderId: "1",
      threadId: "1",
    });

    const player2 = new Player({
      name: "katou",
      senderId: "2",
      threadId: "1",
    });

    const player3 = new Player({
      name: "rem",
      senderId: "3",
      threadId: "1",
    });

    const player4 = new Player({
      name: "megumin",
      senderId: "4",
      threadId: "1",
    });

    player1.hand = [
      { suit: "S", rank: "3" },
      { suit: "S", rank: "4" },
      { suit: "H", rank: "4" },
      { suit: "S", rank: "6" },
      { suit: "D", rank: "6" },
      { suit: "C", rank: "8" },
      { suit: "D", rank: "8" },
      { suit: "S", rank: "T" },
      { suit: "C", rank: "J" },
      { suit: "H", rank: "A" },
      { suit: "S", rank: "2" },
      { suit: "C", rank: "2" },
      { suit: "D", rank: "2" },
    ];

    player2.hand = [
      { suit: "D", rank: "4" },
      { suit: "S", rank: "5" },
      { suit: "C", rank: "5" },
      { suit: "H", rank: "6" },
      { suit: "D", rank: "7" },
      { suit: "S", rank: "8" },
      { suit: "C", rank: "9" },
      { suit: "C", rank: "T" },
      { suit: "H", rank: "T" },
      { suit: "S", rank: "Q" },
      { suit: "C", rank: "Q" },
      { suit: "D", rank: "Q" },
      { suit: "H", rank: "Q" },
    ];

    player3.hand = [
      { suit: "D", rank: "3" },
      { suit: "H", rank: "3" },
      { suit: "C", rank: "4" },
      { suit: "S", rank: "7" },
      { suit: "C", rank: "7" },
      { suit: "D", rank: "9" },
      { suit: "H", rank: "9" },
      { suit: "D", rank: "T" },
      { suit: "D", rank: "J" },
      { suit: "C", rank: "K" },
      { suit: "D", rank: "K" },
      { suit: "H", rank: "K" },
      { suit: "S", rank: "A" },
    ];

    player4.hand = [
      { suit: "C", rank: "3" },
      { suit: "D", rank: "5" },
      { suit: "H", rank: "5" },
      { suit: "C", rank: "6" },
      { suit: "H", rank: "7" },
      { suit: "H", rank: "8" },
      { suit: "S", rank: "9" },
      { suit: "S", rank: "J" },
      { suit: "H", rank: "J" },
      { suit: "S", rank: "K" },
      { suit: "C", rank: "A" },
      { suit: "D", rank: "A" },
      { suit: "H", rank: "2" },
    ];

    client.players = [player1, player2, player3, player4];

    client.playerTurn = 0;
  });

  it("should throw error when there is no cards index", () => {
    expect(() => {
      client.play([], client.players[0].senderId);
    }).toThrow(Error);
  });

  it("should throw error if current turn is not the given player's turn", () => {
    expect(() => {
      client.play([0], client.players[1].senderId);
    }).toThrow(Error);
  });

  it("should throw error if the play is not valid", () => {
    expect(() => {
      client.play([1, 3], client.players[0].senderId);
    }).toThrow(Error);
  });

  it("should remove cards from player hand", () => {
    client.play([0], client.players[0].senderId);

    expect(client.players[0].hand).not.toContain({
      suit: "S",
      rank: "3",
    });
  });

  it("should set player turn to player 3 if player 2 is pass", () => {
    client.play([0], client.players[0].senderId);

    client.passTurn(client.players[1]);

    expect(client.playerTurn).toBe(2);
  });

  it("should set player turn to player 1 if any player else is pass", () => {
    client.play([0], client.players[0].senderId);

    client.passTurn(client.players[1]);
    client.passTurn(client.players[2]);
    client.passTurn(client.players[3]);

    expect(client.playerTurn).toBe(0);
  });

  it("should set player turn to player 4 if player 1, 2, 3 is pass", () => {
    client.play([0], client.players[0].senderId);

    client.passTurn(client.players[1]);
    client.passTurn(client.players[2]);

    client.play([2], client.players[3].senderId);

    client.passTurn(client.players[0]);

    expect(client.playerTurn).toBe(3);
  });

  it("should change player property isWon to true if player is out of cards", () => {
    client.players[0].hand = [{ suit: "C", rank: "3" }];

    const response = client.play([0], client.players[0].senderId);

    expect(client.players[0].isWon).toBeTruthy();
    expect(response.isPlayerWon).toBeTruthy();
  });

  it("should finish the game if 1 player left has cards", () => {
    client.players[0].hand = [{ suit: "S", rank: "3" }];
    client.players[1].hand = [{ suit: "C", rank: "3" }];
    client.players[2].hand = [{ suit: "D", rank: "3" }];
    client.players[3].hand = [{ suit: "H", rank: "3" }];

    const player1Response = client.play([0], client.players[0].senderId);
    const player2Response = client.play([0], client.players[1].senderId);
    const player3Response = client.play([0], client.players[2].senderId);

    expect(player1Response.isPlayerWon).toBeTruthy();
    expect(player1Response.isClientEnd).toBeFalsy();

    expect(player2Response.isPlayerWon).toBeTruthy();
    expect(player2Response.isClientEnd).toBeFalsy();

    expect(player3Response.isPlayerWon).toBeTruthy();
    expect(player3Response.isClientEnd).toBeTruthy();
  });

  it("should change player turn to who?", () => {
    client.players[0].hand = [{ suit: "S", rank: "3" }];
    client.players[1].hand = [{ suit: "S", rank: "3" }];

    client.play([0], client.players[0].senderId);
    client.passTurn(client.players[1]);
    client.passTurn(client.players[2]);
    client.passTurn(client.players[3]);

    client.play([0], client.players[1].senderId);
    client.passTurn(client.players[2]);
    client.passTurn(client.players[3]);
  });

  it("should chop sequence", () => {
    client.players[0].hand = [
      { suit: "D", rank: "4" },
      { suit: "S", rank: "5" },
      { suit: "H", rank: "6" },
      { suit: "D", rank: "7" },
      { suit: "S", rank: "8" },
      { suit: "C", rank: "9" },
    ];

    client.players[1].hand = [
      { suit: "D", rank: "5" },
      { suit: "S", rank: "6" },
      { suit: "H", rank: "7" },
      { suit: "D", rank: "8" },
      { suit: "S", rank: "9" },
      { suit: "C", rank: "10" },
    ];

    const player1Response = client.play([0], client.players[0].senderId);
    const player2Response = client.play([0], client.players[1].senderId);

    expect(client.playerTurn).toBe(2);
  });
});
