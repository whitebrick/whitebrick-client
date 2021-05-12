import * as React from "react"
import Table from '../components/table'
import { GraphQLClient, ClientContext } from "graphql-hooks"
import { Provider } from 'react-redux'
import Modal from 'react-modal';

import store from '../store';

import '../styles/sidebar.css';
import 'rc-pagination/assets/index.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from "../components/layout"
import { useState } from "react"

const IndexPage = () => {
  const client = new GraphQLClient({
    url: process.env.GATSBY_HASURA_GRAPHQL_URL,
    headers: { 'x-hasura-admin-secret': process.env.GATSBY_HASURA_GRAPHQL_ADMIN_SECRET }
  })

  const [tableName, setTableName] = useState('');
  const [user, setUser] = useState('');

  const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

  return (
    <Provider store={store}>
      <ClientContext.Provider value={client}>
        <Layout user={user} tableName={tableName} setTableName={setTableName}>
          <Modal
            isOpen={user === ''}
            style={customStyles}
            contentLabel="Example Modal"
          >
            <ul className="list-group p-4 m-4" style={{ cursor: 'pointer' }}>
              <li className="list-group-item" onClick={() => setUser('test_donna@example.com')}>
                test_donna@example.com
              </li>
              <li className="list-group-item" onClick={() => setUser('test_debbie@example.com')}>
                test_debbie@example.com
              </li>
              <li className="list-group-item" onClick={() => setUser('test_daisy@example.com')}>
                test_daisy@example.com
              </li>
              <li className="list-group-item" onClick={() => setUser('test_nick_north@example.com')}>
                test_nick_north@example.com
              </li>
            </ul>
          </Modal>
          {user !== '' && <Table table={tableName} />}
        </Layout>
      </ClientContext.Provider>
    </Provider>
  )
}

export default IndexPage
