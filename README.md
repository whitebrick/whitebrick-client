![whitebrick logo](doc/whitebrick-logo-white-hz-sm.png)

# whitebrick (front end) BETA

[//]: # 'START:COMMON_HEADER'

### Open Source Airtable Alternative (No Code DB)

#### Whitebrick is a lightweight No Code Database with three points of difference:

1. The front end uses a [Gatsby static Jamstack](https://www.gatsbyjs.com/) client for easy customization and hosting.
2. The back end is a set of [Serverless functions](https://www.serverless.com/) for making DDL calls to [PostgreSQL](https://www.postgresql.org/) and configuring [Hasura GraphQL server](https://hasura.io/).
3. The [PostgreSQL](https://www.postgresql.org/) database schemas can be accessed directly with **_psql_** for data import/export and integrations with other tools.

##### Rather than reinventing the wheel Whitebrick stitches together the best-in-breed open source apps:

[Hasura](https://hasura.io/) | [Gastsby](https://www.gatsbyjs.com/) | [PostgreSQL](https://www.postgresql.org/) | [AG Grid](https://ag-grid.com/) | [Apollo](https://www.apollographql.com/) | [Serverless](https://www.serverless.com/)

---

#### Current Project status as of August:

We're currently fixing bugs and trying to get the Beta release stable. **NB: _This is Beta software - use at your own risk!_**

Please use GitHub [Isues](https://github.com/whitebrick/whitebrick-cloud/issues) to report bugs and [Discussions](https://github.com/whitebrick/whitebrick-cloud/discussions) for questions and suggestions.

- [x] DDL Table & Column CRUD
- [x] Live editing with subscription
- [x] Table-level RBAC
- [x] Joins
- [ ] Documentation
- [ ] UI styling and themes
- [ ] Direct pg reader/writer access
- [ ] Validation
- [ ] Bucket file download columns
- [ ] Column-level RBAC

Hosted demo at [whitebrick.com](https://whitebrick.com)

---

#### License

Whitebrick is [licensed](LICENSE) under the Apache License v2.0 however the dependencies use a variety of different licenses. We are working on a simple guide to outline the license information and options by use case - TBA.

---

[//]: # 'END:COMMON_HEADER'

### You are currently viewing the front end client repository (whitebrick)

- The back end repository can be found [here](https://github.com/whitebrick/whitebrick-cloud)

[//]: # 'START:COMMON_DESCRIPTION'

![whitebrick-cloud system diagram](doc/whitebrick-diagram.png)

Whitebrick comprises a front end [Gatsby](https://www.gatsbyjs.com/) Jamstack client and back end [Serverless](https://www.serverless.com/) application (whitebrick-cloud) that adds multi-tenant DDL and access control functions to a [PostgreSQL](https://www.postgresql.org/) Database via the [Hasura](https://github.com/hasura/graphql-engine) GraphQL Server. The Jamstack client uses [AG Grid](https://ag-grid.com/) as a spreadsheet-like UI that reads/writes table data directly from/to Hasura over GraphQL. Additional functions (eg DDL and access control) are provided by whitebrick-cloud and exposed through the same Hasura endpoint using [Schema stitching](https://hasura.io/docs/latest/graphql/core/remote-schemas/index.html).

---

[//]: # 'END:COMMON_DESCRIPTION'

## Getting Started

### Running Locally

1.  #### Install Gatsby

```
npm init gatsby
```
Further information from Gatsby [here](https://www.gatsbyjs.com/docs/quick-start/)

2. #### Clone this repository

```
git clone git@github.com:whitebrick/whitebrick.git
```

3. #### Configure the Client

```
cp .env.example .env.development
vi .env.development

GATSBY_HASURA_GRAPHQL_URL=https://graph.whitebrick.com/v1/graphql
GATSBY_HASURA_GRAPHQL_WSS_URL=wss://graph.whitebrick.com/v1/graphql
GATSBY_AUTH0_DOMAIN=auth.whitebrick.com
GATSBY_AUTH0_CLIENTID=sc0K4pJGgyNZ5x9L27POwgfXPsCZPtJZ
GATSBY_AUTH0_CALLBACK=https://whitebrick.com/home/index.html
GATSBY_AUTH0_AUDIENCE=https://production-whitebrick.us.auth0.com/api/v2/
# IF HOSTING YOUR OWN CLOUD BACK END:
# GATSBY_HASURA_GRAPHQL_ADMIN_SECRET=MyHasuraSecret
```

4. #### Start Gatsby

```
npm run develop
```
Gatsby will start a hot-reloading development environment accessible by default at http://localhost:8000.






