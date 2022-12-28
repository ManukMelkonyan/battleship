const { createClient } = require("redis");
const client = createClient();
client.connect().then(async () => {
  console.log(await client.get("board:1"));
});
// client.connect();
