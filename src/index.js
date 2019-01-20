import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const className = 'square' + props.highlight;  
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, highlight) {
    return (
      <Square 
        highlight={highlight}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  
  render() {
    const sequence = checkGame(this.props.squares).sequence;
    return (
      <div>
        {[0, 1, 2].map((row) => {
          return (
            <div key={row} className="board-row">
            {[0, 1, 2].map((col) => {
              const nextSquare = row * 3 + col;
              const highlight = sequence && sequence.find(n => n === nextSquare) === undefined ? '' : ' highlight';
              return(
                <span key={nextSquare}>
                  {this.renderSquare(nextSquare, highlight)}
                </span>
              );
            })}
            </div>
          );
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      gameOver: { winner: null, sequence: [] }
    }
  }

  handleClick(i) {
    // Truncate the history if we click a new square
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length -1];
    // Why a new object instead of modifying the original?
    // In other words, why is immutability a benefit?
    // 1. It will help us implement more complex features, e.g., history or undo
    // 2. It's easier to tell if an immutable object has changed, because it 
    //    references a new object. This helps React determine when to re-render.
    const squares = current.squares.slice();
    const gameOver = checkGame(squares);
    if (gameOver.winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    // Set the current board to the one we're viewing
    const current = history[this.state.stepNumber];
    // Build the list of move buttons to display
    const moves = history.map((step,move) => {
      const desc = move ? 'Go to move # ' + move : 'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      )
    })

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <Status
            next={this.state.xIsNext ? 'X' : 'O'}
            squares={current.squares}
          />
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function Status(props) {
  const gameOver = checkGame(props.squares);

  let status;
  if (gameOver.winner === 'draw') {
    status = 'Game is a draw'
  } else if (gameOver.winner) {
    status = 'Winner: ' + gameOver.winner;
  } else {
    status = 'Next player: ' + (props.next);
  }

  return (
    <div className="status">{status}</div>
  )
}

function Title(props) {
  return <h1>{props.name}</h1>;
}

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(() => 
      this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

// ========================================
// Main render

ReactDOM.render(
  <div>
    <Title name="Tic Tac Toe" />
    <Clock />
    <Game />
  </div>,
  document.getElementById('root')
);

// ========================================
// Helper functions

function checkGame(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], sequence: [a, b, c] };
    }
  }
  // If there's any square left open, the game is still going on
  for (let j = 0; j < squares.length; j++) {
    if (squares[j] === null)
      return { winner: null, sequence: [] };
  }
  // No squares are left open, but there's no winner.
  return { winner: 'draw', sequence: [] };
}
