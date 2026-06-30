'use strict';

const pool = require('../config/db');

const TDS_RATE          = 1.00;   // % Section 194-O
const TDS_THRESHOLD     = 500000; // ₹5L per FY per caterer
const GST_ON_COMMISSION = 18.00;  // % on commission amount

function currentFinancialYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 4 ? `${year}-${String(year + 1).slice(2)}` : `${year - 1}-${String(year).slice(2)}`;
}

function currentQuarter() {
  const month = new Date().getMonth() + 1;
  if (month >= 4 && month <= 6)  return 1;
  if (month >= 7 && month <= 9)  return 2;
  if (month >= 10 && month <= 12) return 3;
  return 4;
}

async function getCatererEarningsForPeriod(catererId, periodFrom, periodTo) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int                                          AS order_count,
       COALESCE(SUM(co.subtotal), 0)                        AS gross_amount,
       COALESCE(SUM(co.commission_amount), 0)               AS commission_amount,
       COALESCE(SUM(co.platform_fee), 0)                    AS platform_fee,
       COALESCE(SUM(co.caterer_payout), 0)                  AS caterer_payout,
       array_agg(co.id) FILTER (WHERE co.id IS NOT NULL)   AS order_ids
     FROM caterer_orders co
     WHERE co.caterer_id = $1
       AND co.status IN ('DELIVERED', 'COLLECTED')
       AND co.settlement_status = 'PENDING'
       AND co.created_at >= $2
       AND co.created_at <  $3`,
    [catererId, periodFrom, periodTo]
  );
  return rows[0];
}

async function getCatererYtdGross(catererId, financialYear) {
  const [fromYear] = financialYear.split('-');
  const fyStart = `${fromYear}-04-01`;
  const fyEnd   = `${parseInt(fromYear) + 1}-04-01`;

  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(co.subtotal), 0) AS ytd_gross
     FROM caterer_orders co
     WHERE co.caterer_id = $1
       AND co.status IN ('DELIVERED', 'COLLECTED')
       AND co.created_at >= $2
       AND co.created_at <  $3`,
    [catererId, fyStart, fyEnd]
  );
  return parseFloat(rows[0].ytd_gross);
}

async function createSettlement(adminId, catererId, periodFrom, periodTo) {
  const earnings = await getCatererEarningsForPeriod(catererId, periodFrom, periodTo);
  if (!earnings.order_count) throw Object.assign(new Error('No unsettled delivered orders in this period'), { status: 400 });

  const fy           = currentFinancialYear();
  const quarter      = currentQuarter();
  const ytdGross     = await getCatererYtdGross(catererId, fy);

  const gross            = parseFloat(earnings.gross_amount);
  const commissionAmt    = parseFloat(earnings.commission_amount);
  const platformFee      = parseFloat(earnings.platform_fee);
  const gstOnCommission  = parseFloat(((commissionAmt * GST_ON_COMMISSION) / 100).toFixed(2));

  // TDS only kicks in once caterer crosses ₹5L in the FY
  let tdsAmount = 0;
  if (ytdGross >= TDS_THRESHOLD) {
    tdsAmount = parseFloat(((gross * TDS_RATE) / 100).toFixed(2));
  }

  const netPayout = parseFloat((gross - commissionAmt - platformFee - gstOnCommission - tdsAmount).toFixed(2));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [settlement] } = await client.query(
      `INSERT INTO settlement_records
         (caterer_id, period_from, period_to, gross_amount, commission_amount, platform_fee,
          tds_deducted, gst_on_commission, net_payout, order_count, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', $11)
       RETURNING *`,
      [catererId, periodFrom, periodTo, gross, commissionAmt, platformFee,
       tdsAmount, gstOnCommission, netPayout, earnings.order_count, adminId]
    );

    // Mark orders as settled
    if (earnings.order_ids?.length) {
      await client.query(
        `UPDATE caterer_orders SET
           settlement_id     = $1,
           settlement_status = 'SETTLED',
           settled_at        = NOW()
         WHERE id = ANY($2)`,
        [settlement.id, earnings.order_ids]
      );
    }

    // Record TDS deduction
    if (tdsAmount > 0) {
      await client.query(
        `INSERT INTO tds_deductions (caterer_id, financial_year, quarter, gross_amount, tds_rate, tds_amount, settlement_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [catererId, fy, quarter, gross, TDS_RATE, tdsAmount, settlement.id]
      );
    }

    // Generate commission invoice if commission was charged
    if (commissionAmt > 0) {
      const invoiceNumber = `INV-${Date.now()}-${catererId.slice(0, 6).toUpperCase()}`;
      const totalGst      = gstOnCommission;
      const cgst          = parseFloat((totalGst / 2).toFixed(2));
      await client.query(
        `INSERT INTO tax_invoices
           (invoice_number, invoice_type, party_id, settlement_id, taxable_amount, gst_rate,
            cgst_amount, sgst_amount, total_amount, financial_year, invoice_date)
         VALUES ($1, 'COMMISSION_INVOICE', $2, $3, $4, $5, $6, $6, $7, $8, CURRENT_DATE)`,
        [invoiceNumber, catererId, settlement.id, commissionAmt, GST_ON_COMMISSION, cgst,
         commissionAmt + totalGst, fy]
      );
    }

    await client.query('COMMIT');
    return settlement;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function markSettlementPaid(settlementId, adminId, { utr_number, payment_method }) {
  const { rows } = await pool.query(
    `UPDATE settlement_records SET
       status         = 'COMPLETED',
       utr_number     = $1,
       payment_method = $2,
       settled_at     = NOW(),
       updated_at     = NOW()
     WHERE id = $3 AND status = 'PENDING'
     RETURNING *`,
    [utr_number, payment_method || 'NEFT', settlementId]
  );
  if (!rows[0]) throw Object.assign(new Error('Settlement not found or already completed'), { status: 404 });
  return rows[0];
}

async function adminListSettlements({ caterer_id, status = 'all', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const vals = [];
  let i = 1;

  if (status !== 'all') { conditions.push(`s.status = $${i++}`); vals.push(status.toUpperCase()); }
  if (caterer_id)        { conditions.push(`s.caterer_id = $${i++}`); vals.push(caterer_id); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  vals.push(limit); vals.push(offset);

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT s.*, u.name AS caterer_name, u.email
       FROM settlement_records s
       JOIN users u ON u.id = s.caterer_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${i++} OFFSET $${i}`,
      vals
    ),
    pool.query(
      `SELECT COUNT(*) FROM settlement_records s ${where}`,
      vals.slice(0, -2)
    )
  ]);

  return { items: dataRes.rows, total: parseInt(countRes.rows[0].count) };
}

async function getSettlementSummary() {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'PENDING')   AS pending_count,
       COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_count,
       COALESCE(SUM(net_payout) FILTER (WHERE status = 'PENDING'),   0) AS pending_amount,
       COALESCE(SUM(net_payout) FILTER (WHERE status = 'COMPLETED'), 0) AS paid_amount,
       COALESCE(SUM(tds_deducted), 0) AS total_tds,
       COALESCE(SUM(commission_amount), 0) AS total_commission
     FROM settlement_records`
  );
  return rows[0];
}

async function getCatererSettlements(catererId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT * FROM settlement_records WHERE caterer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [catererId, limit, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM settlement_records WHERE caterer_id = $1`, [catererId])
  ]);
  return { items: dataRes.rows, total: parseInt(countRes.rows[0].count) };
}

module.exports = {
  getCatererEarningsForPeriod, createSettlement, markSettlementPaid,
  adminListSettlements, getSettlementSummary, getCatererSettlements
};
