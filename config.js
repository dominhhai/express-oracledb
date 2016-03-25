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
    ERR_DB_GET_POOL: 'DBに接続できないかPOOLを取得できないため、クエリを実行できません。',
    ERR_DB_GET_CONNECTION: 'DBに接続できないかCONNECTIONを取得できないため、クエリを実行できません。'
  },
  chart: {
    slide_time: 10000,
    refresh_time: 100000,
    get_data_num_errors: 5
  },
  shnCds: {
    icc: '2922',
    tsa: '2924',
    lpa: '2926',
    tpi: '2927'
  }
}
