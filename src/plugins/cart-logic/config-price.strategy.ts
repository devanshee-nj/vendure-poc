import {
    Order,
    OrderItemPriceCalculationStrategy,
    PriceCalculationResult,
    ProductVariant,
    RequestContext,
} from '@vendure/core';

/**
 * Vendure calls this on every addItemToOrder / adjustOrderLine to decide the line's unit price.
 * Lines added by addConfiguredItemToOrder carry the price sent by the storefront (configPrice,
 * in minor units, VAT included); everything else uses the variant price.
 */
export class ConfigPriceStrategy implements OrderItemPriceCalculationStrategy {
    calculateUnitPrice(
        ctx: RequestContext,
        productVariant: ProductVariant,
        orderLineCustomFields: Record<string, any>,
        order: Order,
        quantity: number,
    ): PriceCalculationResult {
        const configPrice = orderLineCustomFields?.configPrice;
        if (typeof configPrice === 'number' && configPrice > 0) {
            return { price: configPrice, priceIncludesTax: true };
        }
        return { price: productVariant.listPrice, priceIncludesTax: productVariant.listPriceIncludesTax };
    }
}
