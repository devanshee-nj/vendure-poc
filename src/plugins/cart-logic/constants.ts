/**
 * A configured design SKU encodes every selection made in the storefront, e.g.
 * CLRN349_MS12MT0014MFCT01ST0000SF0202000000
 *   MS12   metal                 MT0014 band width 00 / ring size 14
 *   CT01   carat                 ST0000 stone type 00 / shape 00
 *   SF0202000000  clarity / colour / cut grade / certificate / polish
 */
const CONFIG_SKU_PATTERN = /^([A-Z0-9]+)_MS\d{2}MT\d{4}MF\d*CT\d{2}ST\d{4}SF\d*$/;

/** The design reference a SKU belongs to, e.g. "CLRN349" for "CLRN349_MS12…" or "CLRN349". */
export function designRefOf(sku: string): string {
    return sku.split('_')[0];
}

/** Returns an error message when configSku is not a valid configuration of the given variant, else undefined. */
export function validateConfigSku(configSku: string, variantSku: string): string | undefined {
    const match = CONFIG_SKU_PATTERN.exec(configSku);
    if (!match) {
        return `Invalid configuration SKU "${configSku}"`;
    }
    if (match[1] !== designRefOf(variantSku)) {
        return `Configuration SKU "${configSku}" does not belong to design ${designRefOf(variantSku)}`;
    }
}

export function getConfigSku(customFields?: Record<string, any>): string | undefined {
    const configSku = customFields?.configSku;
    return typeof configSku === 'string' && configSku.trim() ? configSku.trim() : undefined;
}
