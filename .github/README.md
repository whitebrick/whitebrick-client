![whitebrick logo](https://hello.whitebrick.com/assets/whitebrick-logo-white-hz-sm.png)

# whitebrick (front end) BETA
(See [whitebrick-cloud](https://github.com/whitebrick/whitebrick-cloud) for the back end repo)
<!-- START:HEADER ================================================== -->

### Instant front end for your existing Database
_or create new Databases with No Code_
| ![Screenshot](https://hello.whitebrick.com/assets/whitebrick-landing-screenshot-1.png) | ![Screenshot](https://hello.whitebrick.com/assets/whitebrick-landing-screenshot-2.png) | ![Screenshot](https://hello.whitebrick.com/assets/whitebrick-landing-screenshot-3.png) | ![Screenshot](https://hello.whitebrick.com/assets/whitebrick-landing-screenshot-4.png) |
| :------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: |
|                               <sub>Adding a record</sub>                               |                              <sub>Creating a column</sub>                              |                                <sub>Creating a DB</sub>                                |                               <sub>Managing access</sub>                               |

### Read and write new records or add new columns and tables just like using a spreadsheet.
1. On-prem, Cloud, SaaS or Hybrid. Currently supports PostgreSQL and Citus (MySQL, MS SQL Server coming soon).
2. The front end is built on a [Gatsby static Jamstack](https://www.gatsbyjs.com/) for dead easy customization and deployment.
3. The back end is a set of [Serverless functions](https://www.serverless.com/) for making DDL calls to your Database and configuring [Hasura](https://hasura.io/) for instant GraphQL.

##### Whitebrick stitches together the best-in-breed open source apps:

[Hasura](https://hasura.io/) | [Gastsby](https://www.gatsbyjs.com/) | [AG Grid](https://ag-grid.com/) | [Apollo](https://www.apollographql.com/) | [Serverless](https://www.serverless.com/)

---

#### Current Project status as of February:

We're currently fixing bugs and trying to get the Beta release stable.

Please use GitHub [Issues](https://github.com/whitebrick/whitebrick/issues) to report bugs and [Discussions](https://github.com/whitebrick/whitebrick/discussions) for questions, features and suggestions.

:point_right: **Background Job UI** - when a new column or new table is added/updated Hasura needs to re-track the schema and because this can take some time it is processed in the background. We currently do not have any progress indicator and instead just a "Please try again in a minute" which we're working on.

**Roadmap:**

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

Whitebrick is [licensed](https://github.com/whitebrick/whitebrick-cloud/blob/main/LICENSE) under the MIT License however the dependencies use a variety of different licenses. We are working on a simple guide to outline the license information and options by use case - TBD.

<!-- END:LICENSING ================================================== -->

---

### You are currently viewing the front end client repository (whitebrick)

- The back end repository can be found [here](https://github.com/whitebrick/whitebrick-cloud)
- Documentation can be found [here](https://hello.whitebrick.com/docs)

![whitebrick-cloud system diagram](https://hello.whitebrick.com/assets/whitebrick-diagram.png)

<!-- START:SUMMARY ================================================== -->

Whitebrick comprises a [front end Gatsby Jamstack](https://github.com/whitebrick/whitebrick) client and [back end Serverless](https://github.com/whitebrick/whitebrick-cloud) application (whitebrick-cloud) that adds multi-tenant DDL and access control functions to a Database via the [Hasura](https://github.com/hasura/graphql-engine) GraphQL Server. The Jamstack client uses [AG Grid](https://ag-grid.com/) as a spreadsheet-like UI that reads/writes table data directly from/to Hasura over GraphQL. Additional functions (eg DDL and access control) are provided by whitebrick-cloud and exposed through the same Hasura endpoint using [Schema stitching](https://hasura.io/docs/latest/graphql/core/remote-schemas/index.html).

<!-- END:SUMMARY ================================================== -->

<!-- START:TECHNICAL_OVERVIEW ================================================== -->

### Hasura

Hasura is a server application that automatically wraps a GraphQL API around a standard relational database.
Hasura is written in Haskell and can be easily deployed directly from a Docker image.
The server comes with a web GUI admin console that allows the underlying database to be browsed and _Tracked_ so that it can be accessed over GraphQL.
Hasura also provides a WebSocket endpoint for subscription queries.

**Database Queries**

Whitebrick queries Hasura to display table data and to update table records. When table data is queried, paginated, sorted and updated (mutated) this is all managed by Hasura over GraphQL.

**Schema Stitching**

Hasura can also _stitch_ schemas together and pass requests on to other external endpoints. When Whitebrick requests DDL functions such as adding a new table or column, Hasura passes this request on to the Whitebrick Cloud Serverless app and then returns the response through the same single GraphQL endpoint.

**Metadata API**

Hasura provides a separate HTTP API that allows database metadata to be programmatically updated and refreshed. For example, when Whitebrick Cloud executes DDL commands to add a column to a table, it then calls this Hasura API to update the metadata so the new column can be tracked and queried over GraphQL.

**Authentication & Authorization**

Because Hasura stitches together multiple APIs under the one unified endpoint it is well placed to manage authentication and authorization. Hasura integrates with authentication providers such as Auth0 by checking for role variables encoded in JWTs with each request. Hasura also provides functionality to set permissions at a column level so checks can be configured to look-up user records for authorization.

### Whitebrick Cloud (back end)

The Whitebrick Cloud back end is a set of functions written in Javascript using the Apollo GraohQL interface and executed on a Serverless provider. Whitebrick Cloud connects with a database to make DDL calls such as creating new tables and columns. After mofifying the database Whitebrick Cloud then calls the Hasura Metadata API to _track_ the corresponding columns and tables. Whitebrick Cloud also manages additional metadata, background jobs, user permissions and settings, persisting them in a dedicated schema.

### Whitebrick (front end)

The Whitebrick front end is statically compiled Jamstack client written in Gatsby/React/Javascipt and uses AG Grid as the data grid GUI. Whitebrick sends GraphQL queries and mutations to the Hasura endpoint and displays the returned data. Because the client is statically compiled it can be easily customized by front end developers and deployed to any web site host.

<!-- END:TECHNICAL_OVERVIEW ================================================== -->

---

## Getting Started

<!-- START:FRONTEND_SETUP ================================================== -->

### Getting Started with Shadowing

The Whitebrick front end is packaged as a [Gatsby Theme](https://www.gatsbyjs.com/docs/themes/) that can be installed from `npm`. Gatsby Themes are customized using a system called [Shadowing](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/shadowing/) that allows individual pages, components and assets to be overridden by conforming to a specific directory structure. The advantage of this is that the Whitebrick client _Theme_ can be maintained and updated independently of your customizations.

The easiest way to get started is to use our Gastby _Starter_ that installs our Gatsby _Theme_ and also includes a simple example of overriding the header and branding.

1. **Clone the Whitebrick Starter Repository**

    ```
    git clone git@github.com:whitebrick/gatsby-starter-whitebrick.git
    ```

2. **Install Packages**

    ```
    cd gatsby-starter-whitebrick
    npm install
    ```

3. **Start Gatsby**

    ```
    npm run develop
    ```

    Gatsby will start a hot-reloading development environment accessible by default at `http://localhost:8000`.

4. **Customize**

    Copy or add files to the `gatsby-starter-whitebrick/src` directory to make changes by overriding the corresponding [Whitebrick Theme files](https://github.com/whitebrick/whitebrick/tree/main/src).

### Forking & Contributing

To run the Whitebrick client independently (rather than as a Theme) simple clone the Whitebrick [repository](https://github.com/whitebrick/whitebrick), configure the `.env` and run Gatsby directly.

1. **Clone or Fork the Whitebrick Client Repository**

    ```
    git clone git@github.com:whitebrick/whitebrick.git
    ```

2. **Install Packages**

    ```
    cd whitebrick
    npm install
    ```

3. **Configure the Client**

    The `.env.development` is provided with default values - see `.env.example` for additional options.

4. **Start Gatsby**

    ```
    npm run develop
    ```

    Gatsby will start a hot-reloading development environment accessible by default at `http://localhost:8000`.

5. **Develop and Submit Pool Request**

    Submit Pull Requests from the [Whitebrick GitHub](https://github.com/whitebrick/whitebrick) repository

<!-- END:FRONTEND_SETUP ================================================== -->

---

<!-- START:LINKS ================================================== -->

- [Web](https://whitebrick.com/)
- [Documentation](https://hello.whitebrick.com/docs)
- [Discord](https://discord.gg/FPvjPCYt)
- [Medium](https://towardsdatascience.com/towards-a-modern-lims-dynamic-tables-no-code-databases-and-serverless-validations-8dea03416105)

<!-- END:LINKS ================================================== -->
