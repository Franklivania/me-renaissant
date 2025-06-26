import type { DoppelgangerPersona } from '@/types';

interface CommentaryContext {
  moveType: 'capture' | 'check' | 'castle' | 'promotion' | 'blunder' | 'brilliant' | 'normal';
  gamePhase: 'opening' | 'middlegame' | 'endgame';
  playerAdvantage: 'winning' | 'losing' | 'equal';
  moveQuality: 'excellent' | 'good' | 'questionable' | 'poor';
  isPlayerMove: boolean;
}

interface MoveData {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  san: string;
  promotion?: string;
}

interface GameContext {
  moveCount?: number;
  isCheck?: boolean;
  isCheckmate?: boolean;
}

export class RenaissanceCommentary {
  private static readonly MOVE_COMMENTS = {
    capture: {
      praise: [
        "Ah! A most cunning strike! Thou dost seize thy foe's piece with the grace of a master swordsman.",
        "Well captured, dear soul! Like a hawk swooping upon its prey, thou hast claimed thy prize.",
        "Excellent! Thy blade finds its mark. The enemy's ranks grow thinner by thy hand.",
        "A fine conquest! Thou dost plunder the board as a merchant claims exotic treasures."
      ],
      neutral: [
        "The piece falls to thy advance. 'Tis the way of war upon the checkered field.",
        "Another soul departs the battlefield. Such is the nature of our eternal dance.",
        "Thy move claims what was once thy opponent's. The board shifts like the tides of fortune."
      ],
      opponent: [
        "Alas! Mine own piece falls to thy cunning. Thou dost press thy advantage well.",
        "A worthy strike against me! I must gather my wits and respond in kind.",
        "Thou hast drawn blood, dear mirror. The game grows more perilous by the moment."
      ]
    },
    check: {
      praise: [
        "Check! Thy royal hunt begins! Like a master falconer, thou dost corner thy quarry.",
        "The king trembles before thy advance! A most noble assault upon the crown.",
        "Check! Thy pieces sing in harmony, a chorus of tactical brilliance!",
        "Magnificent! Thou dost threaten the very heart of thy opponent's realm."
      ],
      neutral: [
        "Check! The royal dance continues, each step more perilous than the last.",
        "The king must flee thy advance. Such is the burden of the crown.",
        "Check! The board trembles with the weight of thy intention."
      ],
      opponent: [
        "Check! Thou dost press me sorely. My king must seek safer shores.",
        "A fine check, dear adversary! Thou keepest me ever vigilant.",
        "My sovereign is threatened! I must weave a path through thy snares."
      ]
    },
    castle: {
      praise: [
        "Wise! Thou dost shelter thy king behind walls of stone and steel. A prudent ruler knows when to seek sanctuary.",
        "Castling! Like a lord retreating to his fortress, thou dost secure thy realm with wisdom.",
        "A sage move! Thy king finds refuge whilst thy rook joins the fray. Strategy and safety in one elegant gesture."
      ]
    },
    promotion: {
      praise: [
        "Behold! Thy humble pawn ascends to nobility! From peasant to queen - a tale worthy of legend!",
        "Promotion! Like a squire earning knighthood, thy pawn claims its rightful throne!",
        "Magnificent transformation! Thy pawn's journey across the board mirrors the rise of heroes in ancient tales."
      ]
    },
    brilliant: {
      praise: [
        "By the stars! A move of such brilliance it would make the masters of old weep with joy!",
        "Extraordinary! Thou dost play with the wisdom of ancient sages and the fire of youth!",
        "A stroke of genius! Thy mind works like the great clockwork of the heavens themselves!",
        "Sublime! This move shall echo through the halls of chess immortality!"
      ]
    },
    good: {
      praise: [
        "Well played! Thy understanding of the royal game grows ever deeper.",
        "A sound move, dear soul! Thou dost navigate these waters with increasing skill.",
        "Nicely done! Each move brings thee closer to mastery of this ancient art.",
        "Good! Thy pieces dance to thy will like courtiers before their sovereign."
      ]
    },
    questionable: {
      gentle: [
        "Hmm... perhaps there was a more harmonious path? But fear not - even masters stumble upon stones.",
        "An interesting choice... though I wonder if thy pieces might sing a different tune?",
        "Curious... the board whispers of other possibilities, but thy journey is thine own to make.",
        "A bold move, though perhaps not the one the ancient masters would counsel."
      ]
    },
    poor: {
      gentle: [
        "Ah, dear soul... even the greatest artists must sometimes paint over their work. Consider thy next stroke carefully.",
        "A misstep, perhaps? But worry not - the path to wisdom is paved with such learning stones.",
        "The board speaks of missed opportunities, but each error teaches us more than a dozen victories.",
        "Fear not this stumble, dear mirror. Even Leonardo's first sketches were not masterpieces."
      ]
    },
    opening: [
      "The dance begins! Like courtiers taking their positions, thy pieces prepare for the grand ballet.",
      "Ah, the opening moves! Each piece awakens like flowers greeting the dawn.",
      "The game unfolds like a scroll of ancient wisdom. What tale shall we write together?",
      "The board stirs to life! Thy opening moves set the stage for our epic encounter."
    ],
    middlegame: [
      "The battle rages! Like armies clashing on fields of old, our pieces weave their deadly dance.",
      "The heart of the game beats strong! Each move now carries the weight of kingdoms.",
      "We enter the labyrinth of the middlegame, where only the wisest find their way to victory.",
      "The storm of battle is upon us! May thy tactical eye prove as sharp as thy strategic mind."
    ],
    endgame: [
      "The final act approaches! Like the last scene of a great drama, every move now echoes with destiny.",
      "Few pieces remain, but their power grows! In the endgame, even pawns may become queens.",
      "The endgame - where technique meets artistry, and patience rewards the faithful.",
      "We near the conclusion of our tale. May thy endgame skills prove worthy of the journey we've shared."
    ],
    general_encouragement: [
      "Thy play improves with each passing move! Like a fine wine, thy skill matures beautifully.",
      "I see the spark of mastery growing within thee. Continue this noble pursuit!",
      "Each game we play adds another verse to thy chess poetry. Write on, dear soul!",
      "Thy understanding deepens like roots seeking wisdom in ancient soil."
    ],
    thinking: [
      "I ponder thy last move like a scholar contemplating ancient texts...",
      "The wheels of my mind turn like the great mechanisms of cathedral clocks...",
      "I study the board as an astronomer reads the stars - seeking patterns in the celestial dance...",
      "Thy move has set my thoughts spinning like autumn leaves in a gentle breeze...",
      "I consider my response as carefully as a poet chooses each word of a sonnet..."
    ]
  };

