/**
 * Dataset Service Module (Phase 7 Foundation — Stabilization)
 * Abstraction layer between Templates/UI and Dataset Engine.
 * Templates call DatasetService.getActiveDataset() or DatasetService.getTemplateDataObject(district)
 * without needing to know storage paths, Excel readers, or parsing details.
 */
import { DataBinderV2 } from './data-binder-v2.js';

export class DatasetService {
    static activePayload = null;

    /**
     * Sets the current active dataset payload
     * @param {Object} payload 
     */
    static setActiveDataset(payload) {
        this.activePayload = payload;
    }

    /**
     * Gets the active dataset payload
     * @returns {Object|null}
     */
    static getActiveDataset() {
        return this.activePayload;
    }

    /**
     * Generates a Single Source of Truth Template Data Object for a given district/region
     * @param {string} targetDistrict 
     * @returns {Object}
     */
    static getTemplateDataObject(targetDistrict = 'SINGAPARNA') {
        return DataBinderV2.buildTemplateDataObject(this.activePayload, targetDistrict);
    }
}
