![whitebrick logo](doc/whitebrick-logo-white-hz-sm.png)

# whitebrick (front end) BETA

<!-- START:HEADER ================================================== -->

### Open Source Airtable Alternative (No Code DB)

| ![Screenshot](doc/whitebrick-landing-screenshot-1.png) | ![Screenshot](doc/whitebrick-landing-screenshot-2.png) | ![Screenshot](doc/whitebrick-landing-screenshot-3.png) | ![Screenshot](doc/whitebrick-landing-screenshot-4.png) |
| :----------------------------------------------------: | :----------------------------------------------------: | :----------------------------------------------------: | :----------------------------------------------------: |
|                <sub>Add a record</sub>                 |               <sub>Crete a column</sub>                |                 <sub>Create a DB</sub>                 |                <sub>Manage access</sub>                |

#### Whitebrick is a lightweight No Code Database with 3 points of difference:

1. The front end uses a [Gatsby static Jamstack](https://www.gatsbyjs.com/) client for dead easy customization and deployment.
2. The back end is a set of [Serverless functions](https://www.serverless.com/) for making DDL calls to [PostgreSQL](https://www.postgresql.org/) and configuring [Hasura GraphQL server](https://hasura.io/).
3. The [PostgreSQL](https://www.postgresql.org/) database schemas can be accessed directly with **_psql_** for data import/export and integrations with other tools.

##### Rather than reinventing the wheel Whitebrick stitches together the best-in-breed open source apps:

[Hasura](https://hasura.io/) | [Gastsby](https://www.gatsbyjs.com/) | [PostgreSQL](https://www.postgresql.org/) | [AG Grid](https://ag-grid.com/) | [Apollo](https://www.apollographql.com/) | [Serverless](https://www.serverless.com/)

---

#### Current Project status as of November:

We're currently fixing bugs and trying to get the Beta release stable.

Please use GitHub [Issues](https://github.com/whitebrick/whitebrick-cloud/issues) to report bugs and [Discussions](https://github.com/whitebrick/whitebrick-cloud/discussions) for questions, features and suggestions.

- [x] DDL Table & Column CRUD
- [x] Live editing with subscription
- [x] Table-level RBAC
- [x] Joins
- [x] Background process queue
- [ ] Background process UI
- [ ] UI styling and themes
- [ ] Psql reader/writer access
- [ ] Validations
- [ ] Bucket file download columns
- [ ] Column-level RBAC

Hosted demo at [whitebrick.com](https://whitebrick.com)

<!-- END:HEADER ================================================== -->

---

#### Licensing

<!-- START:LICENSING ================================================== -->

Whitebrick is [licensed](https://github.com/whitebrick/whitebrick-cloud/blob/main/LICENSE) under the Apache License v2.0 however the dependencies use a variety of different licenses. We are working on a simple guide to outline the license information and options by use case - TBA.

<!-- END:LICENSING ================================================== -->

---

### You are currently viewing the front end client repository (whitebrick)

- The back end repository can be found [here](https://github.com/whitebrick/whitebrick-cloud)
- Documentation can be found [here](https://hello.whitebrick.com/docs)

![whitebrick-cloud system diagram](doc/whitebrick-diagram.png)

<!-- START:SUMMARY ================================================== -->

Whitebrick comprises a [front end Gatsby Jamstack](https://github.com/whitebrick/whitebrick) client and [back end Serverless](https://github.com/whitebrick/whitebrick-cloud) application (whitebrick-cloud) that adds multi-tenant DDL and access control functions to a [PostgreSQL](https://www.postgresql.org/) Database via the [Hasura](https://github.com/hasura/graphql-engine) GraphQL Server. The Jamstack client uses [AG Grid](https://ag-grid.com/) as a spreadsheet-like UI that reads/writes table data directly from/to Hasura over GraphQL. Additional functions (eg DDL and access control) are provided by whitebrick-cloud and exposed through the same Hasura endpoint using [Schema stitching](https://hasura.io/docs/latest/graphql/core/remote-schemas/index.html).

<!-- END:SUMMARY ================================================== -->

---

## Getting Started

<!-- START:FRONTEND_SETUP ================================================== -->

### Running Locally

1. **Install Gatsby**

    ```
    npm init gatsby
    ```

    Further information from Gatsby [here](https://www.gatsbyjs.com/docs/quick-start/)

2. **Clone this repository**

    ```
    git clone git@github.com:whitebrick/whitebrick.git
    ```

3. **Configure the Client**

    ```
    cp .env.example .env.development
    vi .env.development

    GATSBY_HASURA_GRAPHQL_URL=https://graph.whitebrick.com/v1/graphql
    GATSBY_HASURA_GRAPHQL_WSS_URL=wss://graph.whitebrick.com/v1/graphql
    GATSBY_AUTH0_DOMAIN=auth.whitebrick.com
    GATSBY_AUTH0_CLIENT_ID=sc0K4pJGgyNZ5x9L27POwgfXPsCZPtJZ
    GATSBY_AUTH0_CALLBACK=https://whitebrick.com/home/index.html
    GATSBY_AUTH0_AUDIENCE=https://production-whitebrick.us.auth0.com/api/v2/
    # IF HOSTING YOUR OWN CLOUD BACK END:
    # GATSBY_HASURA_GRAPHQL_ADMIN_SECRET=MyHasuraSecret
    ```

4. **Start Gatsby**

    ```
    npm run develop
    ```

    Gatsby will start a hot-reloading development environment accessible by default at http://localhost:8000.

### Gatsby Shadowing

TBD

<!-- END:FRONTEND_SETUP ================================================== -->

---

<!-- START:LINKS ================================================== -->

- [Web](https://whitebrick.com/)
- [Documentation](https://hello.whitebrick.com/docs)
- [Discord](https://discord.gg/FPvjPCYt)
- [Medium](https://towardsdatascience.com/towards-a-modern-lims-dynamic-tables-no-code-databases-and-serverless-validations-8dea03416105)

<!-- END:LINKS ================================================== -->
