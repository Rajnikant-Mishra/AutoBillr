const WebSocket = require("ws");

let wss = null;

// email -> Set of connected websocket clients
const emailClients = new Map();

const normalizeEmail = (email) => {
  return email?.trim().toLowerCase();
};

const initEmailVerificationSocket = (server) => {
  wss = new WebSocket.Server({
    server,
    path: "/ws/email-verification",
  });

  console.log(
    "Email verification WebSocket initialized"
  );

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    let registeredEmail = null;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "REGISTER_EMAIL") {
          const email = normalizeEmail(data.email);

          if (!email) {
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: "Email is required",
              })
            );

            return;
          }

          registeredEmail = email;

          if (!emailClients.has(email)) {
            emailClients.set(email, new Set());
          }

          emailClients.get(email).add(ws);

          console.log(
            `WebSocket registered for email: ${email}`
          );

          ws.send(
            JSON.stringify({
              type: "REGISTERED",
              email,
            })
          );
        }
      } catch (error) {
        console.error(
          "WebSocket message error:",
          error
        );
      }
    });

    ws.on("close", () => {
      if (registeredEmail) {
        const clients =
          emailClients.get(registeredEmail);

        if (clients) {
          clients.delete(ws);

          if (clients.size === 0) {
            emailClients.delete(
              registeredEmail
            );
          }
        }
      }

      console.log(
        "WebSocket client disconnected"
      );
    });

    ws.on("error", (error) => {
      console.error(
        "WebSocket error:",
        error.message
      );
    });
  });

  return wss;
};

const notifyEmailVerified = (email) => {
  const normalizedEmail = normalizeEmail(email);

  const clients =
    emailClients.get(normalizedEmail);

  if (!clients || clients.size === 0) {
    console.log(
      `No WebSocket client waiting for ${normalizedEmail}`
    );

    return;
  }

  const message = JSON.stringify({
    type: "EMAIL_VERIFIED",
    email: normalizedEmail,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }

  console.log(
    `EMAIL_VERIFIED WebSocket event sent to ${normalizedEmail}`
  );
};

module.exports = {
  initEmailVerificationSocket,
  notifyEmailVerified,
};