  static generateComment(
    context: CommentaryContext,
    _doppelganger?: DoppelgangerPersona
  ): string | null {
    // 60% chance to comment on player moves, 30% on AI moves
    const shouldComment = context.isPlayerMove ? Math.random() < 0.6 : Math.random() < 0.3;
    
    if (!shouldComment) return null;

    let comments: string[] = [];

    // Select appropriate comments based on context
    switch (context.moveType) {
      case 'capture':
        comments = context.isPlayerMove 
          ? this.MOVE_COMMENTS.capture.praise
          : this.MOVE_COMMENTS.capture.opponent;
        break;
      case 'check':
        comments = context.isPlayerMove
          ? this.MOVE_COMMENTS.check.praise
          : this.MOVE_COMMENTS.check.opponent;
        break;
      case 'castle':
        comments = this.MOVE_COMMENTS.castle.praise;
        break;
      case 'promotion':
        comments = this.MOVE_COMMENTS.promotion.praise;
        break;
      case 'brilliant':
        comments = this.MOVE_COMMENTS.brilliant.praise;
        break;
      case 'blunder':
        comments = this.MOVE_COMMENTS.poor.gentle;
        break;
      default:
        // Based on move quality
        switch (context.moveQuality) {
          case 'excellent':
            comments = this.MOVE_COMMENTS.brilliant.praise;
            break;
          case 'good':
            comments = this.MOVE_COMMENTS.good.praise;
            break;
          case 'questionable':
            comments = this.MOVE_COMMENTS.questionable.gentle;
            break;
          case 'poor':
            comments = this.MOVE_COMMENTS.poor.gentle;
            break;
          default:
            // Game phase comments
            switch (context.gamePhase) {
              case 'opening':
                comments = this.MOVE_COMMENTS.opening;
                break;
              case 'middlegame':
                comments = this.MOVE_COMMENTS.middlegame;
                break;
              case 'endgame':
                comments = this.MOVE_COMMENTS.endgame;
                break;
              default:
                comments = this.MOVE_COMMENTS.general_encouragement;
            }
        }
    }

    return comments[Math.floor(Math.random() * comments.length)];
  }

  static getThinkingComment(): string {
    const comments = this.MOVE_COMMENTS.thinking;
    return comments[Math.floor(Math.random() * comments.length)];
  }

  static getGamePhase(moveCount: number): 'opening' | 'middlegame' | 'endgame' {
    if (moveCount < 20) return 'opening';
    if (moveCount < 40) return 'middlegame';
    return 'endgame';
  }

  static evaluateMoveQuality(
    move: MoveData,
    _gameContext: GameContext
  ): 'excellent' | 'good' | 'questionable' | 'poor' {
    // Simple heuristic evaluation
    let score = 0;

    // Capture bonus
    if (move.captured) {
      const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
      score += (pieceValues[move.captured as keyof typeof pieceValues] || 0) * 2;
    }

    // Check bonus
    if (move.san?.includes('+')) score += 1;

    // Checkmate bonus
    if (move.san?.includes('#')) score += 10;

    // Center control
    const centerSquares = ['d4', 'e4', 'd5', 'e5'];
    if (centerSquares.includes(move.to)) score += 0.5;

    // Determine quality based on score
    if (score >= 5) return 'excellent';
    if (score >= 2) return 'good';
    if (score >= 0) return 'questionable';
    return 'poor';
  }

  static getMoveType(move: MoveData, _gameContext: GameContext): CommentaryContext['moveType'] {
    if (move.san?.includes('#')) return 'brilliant'; // Checkmate
    if (move.captured) return 'capture';
    if (move.san?.includes('+')) return 'check';
    if (move.san?.includes('O-O')) return 'castle';
    if (move.promotion) return 'promotion';
    return 'normal';
  }
}