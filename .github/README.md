![whitebrick logo](https://hello.whitebrick.com/assets/whitebrick-logo-white-hz-sm.png)

# whitebrick-client No Code DB

### :warning: **This project is no longer maintained**
---

_gatsby-theme-whitebrick-client_ (See [whitebrick-cloud](https://github.com/whitebrick/whitebrick-cloud) for back end)
<!-- START:HEADER ================================================== -->

##### No Code Database built on Hasura, GraphQL, Gatsby and Serverless

| ![Screenshot](https://hello.whitebrick.com/assets/whitebrick-landing-screenshot-1.png) | ![Screenshot](https://hello.whitebrick.com/assets/whitebrick-landing-screenshot-2.png) | ![Screenshot](https://hello.whitebrick.com/assets/whitebrick-landing-screenshot-3.png) | ![Screenshot](https://hello.whitebrick.com/assets/whitebrick-landing-screenshot-4.png) |
| :------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: |
|                               <sub>Adding a record</sub>                               |                              <sub>Creating a column</sub>                              |                                <sub>Creating a DB</sub>                                |                               <sub>Managing access</sub>                               |

Points of difference:
1. [Gatsby static Jamstack](https://www.gatsbyjs.com/) client allows for easy customization with [theme shadowing](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/shadowing/) and simple, zero downtime deployment to static web servers.
2. [Hasura](https://hasura.io/) is leveraged for battle-tested table tracking, query processing and authentication and RBAC.
3. The [Serverless framework](https://www.serverless.com/) with Apollo GraphQL allows for rapid development of light-weight Lambda support functions.

---

#### Roadmap:

- [x] DDL Table & Column CRUD
- [x] Live editing with subscription
- [x] Table-level RBAC
- [x] Joins
- [x] Background process queue
- [ ] Background process UI
- [ ] UI styling and themes
- [ ] psql reader/writer access
- [ ] Validations
- [ ] Bucket file download columns
- [ ] Column-level RBAC

<!-- END:HEADER ================================================== -->

---

#### Licensing

<!-- START:LICENSING ================================================== -->

Whitebrick is licensed under the MIT License however dependency licenses vary.

<!-- END:LICENSING ================================================== -->

---

#### Overview

- See [https://github.com/whitebrick/whitebrick-cloud](https://github.com/whitebrick/whitebrick-cloud) for back end
- [Documentation](https://hello.whitebrick.com/integration-platform/documentation/)

![system diagram](https://hello.whitebrick.com/assets/whitebrick-no-code-db-diagram.png)

<!-- START:SUMMARY ================================================== -->

The Whitebrick No Code DB (Data Repository) comprises a front end Gatsby Jamstack client ([whitebrick-client](https://github.com/whitebrick/whitebrick-client)) and back end Serverless application ([whitebrick-cloud](https://github.com/whitebrick/whitebrick-cloud)) that adds multi-tenant DDL and access control functions to a Database via the [Hasura](https://github.com/hasura/graphql-engine) GraphQL Server. The Jamstack client uses [AG Grid](https://ag-grid.com/) as a spreadsheet-like UI that reads/writes table data directly from/to Hasura over GraphQL. Additional functions including DDL are provided by whitebrick-cloud Serverless functions that are exposed through the Hasura endpoint via schema stitching.

<!-- END:SUMMARY ================================================== -->

---

## Getting Started

**UPDATE June 2022**: We were unable to find the community interest or commercial support to continue providing the Whitebrick Cloud back end as a service. You will need to run your own back end and authentication service following the instructions [here](https://hello.whitebrick.com/integration-platform/documentation/repository/technical-guide/).

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

    Copy or add files to the `gatsby-starter-whitebrick/src` directory to make changes by overriding the corresponding [Whitebrick Theme files](https://github.com/whitebrick/whitebrick-client/tree/main/src).

### Client Development

To run the Whitebrick client independently (rather than as a Theme) simple clone the Whitebrick [repository](https://github.com/whitebrick/whitebrick-client), configure the `.env` and run Gatsby directly.

1. **Clone or Fork the Whitebrick Client Repository**

    ```
    git clone git@github.com:whitebrick/whitebrick-client.git
    ```

2. **Install Packages**

    ```
    cd whitebrick-client
    npm install
    ```

3. **Configure the Client**

    The `.env.development` is provided with default values - see `.env.example` for additional options.

4. **Start Gatsby**

    ```
    npm run develop
    ```

    Gatsby will start a hot-reloading development environment accessible by default at `http://localhost:8000`.

<!-- END:FRONTEND_SETUP ================================================== -->

## Contributing

- Questions, comments, suggestions and contributions welcome - contact: _hello_ at _whitebrick_ dot _com_

---

<!-- START:LINKS ================================================== -->

- [Documentation](https://hello.whitebrick.com/resources/)
- [Medium](https://towardsdatascience.com/towards-a-modern-lims-dynamic-tables-no-code-databases-and-serverless-validations-8dea03416105)

<!-- END:LINKS ================================================== -->
