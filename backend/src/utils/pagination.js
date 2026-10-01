function paginationFromQuery(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  return { page, limit, skip: (page - 1) * limit };
}

function paginationResult(page, limit, total) {
  return { page, limit, total, pages: Math.ceil(total / limit) };
}

module.exports = { paginationFromQuery, paginationResult };
