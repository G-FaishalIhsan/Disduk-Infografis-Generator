/**
 * Analytics Engine Module (Phase 11.1 — Pure Analytics Engine)
 * Pure, stateless, deterministic computation layer that derives analytics
 * from an existing dataset.desaList without mutating original dataset.
 * NEVER generates synthetic data, mock data, or fake distributions.
 */

export class AnalyticsEngine {
    /**
     * Pure computation entry point.
     * Derives analytical metrics from dataset.desaList if present.
     * @param {Object} dataset - Raw normalized dataset object
     * @returns {Object} New dataset object enriched with `.analytics` property
     */
    static compute(dataset) {
        if (!dataset || typeof dataset !== 'object') {
            return dataset;
        }

        const desaList = Array.isArray(dataset.desaList) ? dataset.desaList : [];

        // Return empty analytics if no village data is present (e.g. legacy dataset)
        if (desaList.length === 0) {
            return {
                ...dataset,
                analytics: {
                    hasDesaData: false,
                    topDesaPenduduk: [],
                    bottomDesaPenduduk: [],
                    topDesaKK: [],
                    topDesaKTP: [],
                    topDesaKIA: [],
                    topDesaIKD: [],
                    topDesaAkta: [],
                    topDesaLuas: [],
                    topDesaKepadatan: [],
                    summary: null,
                    insights: null
                }
            };
        }

        // Return enriched dataset with pure computed analytics
        return {
            ...dataset,
            analytics: {
                hasDesaData: true,
                topDesaPenduduk: this.computeTop(desaList, 'totalPenduduk', 5),
                bottomDesaPenduduk: this.computeBottom(desaList, 'totalPenduduk', 5),
                topDesaKK: this.computeTop(desaList, 'kepalaKeluarga', 5),
                topDesaKTP: this.computeTop(desaList, 'wajibKtp', 5),
                topDesaKIA: this.computeTop(desaList, 'kia', 5),
                topDesaIKD: this.computeTop(desaList, 'ikd', 5),
                topDesaAkta: this.computeTop(desaList, 'akta', 5),
                topDesaLuas: this.computeTop(desaList, 'luas', 5),
                topDesaKepadatan: this.computeTop(desaList, 'kepadatan', 5),
                summary: this.computeSummary(desaList),
                insights: this.computeInsights(dataset)
            }
        };
    }

    /**
     * Extracts Top N items from a collection based on a specified numeric property
     */
    static computeTop(collection = [], property = 'totalPenduduk', limit = 5) {
        if (!Array.isArray(collection) || collection.length === 0) return [];
        return [...collection]
            .filter(item => item && typeof item[property] === 'number' && !isNaN(item[property]))
            .sort((a, b) => b[property] - a[property])
            .slice(0, limit)
            .map((item, idx) => ({
                rank: idx + 1,
                nama: item.nama || '',
                nilai: item[property] || 0,
                ...item
            }));
    }

    /**
     * Extracts Bottom N items from a collection based on a specified numeric property
     */
    static computeBottom(collection = [], property = 'totalPenduduk', limit = 5) {
        if (!Array.isArray(collection) || collection.length === 0) return [];
        return [...collection]
            .filter(item => item && typeof item[property] === 'number' && !isNaN(item[property]))
            .sort((a, b) => a[property] - b[property])
            .slice(0, limit)
            .map((item, idx) => ({
                rank: idx + 1,
                nama: item.nama || '',
                nilai: item[property] || 0,
                ...item
            }));
    }

    /**
     * Computes rank index for items in a collection based on property
     */
    static computeRanking(collection = [], property = 'totalPenduduk') {
        if (!Array.isArray(collection) || collection.length === 0) return [];
        return [...collection]
            .filter(item => item && typeof item[property] === 'number' && !isNaN(item[property]))
            .sort((a, b) => b[property] - a[property])
            .map((item, idx) => ({
                rank: idx + 1,
                nama: item.nama || '',
                nilai: item[property] || 0,
                ...item
            }));
    }

    /**
     * Calculates population density (population / area)
     */
    static computeDensity(population, area) {
        if (!population || !area || isNaN(population) || isNaN(area) || area <= 0) return 0;
        return Number((population / area).toFixed(2));
    }

    /**
     * Computes summary metrics across village collection
     */
    static computeSummary(collection = []) {
        if (!Array.isArray(collection) || collection.length === 0) return null;

        const totalDesa = collection.length;
        let totalPop = 0;
        let totalKK = 0;
        let totalKTP = 0;
        let totalKIA = 0;
        let totalIKD = 0;
        let totalAkta = 0;
        let totalArea = 0;

        let maxPop = -Infinity;
        let minPop = Infinity;
        let maxVillage = null;
        let minVillage = null;

        collection.forEach(item => {
            const pop = Number(item.totalPenduduk) || 0;
            totalPop += pop;
            totalKK += Number(item.kepalaKeluarga) || 0;
            totalKTP += Number(item.wajibKtp) || 0;
            totalKIA += Number(item.kia) || 0;
            totalIKD += Number(item.ikd) || 0;
            totalAkta += Number(item.akta) || 0;
            totalArea += Number(item.luas) || 0;

            if (pop > maxPop) {
                maxPop = pop;
                maxVillage = item.nama;
            }
            if (pop < minPop) {
                minPop = pop;
                minVillage = item.nama;
            }
        });

        const avgPop = totalDesa > 0 ? Math.round(totalPop / totalDesa) : 0;
        const avgDensity = totalArea > 0 ? Number((totalPop / totalArea).toFixed(2)) : 0;

        return {
            totalDesa,
            averagePopulation: avgPop,
            averageDensity: avgDensity,
            maxPopulation: maxPop === -Infinity ? 0 : maxPop,
            minPopulation: minPop === Infinity ? 0 : minPop,
            maxVillage: maxVillage || '-',
            minVillage: minVillage || '-',
            totalPopulation: totalPop,
            totalKK,
            totalKTP,
            totalKIA,
            totalIKD,
            totalAkta
        };
    }

    /**
     * Generates lightweight analytical insights from calculated metrics
     */
    static computeInsights(dataset = {}) {
        const desaList = Array.isArray(dataset.desaList) ? dataset.desaList : [];
        if (desaList.length === 0) return null;

        const sortedByDensity = this.computeTop(desaList, 'kepadatan', 1);
        const sortedByArea = this.computeTop(desaList, 'luas', 1);
        const sortedByPopTop = this.computeTop(desaList, 'totalPenduduk', 1);
        const sortedByPopBot = this.computeBottom(desaList, 'totalPenduduk', 1);
        const summary = this.computeSummary(desaList);

        return {
            desaTerpadat: sortedByDensity[0] ? `${sortedByDensity[0].nama} (${sortedByDensity[0].kepadatan} Jiwa/km²)` : '-',
            desaTerluas: sortedByArea[0] ? `${sortedByArea[0].nama} (${sortedByArea[0].luas} km²)` : '-',
            desaPendudukTerbanyak: sortedByPopTop[0] ? `${sortedByPopTop[0].nama} (${sortedByPopTop[0].totalPenduduk.toLocaleString('id-ID')} jiwa)` : '-',
            desaPendudukTersedikit: sortedByPopBot[0] ? `${sortedByPopBot[0].nama} (${sortedByPopBot[0].totalPenduduk.toLocaleString('id-ID')} jiwa)` : '-',
            rataPendudukPerDesa: summary ? `${summary.averagePopulation.toLocaleString('id-ID')} jiwa/desa` : '-',
            rataKepadatan: summary ? `${summary.averageDensity} Jiwa/km²` : '-'
        };
    }
}
