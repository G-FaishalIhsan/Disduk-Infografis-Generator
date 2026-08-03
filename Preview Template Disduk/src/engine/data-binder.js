/**
 * Data Binder Module
 * Binds Common Data Model properties into Template HTML elements and Chart.js instances.
 */

export class DataBinder {
    bind(doc, populationData) {
        if (!doc || !populationData) return;

        // 1. Bind elements with explicit data-bind attribute
        const bindElements = doc.querySelectorAll('[data-bind]');
        bindElements.forEach(el => {
            const path = el.getAttribute('data-bind');
            const bindType = el.getAttribute('data-bind-type') || 'text';
            const value = this.resolvePath(populationData, path);

            if (value !== undefined && value !== null) {
                if (bindType === 'text') {
                    el.textContent = value;
                } else if (bindType === 'html') {
                    el.innerHTML = value;
                } else if (bindType === 'width') {
                    el.style.width = `${value}%`;
                } else if (bindType === 'attribute') {
                    const attrName = el.getAttribute('data-bind-attr');
                    if (attrName) el.setAttribute(attrName, value);
                }
            }
        });

        // 2. Execute template-specific JS binding hook if exposed
        const iframeWin = doc.defaultView || window;
        if (iframeWin && typeof iframeWin.updateTemplateData === 'function') {
            iframeWin.updateTemplateData(populationData);
        }

        // 3. Auto-update Chart.js instances if present in template iframe
        this.updateCharts(iframeWin, populationData);
    }

    resolvePath(obj, path) {
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    }

    updateCharts(iframeWin, data) {
        if (!iframeWin || !iframeWin.Chart) return;

        // Chart.js helper lookup
        const chartInstances = iframeWin.Chart.instances || {};
        Object.values(chartInstances).forEach(chart => {
            const canvasId = chart.canvas ? chart.canvas.id : '';

            if (canvasId === 'agePyramidChart') {
                chart.data.datasets[0].data = [
                    -data.umur.muda.pct,
                    -data.umur.produktif.pct,
                    -data.umur.tua.pct
                ];
                chart.data.datasets[1].data = [
                    data.umur.muda.pct,
                    data.umur.produktif.pct,
                    data.umur.tua.pct
                ];
                chart.update();
            } else if (canvasId === 'maritalChart') {
                chart.data.datasets[0].data = [
                    data.perkawinan.belum_kawin.pct,
                    data.perkawinan.kawin_catat.pct,
                    data.perkawinan.kawin_belum_catat.pct,
                    data.perkawinan.cerai_hidup.pct + data.perkawinan.cerai_mati.pct
                ];
                chart.update();
            } else if (canvasId === 'educationChart') {
                chart.data.datasets[0].data = [
                    data.pendidikan.belum_sekolah.pct,
                    data.pendidikan.sd.pct,
                    data.pendidikan.smp.pct,
                    data.pendidikan.sma.pct,
                    data.pendidikan.diploma.pct,
                    data.pendidikan.sarjana.pct
                ];
                chart.update();
            } else if (canvasId === 'religionChart') {
                chart.data.datasets[0].data = [
                    data.agama.islam.pct,
                    data.agama.kristen.pct,
                    data.agama.katolik.pct,
                    data.agama.hindu.pct,
                    data.agama.buddha.pct,
                    data.agama.khonghucu.pct
                ];
                chart.update();
            }
        });
    }
}
