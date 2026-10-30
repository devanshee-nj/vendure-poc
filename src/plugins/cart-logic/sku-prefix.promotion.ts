import { LanguageCode, OrderLine, PromotionCondition, PromotionItemAction } from '@vendure/core';

/**
 * True when the line's SKU starts with one of the prefixes (case-insensitive). Both the configured
 * SKU on the line (CLRN349_MS12…) and the variant SKU (CLRN349_X7K2…) are checked.
 */
function lineMatchesPrefix(line: OrderLine, prefixes: string[]): boolean {
    const skus = [(line.customFields as Record<string, any>)?.configSku, line.productVariant?.sku]
        .filter((sku): sku is string => typeof sku === 'string')
        .map(sku => sku.toUpperCase());
    return prefixes
        .map(prefix => prefix.trim().toUpperCase())
        .some(prefix => prefix && skus.some(sku => sku.startsWith(prefix)));
}

export const hasSkuPrefix = new PromotionCondition({
    code: 'at_least_n_with_sku_prefix',
    description: [{ languageCode: LanguageCode.en, value: 'Buy at least { minimum } products whose SKU starts with the given prefixes' }],
    args: {
        minimum: { type: 'int', defaultValue: 1 },
        prefixes: { type: 'string', list: true, label: [{ languageCode: LanguageCode.en, value: 'SKU prefixes, e.g. CLRN349' }] },
    },
    check(ctx, order, args) {
        const matches = order.lines
            .filter(line => lineMatchesPrefix(line, args.prefixes))
            .reduce((sum, line) => sum + line.quantity, 0);
        return args.minimum >= 1 && matches >= args.minimum;
    },
});

export const skuPrefixPercentageDiscount = new PromotionItemAction({
    code: 'sku_prefix_percentage_discount',
    description: [{ languageCode: LanguageCode.en, value: 'Discount products whose SKU starts with the given prefixes by { discount }%' }],
    args: {
        discount: { type: 'float', ui: { component: 'number-form-input', suffix: '%' } },
        prefixes: { type: 'string', list: true, label: [{ languageCode: LanguageCode.en, value: 'SKU prefixes, e.g. CLRN349' }] },
    },
    execute(ctx, orderLine, args) {
        if (!lineMatchesPrefix(orderLine, args.prefixes)) {
            return 0;
        }
        const unitPrice = ctx.channel.pricesIncludeTax ? orderLine.unitPriceWithTax : orderLine.unitPrice;
        return -unitPrice * (args.discount / 100);
    },
});
