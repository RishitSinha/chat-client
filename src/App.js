import React, { useEffect, useState } from "react";
import axios from "axios";
import socketIoClient from "socket.io-client";
import sailsIoClient from "sails.io.js";

const API = axios.create({ baseURL: "http://localhost:1337" });

const io = sailsIoClient(socketIoClient);
io.sails.url = "http://localhost:1337";

function App() {
  const [messages, updateMessages] = useState([]);
  const [name, setName] = useState(`User-${Date.now()}`);
  const [to, setTo] = useState(``);
  const [message, setMessage] = useState(``);

  useEffect(() => {
    io.socket.on("connect", () => {
      io.socket.post("/subscribe", { name });
    });

    io.socket.on("hello", (data) => {
      console.log(data);
    });
  }, []);

  useEffect(() => {
    io.socket.on("NEW_MESSAGE", (data) => {
      updateMessages([...messages, data]);
    });
  }, [messages]);

  useEffect(() => {
    (async () => {
      const messages = await API.get(`/messages`);
      updateMessages(
        messages.data.filter((msg) => msg.from === name || msg.to === name)
      );
    })();
  }, []);

  return (
    <div className="App" style={{ margin: "0 auto", width: "35em" }}>
      <div className="message-list" style={{ width: "100%" }}>
        {messages.map(({ id, content, from, createdAt }) => (
          <p className="message" key={id} style={{ width: "100%" }}>
            <strong>{from}: </strong>{" "}
            <span style={{ fontSize: "0.75em", float: "right" }}>
              ({new Date(createdAt).toLocaleString()})
            </span>
            <br /> {content}
          </p>
        ))}
      </div>

      <div
        className="sendMessage"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input type="text" value={to} onChange={(e) => setTo(e.target.value)} />
        <textarea
          name="message-input"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={() => {
            const username = name.trim();
            const receiver = to.trim();
            const msg = message.trim();

            const success = API.post(`/messages`, {
              from: username,
              to: receiver,
              content: msg,
              createdAt: Date.now(),
            });

            if (success) {
              setMessage("");
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
