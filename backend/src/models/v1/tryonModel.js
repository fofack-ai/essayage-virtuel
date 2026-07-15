const db = require("../../config/database");

async function findAll(filters = {}) {
  let query = `
    SELECT
      t.*,
      u.firstName,
      u.lastName,
      u.email,
      p.name as productName,
      p.brand as productBrand,
      (
        SELECT imageUrl
        FROM product_images
        WHERE productId = p.id
        AND isMain = 1
        LIMIT 1
      ) AS productImage
    FROM tryons t
    LEFT JOIN users u ON t.userId = u.id
    LEFT JOIN products p ON t.productId = p.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.userId) {
    query += " AND t.userId = ?";
    params.push(filters.userId);
  }

  // ✅ AJOUT : filtre par guestId (pour les invités)
  if (filters.guestId) {
    query += " AND t.guestId = ?";
    params.push(filters.guestId);
  }

  if (filters.productId) {
    query += " AND t.productId = ?";
    params.push(filters.productId);
  }

  if (filters.isLatest !== undefined) {
    query += " AND t.isLatest = ?";
    params.push(filters.isLatest);
  }

  query += " ORDER BY t.createdAt DESC";

  if (filters.limit !== undefined && filters.offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(filters.limit), parseInt(filters.offset));
  } else if (filters.limit !== undefined) {
    query += " LIMIT ?";
    params.push(parseInt(filters.limit));
  }

  const [rows] = await db.query(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    `
    SELECT
      t.*,
      u.firstName,
      u.lastName,
      u.email,
      p.name as productName,
      p.brand as productBrand,
      (
        SELECT imageUrl
        FROM product_images
        WHERE productId = p.id
        AND isMain = 1
        LIMIT 1
      ) AS productImage
    FROM tryons t
    LEFT JOIN users u ON t.userId = u.id
    LEFT JOIN products p ON t.productId = p.id
    WHERE t.id = ?
    `,
    [id]
  );
  return rows[0];
}

async function findByUserId(userId, limit = 10) {
  const [rows] = await db.query(
    `
    SELECT
      t.*,
      u.firstName,
      u.lastName,
      u.email,
      p.name as productName,
      p.brand as productBrand,
      (
        SELECT imageUrl
        FROM product_images
        WHERE productId = p.id
        AND isMain = 1
        LIMIT 1
      ) AS productImage
    FROM tryons t
    LEFT JOIN users u ON t.userId = u.id
    LEFT JOIN products p ON t.productId = p.id
    WHERE t.userId = ?
    ORDER BY t.createdAt DESC
    LIMIT ?
    `,
    [userId, limit]
  );
  return rows;
}

async function create(tryonData) {
  // If this is set as latest, unset other latest tryons for this user and product
  if (tryonData.isLatest) {
    // On ne peut pas unset pour un invité (pas de userId), on gère seulement si userId existe
    if (tryonData.userId) {
      await db.query(
        `
        UPDATE tryons
        SET isLatest = FALSE
        WHERE userId = ? AND productId = ? AND isLatest = TRUE
        `,
        [tryonData.userId, tryonData.productId]
      );
    }
    // Optionnel : pour un invité, on pourrait unset par guestId + productId
    // mais ce n'est pas critique car invité = session unique
  }

  const [result] = await db.query(
    `
    INSERT INTO tryons
    (userId, guestId, productId, userPhoto, resultImage, score, recommendedSize, notes, isLatest)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      tryonData.userId || null,
      tryonData.guestId || null,
      tryonData.productId,
      tryonData.userPhoto || null,
      tryonData.resultImage || null,
      tryonData.score || null,
      tryonData.recommendedSize || null,
      tryonData.notes || null,
      tryonData.isLatest || false
    ]
  );
  return result.insertId;
}

async function update(id, tryonData) {
  // If this is set as latest, unset other latest tryons for this user and product
  if (tryonData.isLatest) {
    // Récupérer l'essai existant pour connaître le userId ou guestId
    const existing = await findById(id);
    if (existing) {
      if (existing.userId) {
        await db.query(
          `
          UPDATE tryons
          SET isLatest = FALSE
          WHERE userId = ? AND productId = ? AND isLatest = TRUE AND id != ?
          `,
          [existing.userId, existing.productId, id]
        );
      } else if (existing.guestId) {
        // Pour un invité, on peut aussi unset les autres essais du même guestId + productId
        await db.query(
          `
          UPDATE tryons
          SET isLatest = FALSE
          WHERE guestId = ? AND productId = ? AND isLatest = TRUE AND id != ?
          `,
          [existing.guestId, existing.productId, id]
        );
      }
    }
  }

  const [result] = await db.query(
    `
    UPDATE tryons
    SET
      userPhoto = ?,
      resultImage = ?,
      score = ?,
      recommendedSize = ?,
      notes = ?,
      isLatest = ?,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [
      tryonData.userPhoto || null,
      tryonData.resultImage || null,
      tryonData.score || null,
      tryonData.recommendedSize || null,
      tryonData.notes || null,
      tryonData.isLatest || false,
      id
    ]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await db.query(
    "DELETE FROM tryons WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

// Get tryon stats
async function getStats() {
  const [rows] = await db.query(`
    SELECT
      COUNT(*) as totalTryons,
      COUNT(DISTINCT userId) as uniqueUsers,
      COUNT(DISTINCT productId) as uniqueProducts,
      AVG(score) as averageScore
    FROM tryons
    WHERE score IS NOT NULL
  `);
  return rows[0];
}

module.exports = {
  findAll,
  findById,
  findByUserId,
  create,
  update,
  remove,
  getStats
};