# whitebrick jamstack client

Open source alternative to Airtable

## Sprint: Intro and init

1. Go to https://baserow.io/ create a free online acount, have a quick play with the UI

- This is what we are trying to create as a final product but instead with a static Jamstack front-end and Hasura/GraphQL backend
- We want to re-use as many libraries as possible (eg aG-Grid) not re-invent the wheel

2. TypeScript Redux Gatsby boiler plate: https://www.gatsbyjs.com/starters/Evaluates2/Gatsby-Starter-TypeScript-Redux-TDD-BDD/
3. Configuring Redux with ag-Grid https://www.ag-grid.com/react-grid/redux-integration-pt1/
4. Tutorial https://thinkster.io/tutorials/using-ag-grid-with-react-data
5. Adding Redux to Gatsby https://www.gatsbyjs.com/docs/adding-redux-store/
6. Test data source:

- https://graph-staging.whitebrick.com/
- Direct access to DB schema (might be useful for debugging) `psql -U hasurausr -h hh5mh6rdexxdn6.c297djhbbcfn.us-east-1.rds.amazonaws.com postgres`

7. Try and get ag-Grid using data from test data source (see Milestone 1 below)

## Housekeeping

- Develop on main branch
- Add any notes directly to this README.md
- Discussions on Signal or https://github.com/whitebrick/whitebrick/discussions/ and tag users for response

## Background

The goal of this project is to create an open source alternative to [Airtable](https://airtable.com) - ie a no code database for science and engineering.

If you take Google Sheets as an example - in the same way you can add new sheets and columns to an empty spreadsheet, this app allows you to create an empty relational database, add new tables and new columns and then link corresponding columns from the UI (which creates foreign keys behind the scenes)

The project will be built on the following stack:

- Hasura backend (GraphQL on top of Postgres)
- Gatsby jamstack with ag-Grid

ag-Grid has a full-featured and well documented API and tutorial here: https://thinkster.io/tutorials/using-ag-grid-with-react-data

Roadmap:

1. Fixed schemas - multi-tenant, multi-user CRUD, pagination and column sorting
2. Dynamic schema - add/edit new databases, tables and columns
3. Authorization and authentication
4. User preferences, filters, sorting
5. Validations
6. ... more TBA

## Milestone 1: Multi-tenant, multi-user CRUD, pagination and order-by with fixed schemas

This milestone involves setting up a Next.js or Gatsby jamstack app from scratch and wiring up ag-Grid to redux toolkit and GraphQL

Assume we have 2 tenants/organizations: **_Smith & Son Retailers_** and **_Donna's Media_**

| tenant_id | tenant_name  | tenant_label          |
| --------- | ------------ | --------------------- |
| 1         | smithson     | Smith & Son Retailers |
| 2         | donnas-media | Donna's Media         |

Smith & Son Retailers only has one shop called "Northwind" and one relational database.

Donna's Media operates two separate shops "Chinook Music" and "Donna's DVD Rentals" and each shop has it's own relational database.

| database_id | database_name | tenant_id |
| ----------- | ------------- | --------- |
| 1           | northwind     | 1         |
| 2           | chinook       | 2         |
| 3           | donnasdvd     | 2         |

- These databases are filled with test data and a Postgres endpoint will be provided to view and update from psql
- A GraphQL endpoint will be provided for queries, mutations and subscriptions
- The Hasura GraphiQL web UI will be provided which is a nice utility to build and test queries against the schema from a web page

### Listing tables and viewing data

- Use introspection to discover all tables and columns for $database_name and populate "table_name" select
- When a table is selected, display the corresponding data
- If $subscribe==true use subscription, otherwise use query
- Register with redux toolkit for state changes
- Add pagination buttons and a select for records per page (that makes server-side queries)
- Connect server-side column sorting (ag-grid provides the UI, query modifiers need to be written)

### Editing tables and mutating data

- Write mutations to support editing single and multiple values (eg filling down or pasting multiple rows at a time)
- If $subscribe==true then other viewers (eg open a new tab) should see the update immediately
- Write mutations to add single and multiple new rows
