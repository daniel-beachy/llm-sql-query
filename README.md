# Natural Language SQLite Interface with OpenAI's GPT Models

This project provides a natural language interface to a SQLite database, leveraging OpenAI's GPT models to process SQL queries and responses. It's designed to facilitate interactions with databases using natural language, making it easier for users to query and understand database results without needing to write SQL queries. While this example uses an sqlite database, you could modify it to use another SQL database with some tweaks. In order to use a different database you will need to make changes in the `dbUitility.js` file. To use it as is, you must have an sqlite database file in the root folder. You can then change the reference to 'chinook.db' within the script.

## Features

- **Natural Language Processing**: Utilizes OpenAI's GPT models to understand and generate SQL queries from natural language inputs.
- **Database Interaction**: Interacts with a SQLite database, executing queries and returning results in a human-readable format.
- **Logging**: Optionally logs database schema, SQL queries, and responses for debugging and analysis purposes.

## Getting Started

### Prerequisites

- Node.js installed on your system.
- An OpenAI API key.

### Installation

1. Clone the repository to your local machine.
2. Install the project dependencies by running `npm install`.
3. Place your OpenAI API key in processQuery.js `apiKey: "INSERT_API_KEY"`.

### Running the Interface

To start the interface, run the following command:

```bash
node processQuery.js
```

## Usage

After starting the interface, you will be prompted to enter a query. Type your question in natural language, and the interface will process it, execute the corresponding SQL query on the database, and return the result in a human-readable format.

## Acknowledgments

- OpenAI for providing the GPT models.
- SQLite for the database system.
- Node.js for the runtime environment.
