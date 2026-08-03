/**
 * Donut Chart Module (Phase 7 Chart Preparation)
 */
export class DonutChart {
    static render(ctx, data, options = {}) {
        if (!ctx || !window.Chart) return null;
        return new window.Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: Object.assign({ responsive: true, cutout: '72%', plugins: { legend: { display: false } } }, options)
        });
    }
}
