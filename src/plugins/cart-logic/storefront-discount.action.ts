import { LanguageCode, PromotionItemAction } from '@vendure/core';

export const STOREFRONT_DISCOUNT_ACTION = 'storefront_coupon_line_discount';

/** Coupon codes are compared case-insensitively, like Vendure does. */
export function couponCodesMatch(a: string, b: string): boolean {
    return a.toLowerCase() === b.toLowerCase();
}

/**
 * Used by the coupon promotions that addConfiguredItemToOrder creates on the fly. Each cart line
 * carries the coupon code and per-unit discount (minor units, VAT included) sent by the storefront;
 * this action applies that discount to the lines added with this promotion's coupon code.
 * Vendure only runs it while the coupon code is applied to the order.
 */
export const storefrontCouponDiscount = new PromotionItemAction({
    code: STOREFRONT_DISCOUNT_ACTION,
    description: [
        { languageCode: LanguageCode.en, value: 'Discount cart lines by the amount sent by the storefront for this coupon code' },
    ],
    args: {},
    execute(ctx, orderLine, args, state, promotion) {
        const { promotionCode, unitDiscount } = (orderLine.customFields ?? {}) as Record<string, any>;
        if (
            !promotion.couponCode ||
            typeof promotionCode !== 'string' ||
            !couponCodesMatch(promotionCode, promotion.couponCode) ||
            !(unitDiscount > 0)
        ) {
            return 0;
        }
        const discountWithTax = Math.min(unitDiscount, orderLine.unitPriceWithTax);
        // Adjustments are expressed in the channel's tax mode.
        return -(ctx.channel.pricesIncludeTax ? discountWithTax : discountWithTax / (1 + orderLine.taxRate / 100));
    },
});
