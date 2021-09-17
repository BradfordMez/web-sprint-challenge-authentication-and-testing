// Write your tests here
const request = require("supertest");
const db = require("../data/dbConfig");
const server = require("./server");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeAll(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

test("sanity", () => {
  expect(true).toBe(true);
});
describe("[POST] Auth-Router Register", () => {
  test("Register creates a new User on success", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "Braffuh", password: "BraffPass" });
    const Braffuh = await db("users").where("username", "Braffuh").first();
    expect(Braffuh).toMatchObject({ username: "Braffuh" });
  });
  test("Register responds with the proper status code and message on 'username taken'", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "UserOne", password: "Password" });
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "UserOne", password: "Password" });
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/username taken/i);
  });
});
describe("[POST] Auth-Router Login", () => {
  test("Login responds with the correct message on valid credentials", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "UserOne", password: "Password" });
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "UserOne", password: "Password" });
    expect(res.body.message).toMatch(/welcome, UserOne/i);
  });
  test("Login responds with proper message on Invalid Credentials", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "UserOne", password: "Password" });
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "UserOne", password: "Passwalk" });
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});
describe("[GET] Jokes", () => {
  test("Jokes dont load if User is not logged in", async () => {
    const res = await request(server).get("/api/jokes/");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token required/i);
  });
  test("Jokes load if User is logged in", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "UserThree", password: "Password" });
    await request(server)
      .post("/api/auth/login")
      .send({ username: "UserThree", password: "Password"});
    const res = await request(server).get("/api/jokes/");
    expect(res.status).toBe(200);
  });
});
