/**
 * Core analysis engine.
 * Takes normalized rows and minimums config, returns structured report.
 */
export function analyzeData(rows, minimums) {
  // Build nested structure: BRE → Store → SKU → quantity
  const breMap = {};

  for (const row of rows) {
    const bre = row.bre || 'Без BRE';
    const store = row.store || 'Без точки';
    const sku = row.sku;
    const qty = row.quantity;

    if (!sku) continue;

    if (!breMap[bre]) breMap[bre] = {};
    if (!breMap[bre][store]) {
      breMap[bre][store] = {
        storeName: store,
        breName: bre,
        se: row.se || '',
        region: row.region || '',
        city: row.city || '',
        skus: {},
      };
    }

    // Aggregate quantities per SKU per store
    if (breMap[bre][store].skus[sku] === undefined) {
      breMap[bre][store].skus[sku] = 0;
    }
    breMap[bre][store].skus[sku] += qty;
  }

  // Build final report
  const breList = [];
  let totalStores = 0;
  let problemStores = 0;
  let totalSkuToDeliver = 0;
  const regionStats = {};

  for (const [breName, stores] of Object.entries(breMap)) {
    const storeList = [];
    let breProblems = 0;

    for (const [storeName, storeData] of Object.entries(stores)) {
      totalStores++;
      const skuDetails = [];
      let storeCritical = 0;
      let storeLow = 0;
      let storeOk = 0;

      for (const [skuName, qty] of Object.entries(storeData.skus)) {
        const minQty = getMinimum(skuName, minimums);
        const needed = Math.max(0, minQty - qty);
        const status = qty === 0 ? 'critical' : qty < minQty ? 'low' : 'ok';

        if (status === 'critical') storeCritical++;
        else if (status === 'low') storeLow++;
        else storeOk++;

        if (needed > 0) totalSkuToDeliver++;

        skuDetails.push({ sku: skuName, qty, minQty, needed, status });
      }

      // Sort: critical first, then low, then ok; within group by needed desc
      skuDetails.sort((a, b) => {
        const order = { critical: 0, low: 1, ok: 2 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return b.needed - a.needed;
      });

      const hasProblems = storeCritical > 0 || storeLow > 0;
      if (hasProblems) {
        problemStores++;
        breProblems++;
      }

      // Region stats
      const region = storeData.region || 'Без региона';
      if (!regionStats[region]) regionStats[region] = { problems: 0, total: 0 };
      regionStats[region].total++;
      if (hasProblems) regionStats[region].problems++;

      storeList.push({
        storeName,
        breName,
        se: storeData.se,
        region: storeData.region,
        city: storeData.city,
        skus: skuDetails,
        criticalCount: storeCritical,
        lowCount: storeLow,
        okCount: storeOk,
        hasProblems,
        problemCount: storeCritical + storeLow,
        worstStatus: storeCritical > 0 ? 'critical' : storeLow > 0 ? 'low' : 'ok',
      });
    }

    storeList.sort((a, b) => b.problemCount - a.problemCount);

    breList.push({
      breName,
      stores: storeList,
      totalStores: storeList.length,
      problemStores: breProblems,
      hasProblems: breProblems > 0,
    });
  }

  breList.sort((a, b) => b.problemStores - a.problemStores);

  // Find worst region & BRE
  const worstRegion = Object.entries(regionStats)
    .sort((a, b) => b[1].problems - a[1].problems)[0]?.[0] || '—';
  const worstBre = breList[0]?.breName || '—';

  // Collect all unique SKUs
  const allSkus = [...new Set(rows.map(r => r.sku).filter(Boolean))].sort();
  const allRegions = [...new Set(rows.map(r => r.region).filter(Boolean))].sort();
  const allCities = [...new Set(rows.map(r => r.city).filter(Boolean))].sort();
  const allBres = breList.map(b => b.breName);

  return {
    breList,
    stats: {
      totalStores,
      problemStores,
      totalSkuToDeliver,
      totalBre: breList.length,
      worstRegion,
      worstBre,
    },
    meta: { allSkus, allRegions, allCities, allBres },
  };
}

/** Get minimum for SKU from settings, with fuzzy matching */
function getMinimum(skuName, minimums) {
  if (!minimums || !skuName) return 0;
  const key = skuName.toLowerCase().trim();
  // Exact match first
  for (const [k, v] of Object.entries(minimums)) {
    if (k.toLowerCase().trim() === key) return Number(v) || 0;
  }
  // Partial match
  for (const [k, v] of Object.entries(minimums)) {
    if (key.includes(k.toLowerCase().trim()) || k.toLowerCase().trim().includes(key)) {
      return Number(v) || 0;
    }
  }
  return 0;
}

/** Filter report data based on active filters */
export function filterReport(breList, filters) {
  let result = breList;

  if (filters.bre) {
    result = result.filter(b => b.breName === filters.bre);
  }

  result = result.map(b => ({
    ...b,
    stores: b.stores.filter(s => {
      if (filters.store && !s.storeName.toLowerCase().includes(filters.store.toLowerCase())) return false;
      if (filters.region && s.region !== filters.region) return false;
      if (filters.city && s.city !== filters.city) return false;
      if (filters.status === 'critical' && s.worstStatus !== 'critical') return false;
      if (filters.status === 'low' && s.worstStatus === 'ok') return false;
      if (filters.status === 'problem' && !s.hasProblems) return false;
      return true;
    }).map(s => ({
      ...s,
      skus: s.skus.filter(sk => {
        if (filters.sku && !sk.sku.toLowerCase().includes(filters.sku.toLowerCase())) return false;
        return true;
      }),
    })),
  })).filter(b => b.stores.length > 0);

  return result;
}
