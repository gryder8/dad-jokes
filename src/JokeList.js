import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";
import "./Transition.css";
import Joke from "./Joke";
import FlipMove from 'react-flip-move';
import { v4 as uuidv4 } from "uuid";

export default class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10,
  };

  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), //if empty, parse an empty array (returns an empty array)
      loading: false,
    };
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
    console.log(this.seenJokes);
    this.handleJokeFetch = this.handleJokeFetch.bind(this);
    this.handleLocalStateClear = this.handleLocalStateClear.bind(this);
  }

  componentDidMount() {
    //load jokes here
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }

  handleJokeFetch() {
    this.setState({ loading: true }, this.getJokes); //second arg is a callback (called after state is set)
  }

  handleLocalStateClear() {
    window.localStorage.clear();
    window.location.reload(true);
  }

  async getJokes() {
    try {
      let jokes = [];
      this.setState({ loading: true });
      while (jokes.length < this.props.numJokesToGet) {
        //console.log(jokes.length);
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        let newJoke = res.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
        } else {
          console.log("Found a duplicate!");
          console.log(newJoke);
        }
      }
      this.setState(
        (st) => ({
          jokes: [...st.jokes, ...jokes],
        }),
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
      this.setState({ loading: false });
    } catch (error) {
      alert(error);
      this.setState({loading:false})
    }
  }

  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      );
    }

    let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);

    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="crying_laughing_emoji"/>
          <button className="JokeList-getmore" onClick={this.handleJokeFetch}>
            Fetch Jokes
          </button>

          <button className="JokeList-clearlocal" onClick={this.handleLocalStateClear}>
            Reset Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          <FlipMove>
          {jokes.map((j) => (
            <Joke
              key={j.id}
              votes={j.votes}
              text={j.text}
              upvote={() => this.handleVote(j.id, 1)}
              downvote={() => this.handleVote(j.id, -1)}
            />
          ))}
          </FlipMove>
        </div>
      </div>
    );
  }
}
