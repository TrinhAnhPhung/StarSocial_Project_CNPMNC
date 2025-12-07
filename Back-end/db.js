import { connect, sql } from './config/database.js';

// Query wrapper tương thích với PostgreSQL syntax
const poolWrapper = {
  query: async (queryText, params = []) => {
    try {
      const pool = await connect();
      const request = pool.request();
      
      // Chuyển đổi query từ PostgreSQL sang SQL Server
      let sqlQuery = convertQuery(queryText);
      
      // Thêm parameters
      params.forEach((param, index) => {
        const paramName = `p${index + 1}`;
        sqlQuery = sqlQuery.replace(new RegExp(`\\$${index + 1}\\b`, 'g'), `@${paramName}`);
        request.input(paramName, getSqlType(param), param);
      });
      
      // Thực thi query
      const result = await request.query(sqlQuery);
      
      return {
        rows: result.recordset || [],
        rowCount: result.rowsAffected?.[0] || 0,
      };
    } catch (err) {
      console.error('❌ Lỗi khi thực thi query:', err);
      console.error('Query:', queryText);
      throw err;
    }
  },
};

// Chuyển đổi cú pháp PostgreSQL sang SQL Server
function convertQuery(queryText) {
  let sqlQuery = queryText;
  
  // Chuyển RANDOM() thành NEWID()
  if (!sqlQuery.includes('NEWID()')) {
    sqlQuery = sqlQuery.replace(/ORDER BY RANDOM\(\)/gi, 'ORDER BY NEWID()');
  }
  
  // Chuyển LIMIT thành TOP
  const limitMatch = sqlQuery.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    const limitValue = limitMatch[1];
    sqlQuery = sqlQuery.replace(/SELECT\s+/i, `SELECT TOP ${limitValue} `);
    sqlQuery = sqlQuery.replace(/LIMIT\s+\d+/i, '');
  }
  
  return sqlQuery;
}

// Xác định kiểu dữ liệu SQL
function getSqlType(value) {
  if (value === null || value === undefined) {
    return sql.NVarChar;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? sql.Int : sql.Float;
  }
  if (typeof value === 'boolean') {
    return sql.Bit;
  }
  return sql.NVarChar;
}

export default poolWrapper;
export { sql };
