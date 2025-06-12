const { Op } = require("sequelize");

/**
 * Generic pagination with search and sorting
 * @param {Object} model - Sequelize model
 * @param {Object} options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Number of records per page
 * @param {string} options.search - Keyword to search
 * @param {Array<string>} options.searchFields - Fields to apply LIKE search
 * @param {string} options.orderBy - Field to sort by
 * @param {'ASC' | 'DESC'} options.orderDirection - Sort direction
 * @param {Object} options.where - Additional filters
 * @param {Array} options.include - Sequelize associations
 */
async function paginate(
  model,
  {
    page = 1,
    limit = 10,
    search = "",
    searchFields = "",
    orderBy = "createdAt",
    orderDirection = "DESC",
    where = {},
    include = [],
  } = {}
) {
  searchFields = searchFields.split(",");
  
  const offset = (page - 1) * limit;

  if (search && searchFields.length > 0) {
    where[Op.or] = searchFields.map((field) => ({
      [field]: { [Op.iLike]: `%${search}%` },
    }));
  }

  const { count, rows } = await model.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order: [[orderBy, orderDirection]],
  });

  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
    },
  };
}

module.exports = paginate;
