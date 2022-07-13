const messageList = document.querySelector("ul");
const form = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from the Server");
});

function handleSubmit(event) {
  event.preventDefault();
  const nickInput = form.querySelector("#nick");
  const msgInput = form.querySelector("#msg");

  socket.send(
    makeMessage("new_message", {
      nickInput: nickInput.value,
      msgInput: msgInput.value,
    })
  );
  nickInput.value = "";
  msgInput.value = "";
}

form.addEventListener("submit", handleSubmit);
