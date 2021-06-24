const Client = require("../models/Client");
const { compareCards } = require("../utils/cardComparison");
const _ = require("lodash");

describe("setup", () => {
  it("should error if there is duplicate client", () => {
    const client = new Client("test");

    expect(() => {
      const client2 = new Client("test");
    }).toThrow(Error);
  });

  it("should error when there is not enough player", () => {
    const clientName = Math.floor(Math.random() * 10).toString();
    const client = new Client(clientName);

    const newPlayer = {
      name: "Vũ Nguyễn",
      senderId: "1",
      threadId: "1",
    };

    client.addPlayer(newPlayer);

    expect(() => {
      client.start();
    }).toThrow(Error);
  });

  it("should error when players exceed max player", () => {
    const clientName = Math.floor(Math.random() * 10000).toString();
    const client = new Client(clientName);

    const players = [
      {
        name: "Vũ Nguyễn",
        senderId: "1",
        threadId: "1",
      },
      {
        name: "Phong Hoàng",
        senderId: "2",
        threadId: "1",
      },
      {
        name: "Thanh An",
        senderId: "3",
        threadId: "1",
      },
      {
        name: "Việt Anh",
        senderId: "4",
        threadId: "1",
      },
      {
        name: "Việt Anh",
        senderId: "4",
        threadId: "1",
      },
      {
        name: "Việt Anh",
        senderId: "4",
        threadId: "1",
      },
      {
        name: "Việt Anh",
        senderId: "4",
        threadId: "1",
      },
    ];

    players.forEach((player) => client.addPlayer(player));

    expect(() => client.start()).toThrow(Error);
  });

  it("should give each player 13 cards", () => {
    const clientName = Math.floor(Math.random() * 100000).toString();
    const client = new Client(clientName);

    const players = [
      {
        name: "Vũ Nguyễn",
        senderId: "1",
        threadId: "1",
      },
      {
        name: "Phong Hoàng",
        senderId: "2",
        threadId: "1",
      },
      {
        name: "Thanh An",
        senderId: "3",
        threadId: "1",
      },
    ];

    players.forEach((player) => client.addPlayer(player));

    client.start();

    for (let player in client.players) {
      let hand = client.players[player].hand;
      expect(hand.length).toBe(13);
    }
  });

  it("should sort the cards in each hand by ascending rank then suit", () => {
    const clientName = Math.floor(Math.random() * 100000).toString();
    const client = new Client(clientName);

    const players = [
      {
        name: "Vũ Nguyễn",
        senderId: "1",
        threadId: "1",
      },
      {
        name: "Phong Hoàng",
        senderId: "2",
        threadId: "1",
      },
      {
        name: "Thanh An",
        senderId: "3",
        threadId: "1",
      },
    ];

    players.forEach((player) => client.addPlayer(player));

    client.start();

    for (let player in client.players) {
      let hand = client.players[player].hand;
      expect(hand).toEqual(hand.sort(compareCards));
    }
  });

  it("should not have duplicated any cards", () => {
    const clientName = Math.floor(Math.random() * 10000).toString();
    const client = new Client(clientName);

    const players = [
      {
        name: "Vũ Nguyễn",
        senderId: "1",
        threadId: "1",
      },
      {
        name: "Phong Hoàng",
        senderId: "2",
        threadId: "1",
      },
      {
        name: "Thanh An",
        senderId: "3",
        threadId: "1",
      },
      {
        name: "Thanh An",
        senderId: "3",
        threadId: "1",
      },
    ];

    players.forEach((player) => client.addPlayer(player));

    client.start();

    expect(
      _.uniqWith(client.players.map((player) => player.hand).flat()).length
    ).toBe(52);
  });
});
