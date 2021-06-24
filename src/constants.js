const Suits = ["S", "C", "D", "H"];

const Ranks = [
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
  "2",
];

const Errors = {
  NOT_ENOUGH_PLAYERS: "Không đủ người chơi",
  TOO_MUCH_PLAYERS: "Quá nhiều người chơi",
  CLIENT_ALREADY_EXIST: "Trận đấu đã tồn tại",
  STAGING_CARDS_INVALID: "Bài không hợp lệ.",
  PLAYER_NOT_FOUND: "Không tìm thấy người chơi",
  INVALID_TURN: "Không phải lượt của bạn",
  INVALID_PLAY: "Không hợp lệ",
  CANT_BEAT_TABLE_CARDS: "Không thắng được thẻ trên bàn!",
  MATCH_NOT_STARTED: "Trận đấu chưa được bắt đầu",
};

const Combinations = {
  SINGLE: "single",
  PAIR: "pair",
  TRIPLE: "three-of-a-kind",
  STRAIGHT: "straight",
  THREEPAIR: "three-pair",
  FOUROFAKIND: "four-of-a-kind",
  FOURPAIR: "four-pair",
  ANY: "any",
};

module.exports = {
  Suits,
  Ranks,
  Errors,
  Combinations,
};
