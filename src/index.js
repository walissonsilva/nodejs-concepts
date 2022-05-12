const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (user) {
    request.user = user;
    next();
  } else {
    response
      .status(404)
      .json({ error: `User with username ${username} was not found` });
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  const usernameAlreadyExists = users.find(
    (user) => user.username === username
  );

  if (usernameAlreadyExists) {
    response
      .status(400)
      .json({ error: `User with username ${username} already exists.` });
  }

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos = [...user.todos, newTodo];

  response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    response.status(404).json({ error: `Not found todo with id ${id}.` });
  }

  todo.title = title;
  todo.deadline = deadline;

  response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    response.status(404).json({ error: `Not found todo with id ${id}.` });
  }

  todo.done = true;

  response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const newTodos = user.todos.filter((todo) => todo.id !== id);

  if (newTodos.length === user.todos.length) {
    response.status(404).json({ error: `Not found todo id ${id}` });
  }

  user.todos = newTodos;

  response.status(204).json(newTodos);
});

module.exports = app;
