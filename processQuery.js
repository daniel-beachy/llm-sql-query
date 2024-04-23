import { getTablesSchema, executeQuery } from "./dbUtility.js";
import OpenAI from "openai";
import readline from "readline";

const openai = new OpenAI({
  apiKey: "INSERT_API_KEY",
});

const logging = true;

export async function processQuery(queryText) {
  const tableSchemas = await getTablesSchema("chinook.db");

  delete tableSchemas["sqlite_stat1"];
  delete tableSchemas["sqlite_sequence"];

  const readableSchemas = formatTableSchemas(tableSchemas);

  if (logging) {
    console.log("------------- DB Schema -------------");
    console.log(readableSchemas);
    console.log("-------------------------------------");
  }

  const sqlQueryToUse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that knows a lot about SQL language and manages a database.
        You are using Postgres 12.
        You MUST answer only with the SQL query for that query and don't wrap it into a code block. Don't include any explanation.
        Today is ${new Date().toLocaleDateString()}.
        Here is the schema for the database so that you know what column names to use for which tables:

        ${readableSchemas}
        `,
      },
      {
        role: "user",
        content: `${queryText} `,
      },
    ],
  });

  const query = sqlQueryToUse.choices[0].message["content"];

  if (logging) {
    console.log("------------- SQL Query -------------");
    console.log(query);
    console.log("-------------------------------------");
  }

  const dbResponse = await executeQuery("chinook.db", query);

  if (logging) {
    console.log("------------ DB Response ------------");
    console.log(dbResponse);
    console.log("-------------------------------------");
  }

  const dbResponseExplained = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You will be given a query and the result of executing the query on a database
        once the query was transformed into SQL.
        WITHOUT quoting the actual database response, respond to the user as if they had just
        asked you the query themselves. Use the data in the database response in your awnser.
        Do not mention an ID in the database response UNLESS the user asked for the ID in their query.
        `,
      },
      {
        role: "user",
        content: `-----------------------------------------
              Query: ${queryText}
              -----------------------------------------
              Result: ${JSON.stringify(dbResponse, null, 2)}`,
      },
    ],
  });

  return dbResponseExplained.choices[0].message["content"];
}

function formatTableSchemas(tableData) {
  let output = "";

  for (const tableName in tableData) {
    output += `--- TABLE: '${tableName}' ---\n`;
    tableData[tableName].forEach((column) => {
      output += `column name '${column.name}', type '${column.type}'`;
      if (column.primaryKey) {
        output += `, is primary key`;
      }
      output += "\n";
    });
    output += "\n";
  }

  return output;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("------------------------------------------------------------");
rl.question("Enter Query: ", async (query) => {
  console.log("------------------------------------------------------------");
  const gptResult = await processQuery(query);
  console.log("Response: ", gptResult);
  console.log("------------------------------------------------------------");
  rl.close();
});
