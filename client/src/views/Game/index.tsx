import React, { useState, useEffect } from "react";
import Status from "../../components/Status";
import Hand from "../../components/Hand";
import jsonData from "../../data/deck.json";
import styles from "./Game.module.css";

const Game: React.FC = () => {
  enum GameState {
    bet,
    init,
    userTurn,
    dealerTurn,
  }

  enum Deal {
    user,
    dealer,
    hidden,
  }

  enum Message {
    bet = "Press Play to Start!",
    hitStand = "Hit or Stand?",
    bust = "Bust!",
    blackjack = "Blackjack!",
    userWin = "You Win!",
    dealerWin = "Dealer Wins!",
    tie = "Tie!",
  }

  enum Choice {
    noChoice = "",
    rightChoice = "That was the right choice!",
    wrongChoice = "That was the wrong choice :(",
  }

  enum UserChoseTo {
    hit = "hit",
    stand = "stand",
    total = "total",
  }

  const data = JSON.parse(JSON.stringify(jsonData.cards));
  const [deck, setDeck]: any[] = useState(data);

  const [userCards, setUserCards]: any[] = useState([]);
  const [userScore, setUserScore] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const [displayTotal, setdisplayTotal] = useState(false);

  const [dealerCards, setDealerCards]: any[] = useState([]);
  const [dealerScore, setDealerScore] = useState(0);
  const [dealerCount, setDealerCount] = useState(0);

  const [gameState, setGameState] = useState(GameState.bet);
  const [message, setMessage] = useState(Message.bet);
  const [choice, setChoice] = useState(Choice.noChoice);
  const [buttonState, setButtonState] = useState({
    hitDisabled: false,
    standDisabled: false,
    resetDisabled: true,
  });

  useEffect(() => {
    if (gameState === GameState.init) {
      drawCard(Deal.user);
      drawCard(Deal.hidden);
      drawCard(Deal.user);
      drawCard(Deal.dealer);
      setGameState(GameState.userTurn);
      setMessage(Message.hitStand);
      setChoice(Choice.noChoice);
    }
  }, [gameState]);

  useEffect(() => {
    calculate(userCards, setUserScore);
    setUserCount(userCount + 1);
  }, [userCards]);

  useEffect(() => {
    calculate(dealerCards, setDealerScore);
    setDealerCount(dealerCount + 1);
  }, [dealerCards]);

  useEffect(() => {
    if (gameState === GameState.userTurn) {
      if (userScore === 21) {
        if (userCards.length === 2) {
          blackjack();
        } else {
          buttonState.hitDisabled = true;
          setButtonState({ ...buttonState });
        }
      } else if (userScore > 21) {
        bust();
      }
    }
  }, [userCount]);

  useEffect(() => {
    if (gameState === GameState.dealerTurn) {
      if (dealerScore >= 17) {
        checkWin();
      } else {
        drawCard(Deal.dealer);
      }
    }
  }, [dealerCount]);

  const playGame = () => {
    setGameState(GameState.init);
  };

  const resetGame = () => {
    console.clear();
    setDeck(data);

    setUserCards([]);
    setUserScore(0);
    setUserCount(0);

    setDealerCards([]);
    setDealerScore(0);
    setDealerCount(0);

    setGameState(GameState.bet);
    setMessage(Message.bet);
    setChoice(Choice.noChoice);
    setButtonState({
      hitDisabled: false,
      standDisabled: false,
      resetDisabled: true,
    });
  };

  const drawCard = (dealType: Deal) => {
    if (deck.length > 0) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const card = deck[randomIndex];
      deck.splice(randomIndex, 1);
      setDeck([...deck]);
      console.log("Remaining Cards:", deck.length);
      switch (card.suit) {
        case "spades":
          dealCard(dealType, card.value, "♠");
          break;
        case "diamonds":
          dealCard(dealType, card.value, "♦");
          break;
        case "clubs":
          dealCard(dealType, card.value, "♣");
          break;
        case "hearts":
          dealCard(dealType, card.value, "♥");
          break;
        default:
          break;
      }
    } else {
      alert("All cards have been drawn");
    }
  };

  const toggleDisplayTotal = (val: any) => {
    setdisplayTotal(val);
  };

  const dealCard = (dealType: Deal, value: string, suit: string) => {
    switch (dealType) {
      case Deal.user:
        userCards.push({ value: value, suit: suit, hidden: false });
        setUserCards([...userCards]);
        break;
      case Deal.dealer:
        dealerCards.push({ value: value, suit: suit, hidden: false });
        setDealerCards([...dealerCards]);
        break;
      case Deal.hidden:
        dealerCards.push({ value: value, suit: suit, hidden: true });
        setDealerCards([...dealerCards]);
        break;
      default:
        break;
    }
  };

  const revealCard = () => {
    dealerCards.filter((card: any) => {
      if (card.hidden === true) {
        card.hidden = false;
      }
      return card;
    });
    setDealerCards([...dealerCards]);
  };

  const calculate = (cards: any[], setScore: any) => {
    let total = 0;
    cards.forEach((card: any) => {
      if (card.hidden === false && card.value !== "A") {
        switch (card.value) {
          case "K":
            total += 10;
            break;
          case "Q":
            total += 10;
            break;
          case "J":
            total += 10;
            break;
          default:
            total += Number(card.value);
            break;
        }
      }
    });
    const aces = cards.filter((card: any) => {
      return card.value === "A";
    });
    aces.forEach((card: any) => {
      if (card.hidden === false) {
        if (total + 11 > 21) {
          total += 1;
        } else if (total + 11 === 21) {
          if (aces.length > 1) {
            total += 1;
          } else {
            total += 11;
          }
        } else {
          total += 11;
        }
      }
    });
    setScore(total);
  };

  const determineChoice = (userChoseTo: UserChoseTo) => {
    // check if total is 11 or below; if so then hit
    if (userScore <= 11 && userChoseTo == UserChoseTo.hit) {
      setChoice(Choice.rightChoice);
      return;
    } else if (userScore <= 11 && userChoseTo == UserChoseTo.stand) {
      setChoice(Choice.wrongChoice);
      return;
    }

    // if there is an ace, follow new ruleset
    // if ace and 6 or below, then hit; else if ace and 9 or above then stand
    if (userCards.length <= 2) {
      const aces = userCards.filter((card: any) => {
        return card.value === "A";
      });
      const otherCards = userCards.filter((card: any) => {
        return card.value != "A";
      });

      if (aces.length >= 1) {
        let totalOfOtherCards = 0;
        otherCards.forEach((card: any) => {
          if (card.value == ("K" || "Q" || "J")) {
            totalOfOtherCards += 10;
          } else {
            totalOfOtherCards += parseInt(card.value);
          }
        });

        // checks if there are other aces to add to the total count
        if (aces.length >= 2) {
          // allows us to count the extra card in the aces stack
          totalOfOtherCards -= 1;
          aces.forEach(() => {
            totalOfOtherCards += 1;
          });
        }

        if (totalOfOtherCards <= 6 && userChoseTo == UserChoseTo.hit) {
          setChoice(Choice.rightChoice);
          return;
        } else if (totalOfOtherCards <= 6 && userChoseTo == UserChoseTo.stand) {
          setChoice(Choice.wrongChoice);
          return;
        } else if (
          totalOfOtherCards >= 9 &&
          totalOfOtherCards <= 10 &&
          userChoseTo == UserChoseTo.hit
        ) {
          setChoice(Choice.wrongChoice);
          return;
        } else if (
          totalOfOtherCards >= 9 &&
          totalOfOtherCards <= 10 &&
          userChoseTo == UserChoseTo.stand
        ) {
          setChoice(Choice.rightChoice);
          return;
        }
      }
    }

    // otherwise, if 17 or above then stand
    if (userScore >= 17 && userChoseTo == UserChoseTo.hit) {
      setChoice(Choice.wrongChoice);
      return;
    } else if (userScore >= 17 && userChoseTo == UserChoseTo.stand) {
      setChoice(Choice.rightChoice);
      return;
    }

    // determine value dealer is showing
    let valueShowing = 0;
    dealerCards.forEach((card: any) => {
      if (card.hidden === false) {
        if (card.value === "A") {
          valueShowing = 11;
        } else if (card.value === ("K" || "Q" || "J")) {
          valueShowing = 10;
        } else {
          valueShowing = parseInt(card.value);
        }
      }
    });

    // user has an A/7 or A/8
    const aces = userCards.filter((card: any) => {
      return card.value === "A";
    });

    if (aces.length >= 1) {
      let sumOfUserCards = 0;
      userCards.forEach((card: any) => {
        if (card.value != "A") {
          if (card.value === ("K" || "Q" || "J")) {
            sumOfUserCards += 10;
          } else {
            sumOfUserCards += parseInt(card.value);
          }
        }
      });

      if (sumOfUserCards === 7) {
        if (valueShowing == 7 || valueShowing === 8) {
          if (userChoseTo === UserChoseTo.hit) {
            setChoice(Choice.wrongChoice);
            return;
          } else if (userChoseTo === UserChoseTo.stand) {
            setChoice(Choice.rightChoice);
            return;
          }
        } else {
          if (userChoseTo === UserChoseTo.hit) {
            setChoice(Choice.rightChoice);
            return;
          } else if (userChoseTo === UserChoseTo.stand) {
            setChoice(Choice.wrongChoice);
            return;
          }
        }
      } else if (sumOfUserCards === 8) {
        if (
          valueShowing == 2 ||
          valueShowing === 3 ||
          valueShowing === 4 ||
          valueShowing === 5 ||
          valueShowing === 6 ||
          valueShowing === 7 ||
          valueShowing === 8 ||
          valueShowing === 9 ||
          valueShowing === 10 ||
          valueShowing === 11
        ) {
          if (userChoseTo === UserChoseTo.hit) {
            setChoice(Choice.wrongChoice);
            return;
          } else if (userChoseTo === UserChoseTo.stand) {
            setChoice(Choice.rightChoice);
            return;
          }
        } else {
          if (userChoseTo === UserChoseTo.hit) {
            setChoice(Choice.rightChoice);
            return;
          } else if (userChoseTo === UserChoseTo.stand) {
            setChoice(Choice.wrongChoice);
            return;
          }
        }
      }
    }

    // total is 12-16
    if (userScore === 12) {
      // if dealer has 4, 5, or 6 then stand
      if (valueShowing === 4 || valueShowing === 5 || valueShowing === 6) {
        if (userChoseTo === UserChoseTo.hit) {
          setChoice(Choice.wrongChoice);
          return;
        } else if (userChoseTo === UserChoseTo.stand) {
          setChoice(Choice.rightChoice);
          return;
        }
      } else {
        if (userChoseTo === UserChoseTo.hit) {
          setChoice(Choice.rightChoice);
          return;
        } else if (userChoseTo === UserChoseTo.stand) {
          setChoice(Choice.wrongChoice);
          return;
        }
      }
    } else if (
      userScore === 13 ||
      userScore === 14 ||
      userScore === 15 ||
      userScore === 16
    ) {
      // if dealer has 2-6 then stand
      if (
        valueShowing === 2 ||
        valueShowing === 3 ||
        valueShowing === 4 ||
        valueShowing === 5 ||
        valueShowing === 6
      ) {
        if (userChoseTo === UserChoseTo.hit) {
          setChoice(Choice.wrongChoice);
          return;
        } else if (userChoseTo === UserChoseTo.stand) {
          setChoice(Choice.rightChoice);
          return;
        }
      } else {
        if (userChoseTo === UserChoseTo.hit) {
          setChoice(Choice.rightChoice);
          return;
        } else if (userChoseTo === UserChoseTo.stand) {
          setChoice(Choice.wrongChoice);
          return;
        }
      }
    }
  };

  const hit = () => {
    determineChoice(UserChoseTo.hit);
    drawCard(Deal.user);
  };

  const stand = () => {
    determineChoice(UserChoseTo.stand);
    buttonState.hitDisabled = true;
    buttonState.standDisabled = true;
    buttonState.resetDisabled = false;
    setButtonState({ ...buttonState });
    setGameState(GameState.dealerTurn);
    revealCard();
  };

  const bust = () => {
    buttonState.hitDisabled = true;
    buttonState.standDisabled = true;
    buttonState.resetDisabled = false;
    setButtonState({ ...buttonState });
    setMessage(Message.bust);
  };

  const blackjack = () => {
    buttonState.hitDisabled = true;
    buttonState.standDisabled = true;
    buttonState.resetDisabled = false;
    setButtonState({ ...buttonState });
    setMessage(Message.blackjack);
  };

  const checkWin = () => {
    if (userScore > dealerScore || dealerScore > 21) {
      setMessage(Message.userWin);
    } else if (dealerScore > userScore) {
      setMessage(Message.dealerWin);
    } else {
      setMessage(Message.tie);
    }
  };

  return (
    <div className={styles.gameBackground}>
      <Status
        message={message}
        choice={choice}
        gameState={gameState}
        buttonState={buttonState}
        playGame={playGame}
        hit={hit}
        stand={stand}
        resetGame={resetGame}
        displayTotal={displayTotal}
        toggleDisplayTotal={toggleDisplayTotal}
      />
      <div className={styles.handSection}>
        <Hand
          title={`Dealer's Hand ${displayTotal ? `(${dealerScore})` : ""}`}
          cards={dealerCards}
        />
        <Hand
          title={`Your Hand ${displayTotal ? `(${userScore})` : ""}`}
          cards={userCards}
        />
      </div>
    </div>
  );
};

export default Game;
