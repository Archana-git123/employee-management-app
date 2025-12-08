const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const { buildSchema } = require("graphql");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

//  PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "employee_db",
  password: "admin",
  port: 5432,
});

//  Authentication Middleware
app.use((req, res, next) => {
  req.role = req.headers["x-user-role"] || "employee";
  next();
});

//  GraphQL Schema
const schema = buildSchema(`
  type Employee {
    id: ID!
    name: String
    position: String
    department: String
    salary: Float
    created_at: String
  }

  type Query {
    employees: [Employee]
    employee(id: ID!): Employee
  }

  type Mutation {
    addEmployee(name: String!, position: String, department: String, salary: Float): Employee
    updateEmployee(id: ID!, name: String, position: String, department: String, salary: Float): Employee
    deleteEmployee(id: ID!): Boolean
  }
`);

const checkAdmin = (req) => {
  if (req.role !== "admin") throw new Error("Unauthorized. Admin access required.");
};

// Resolvers
const root = {
  employees: async () => {
    const result = await pool.query("SELECT * FROM employees ORDER BY id ASC");
    return result.rows;
  },

  employee: async ({ id }) => {
    const result = await pool.query("SELECT * FROM employees WHERE id = $1", [id]);
    return result.rows[0];
  },

  addEmployee: async ({ name, position, department, salary }, req) => {
    checkAdmin(req);

    const result = await pool.query(
      "INSERT INTO employees (name, position, department, salary) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, position, department, salary]
    );

    return result.rows[0];
  },

  updateEmployee: async ({ id, name, position, department, salary }, req) => {
    checkAdmin(req);

    const result = await pool.query(
      `UPDATE employees
       SET name = $1, position = $2, department = $3, salary = $4
       WHERE id = $5 RETURNING *`,
      [name, position, department, salary, id]
    );

    return result.rows[0];
  },

  deleteEmployee: async ({ id }, req) => {
    checkAdmin(req);

    await pool.query("DELETE FROM employees WHERE id = $1", [id]);
    return true;
  },
};

//  GraphQL endpoint
app.use(
  "/graphql",
  (req, res) =>
    createHandler({
      schema,
      rootValue: root,
      context: req,
    })(req, res)
);

//  GraphiQL UI
app.get('/graphiql', (req, res) => {
  res.send(`
    <html>
      <body style="margin:0;">
        <div id="graphiql" style="height:100vh;"></div>

        <!-- React & ReactDOM -->
        <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>

        <!-- GraphiQL -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphiql/graphiql.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/graphiql/graphiql.min.js"></script>

        <script>
          const fetcher = (params) =>
            fetch('/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-role': 'admin'
              },
              body: JSON.stringify(params),
            }).then(res => res.json());

          ReactDOM.render(
            React.createElement(GraphiQL, { fetcher }),
            document.getElementById('graphiql')
          );
        </script>
      </body>
    </html>
  `);
});


app.listen(4000, () =>
  console.log("Server running at http://localhost:4000/graphiql")
);
