module.exports = {
  port: process.env.PORT || '3000',
  oracledb: {
    user: process.env.NODE_ORACLEDB_USER || 'test',
    password: process.env.NODE_ORACLEDB_PASSWORD || 'test',

    // For information on connection strings see:
    // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#connectionstrings
    // When using `tnsnames.ora` config file
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || 'ES206',
    // When using plain text
    // connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING ||
    //   '(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = es206)(PORT = 1521)))(CONNECT_DATA = (SERVICE_NAME = secimdwh)))',

    // Max rows number when fetching data from Result Set
    numRows: 20
  },
  messages: {
    ERR_DB_GET_POOL: 'Can not connect to DB or get POOL fail.',
    ERR_DB_GET_CONNECTION: 'Can not connect to DB or get CONNECTION fail.'
  }
}
