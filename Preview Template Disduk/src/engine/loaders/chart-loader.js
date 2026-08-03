/**
 * Chart Loader Module
 * Ensures Chart.js instances, progress bar animations, and dynamic visual graphics
 * are completely rendered, static, and settled before canvas capture.
 */

export class ChartLoader {
    async ensureSettled(targetWindow = window) {
        // 1. If Chart.js instances exist in targetWindow, disable animations temporarily for static capture
        if (targetWindow.Chart && targetWindow.Chart.instances) {
            Object.values(targetWindow.Chart.instances).forEach(chart => {
                if (chart && chart.options) {
                    chart.options.animation = false;
                    chart.update('none');
                }
            });
        }

        // 2. Allow 2 animation frames for canvas charts & CSS progress bars to stabilize
        await new Promise(resolve => {
            if (targetWindow.requestAnimationFrame) {
                targetWindow.requestAnimationFrame(() => {
                    targetWindow.requestAnimationFrame(resolve);
                });
            } else {
                setTimeout(resolve, 80);
            }
        });

        return true;
    }
}
